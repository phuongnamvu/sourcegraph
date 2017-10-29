package graphqlbackend

import (
	"context"
	"regexp"
	"strings"
)

func (r *searchResolver2) Results(ctx context.Context) (*searchResults, error) {
	repos, _, err := r.resolveRepositories(ctx, nil)
	if err != nil {
		return nil, err
	}

	// TODO(sqs): The combination behavior of terms and regexps is not intuitive.
	// A line is matched iff it contains ALL (non-regexp) terms in order OR if
	// it matches ANY of the regexps. To illustrate why this is weird, given any
	// query, (1) adding a term constrains the result set but (2) adding a regexp
	// expands the result set. This is not a critical issue, but it should be
	// made consistent.
	var patternsToCombine []string
	if termPattern := patternForQueryTerms(r.query.fieldValues[""]); termPattern != "" {
		patternsToCombine = append(patternsToCombine, termPattern)
	}
	for _, pattern := range r.query.fieldValues[searchFieldRegExp] {
		patternsToCombine = append(patternsToCombine, pattern)
	}

	args := repoSearchArgs{
		Query: &patternInfo{
			IsRegExp:                     true,
			IsCaseSensitive:              r.query.isCaseSensitive(),
			FileMatchLimit:               300,
			Pattern:                      unionRegExps(patternsToCombine),
			IncludePatterns:              r.query.fieldValues[searchFieldFile],
			PathPatternsAreRegExps:       true,
			PathPatternsAreCaseSensitive: r.query.isCaseSensitive(),
		},
		Repositories: repos,
	}
	if excludePatterns := r.query.fieldValues[minusField(searchFieldFile)]; len(excludePatterns) > 0 {
		pat := unionRegExps(excludePatterns)
		args.Query.ExcludePattern = &pat
	}

	return r.root.SearchRepos(ctx, &args)
}

// patternForQueryTerms returns a regexp that matches lines containing all of the
// terms in order.
func patternForQueryTerms(terms []string) string {
	if len(terms) == 0 {
		return ""
	}

	escapedTerms := make([]string, len(terms))
	for i, term := range terms {
		escapedTerms[i] = regexp.QuoteMeta(term)
	}
	return strings.Join(escapedTerms, ".*?") // "?" makes it prefer shorter matches
}
