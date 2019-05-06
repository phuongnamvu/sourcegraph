package graphqlbackend

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"sync"

	"github.com/opentracing-contrib/go-stdlib/nethttp"
	"github.com/opentracing/opentracing-go"
	otlog "github.com/opentracing/opentracing-go/log"
	"github.com/pkg/errors"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/pkg/search"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/pkg/search/query"
	"github.com/sourcegraph/sourcegraph/pkg/env"
	"github.com/sourcegraph/sourcegraph/pkg/errcode"
	"github.com/sourcegraph/sourcegraph/pkg/trace"
	"github.com/sourcegraph/sourcegraph/pkg/vcs/git"
	"golang.org/x/net/context/ctxhttp"
)

func callCodemod(ctx context.Context, args *search.Args) ([]*searchResultResolver, *searchResultsCommon, error) {
	replacementValues, _ := args.Query.StringValues(query.FieldReplace)
	replacementText := replacementValues[0]

	var err error
	tr, ctx := trace.New(ctx, "callCodemod", fmt.Sprintf("pattern: %+v, replace: %+v, numRepoRevs: %d", args.Pattern, replacementText, len(args.Repos)))
	defer func() {
		tr.SetError(err)
		tr.Finish()
	}()

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	var (
		wg          sync.WaitGroup
		mu          sync.Mutex
		unflattened [][]*fileMatchResolver
		common      = &searchResultsCommon{}
	)
	for _, repoRev := range args.Repos {
		wg.Add(1)
		go func(repoRev search.RepositoryRevisions) {
			defer wg.Done()
			results, searchErr := callCodemodInRepo(ctx, repoRev, args.Pattern, args.Query, replacementText)
			if ctx.Err() == context.Canceled {
				// Our request has been canceled (either because another one of args.repos had a
				// fatal error, or otherwise), so we can just ignore these results.
				return
			}
			repoTimedOut := ctx.Err() == context.DeadlineExceeded
			if searchErr != nil {
				tr.LogFields(otlog.String("repo", string(repoRev.Repo.Name)), otlog.String("searchErr", searchErr.Error()), otlog.Bool("timeout", errcode.IsTimeout(searchErr)), otlog.Bool("temporary", errcode.IsTemporary(searchErr)))
			}
			mu.Lock()
			defer mu.Unlock()
			if fatalErr := handleRepoSearchResult(common, repoRev, false, repoTimedOut, searchErr); fatalErr != nil {
				err = errors.Wrapf(searchErr, "failed to call codemod %s", repoRev.String())
				cancel()
			}
			if len(results) > 0 {
				unflattened = append(unflattened, results)
			}
		}(*repoRev)
	}
	wg.Wait()
	if err != nil {
		return nil, nil, err
	}

	flattened := flattenFileMatches(unflattened, int(args.Pattern.FileMatchLimit))
	results := make([]*searchResultResolver, len(flattened))
	for i, fm := range flattened {
		results[i] = &searchResultResolver{fileMatch: fm}
	}
	return results, common, nil
}

var replacerURL = env.Get("REPLACER_URL", "http://replacer:3185", "replacer server URL")

func callCodemodInRepo(ctx context.Context, repoRevs search.RepositoryRevisions, info *search.PatternInfo, query *query.Query, replacementText string) (results []*fileMatchResolver, err error) {
	tr, ctx := trace.New(ctx, "callCodemodInRepo", fmt.Sprintf("repoRevs: %v, pattern %+v, replace: %+v", repoRevs, info.Pattern, replacementText))
	defer func() {
		tr.LazyPrintf("%d results", len(results))
		tr.SetError(err)
		tr.Finish()
	}()

	// Do not trigger a repo-updater lookup (e.g.,
	// backend.{GitRepo,Repos.ResolveRev}) because that would slow this operation
	// down by a lot (if we're looping over many repos). This means that it'll fail if a
	// repo is not on gitserver.
	commit, err := git.ResolveRevision(ctx, repoRevs.GitserverRepo(), nil, repoRevs.Revs[0].RevSpec, &git.ResolveRevisionOptions{NoEnsureRevision: true})
	if err != nil {
		return nil, err
	}

	u, err := url.Parse(replacerURL)
	if err != nil {
		return nil, err
	}
	q := u.Query()
	q.Set("repo", string(repoRevs.Repo.Name))
	q.Set("commit", string(commit))
	q.Set("matchtemplate", info.Pattern)
	q.Set("rewritetemplate", replacementText)
	q.Set("fileextension", ".go") // TODO!(sqs): un-hardcode
	u.RawQuery = q.Encode()

	log.Println("CODEMOD URL", u.String())
	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		return nil, err
	}
	req = req.WithContext(ctx)

	req, ht := nethttp.TraceRequest(opentracing.GlobalTracer(), req,
		nethttp.OperationName("Codemod client"),
		nethttp.ClientTrace(false))
	defer ht.Finish()

	resp, err := ctxhttp.Do(ctx, searchHTTPClient, req)
	if err != nil {
		// If we failed due to cancellation or timeout (with no partial results in the response
		// body), return just that.
		if ctx.Err() != nil {
			err = ctx.Err()
		}
		return nil, errors.Wrap(err, "codemod request failed")
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		return nil, errors.WithStack(&searcherError{StatusCode: resp.StatusCode, Message: string(body)})
	}

	type rawCodemodResult struct {
		URI                  string `json:"uri"`
		RewrittenSource      string `json:"rewritten_source"`
		InPlaceSubstitutions []struct {
			Range struct {
				Start struct{ Offset int64 }
				End   struct{ Offset int64 }
			}
			ReplacementContent string `json:"replacement_content"`
		} `json:"in_place_substitutions"`
		Diff string
	}
	var rawResults []*rawCodemodResult
	decoder := json.NewDecoder(resp.Body)
	for decoder.More() {
		var rawResult *rawCodemodResult
		if err := decoder.Decode(&rawResult); err != nil {
			return nil, errors.Wrap(err, "replacer response invalid")
		}
		if len(rawResult.InPlaceSubstitutions) == 0 {
			continue
		}
		rawResults = append(rawResults, rawResult)
	}
	results = make([]*fileMatchResolver, len(rawResults))
	for i, raw := range rawResults {

		results[i] = &fileMatchResolver{
			JPath:        raw.URI,
			JLineMatches: nil, // TODO!(sqs)
			uri:          fileMatchURI(repoRevs.Repo.Name, repoRevs.Revs[0].RevSpec, raw.URI),
			repo:         repoRevs.Repo,
			commitID:     commit,
		}
	}
	return results, nil
}
