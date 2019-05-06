package graphqlbackend

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	otlog "github.com/opentracing/opentracing-go/log"
	"github.com/pkg/errors"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/pkg/search"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/pkg/search/query"
	"github.com/sourcegraph/sourcegraph/pkg/env"
	"github.com/sourcegraph/sourcegraph/pkg/errcode"
	"github.com/sourcegraph/sourcegraph/pkg/trace"
)

// codemodSearchResultResolver is a resolver for the GraphQL type `CodemodSearchResult`
type codemodSearchResultResolver struct {
	commit      *gitCommitResolver
	diffPreview *highlightedString
	icon        string
	label       string
	url         string
	detail      string
	matches     []*searchResultMatchResolver
}

func (r *codemodSearchResultResolver) Codemod() *gitCodemodResolver       { return r.codemod }
func (r *codemodSearchResultResolver) Refs() []*gitRefResolver            { return r.refs }
func (r *codemodSearchResultResolver) SourceRefs() []*gitRefResolver      { return r.sourceRefs }
func (r *codemodSearchResultResolver) MessagePreview() *highlightedString { return r.messagePreview }
func (r *codemodSearchResultResolver) DiffPreview() *highlightedString    { return r.diffPreview }
func (r *codemodSearchResultResolver) Icon() string {
	return r.icon
}
func (r *codemodSearchResultResolver) Label() *markdownResolver {
	return &markdownResolver{text: r.label}
}

func (r *codemodSearchResultResolver) URL() string {
	return r.url
}

func (r *codemodSearchResultResolver) Detail() *markdownResolver {
	return &markdownResolver{text: r.detail}
}

func (r *codemodSearchResultResolver) Matches() []*searchResultMatchResolver {
	return r.matches
}

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
		unflattened [][]*codemodSearchResultResolver
		common      = &searchResultsCommon{}
	)
	for _, repoRev := range args.Repos {
		wg.Add(1)
		go func(repoRev search.RepositoryRevisions) {
			defer wg.Done()
			results, repoLimitHit, repoTimedOut, searchErr := callCodemodInRepo(ctx, repoRev, args.Pattern, args.Query)
			if ctx.Err() == context.Canceled {
				// Our request has been canceled (either because another one of args.repos had a
				// fatal error, or otherwise), so we can just ignore these results.
				return
			}
			repoTimedOut = repoTimedOut || ctx.Err() == context.DeadlineExceeded
			if searchErr != nil {
				tr.LogFields(otlog.String("repo", string(repoRev.Repo.Name)), otlog.String("searchErr", searchErr.Error()), otlog.Bool("timeout", errcode.IsTimeout(searchErr)), otlog.Bool("temporary", errcode.IsTemporary(searchErr)))
			}
			mu.Lock()
			defer mu.Unlock()
			if fatalErr := handleRepoSearchResult(common, repoRev, repoLimitHit, repoTimedOut, searchErr); fatalErr != nil {
				err = errors.Wrapf(searchErr, "failed to search codemod log %s", repoRev.String())
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

	var flattened []*codemodSearchResultResolver
	for _, results := range unflattened {
		flattened = append(flattened, results...)
	}
	return codemodSearchResultsToSearchResults(flattened), common, nil
}

func codemodSearchResultsToSearchResults(results []*codemodSearchResultResolver) []*searchResultResolver {
	// // Show most recent codemods first.
	// sort.Slice(results, func(i, j int) bool {
	// 	return results[i].codemod.author.Date() > results[j].codemod.author.Date()
	// })

	results2 := make([]*searchResultResolver, len(results))
	for i, result := range results {
		results2[i] = &searchResultResolver{diff: result}
	}
	return results2
}

var replacerURL = env.Get("REPLACER_URL", "k8s+http://replacer:3185", "replacer server URL")

func callCodemodInRepo(ctx context.Context, repoRevs search.RepositoryRevisions, info *search.PatternInfo, query *query.Query) (results []*codemodSearchResultResolver, limitHit, timedOut bool, err error) {
	replacementValues, _ := args.Query.StringValues(query.FieldReplace)
	replacementText := replacementValues[0]

	tr, ctx := trace.New(ctx, "callCodemodInRepo", fmt.Sprintf("repoRevs: %v, pattern %+v, replace: %+v", repoRevs, info.Pattern, replacementText))
	defer func() {
		tr.LazyPrintf("%d results, limitHit=%v, timedOut=%v", len(results), limitHit, timedOut)
		tr.SetError(err)
		tr.Finish()
	}()

	u, err := url.Parse(replacerURL)
	if err != nil {
		return nil, false, false, err
	}
	u.Query.Set("repo", repoRevs.Repo.Name)
	u.Query.Set("commit", repoRevs.Revs[0].RevSpec)
	u.Query.Set("matchtemplate", op.info)
	req, err := http.NewRequest("GET", u.String(), nil)
	// http://127.0.0.1:3185/?repo=github.com/<repo>&commit=<commit>&matchtemplate=foo&rewritetemplate=bar&fileextension=.go
}
