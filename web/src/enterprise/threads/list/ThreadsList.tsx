import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import AlertOutlineIcon from 'mdi-react/AlertOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import React, { useMemo, useState } from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../shared/src/util/errors'
import { fetchDiscussionThreads } from '../../../discussions/backend'
import { nounForThreadKind } from '../util'
import { ThreadsListHeader } from './ThreadsListHeader'
import { ThreadsListHeaderFilterButtonDropdown } from './ThreadsListHeaderFilterButtonDropdown'
import { ThreadsListItem } from './ThreadsListItem'

interface Props {
    kind: GQL.DiscussionThreadKind

    query: string
    onQueryChange: (query: string) => void

    history: H.History
    location: H.Location
}

const LOADING: 'loading' = 'loading'

/**
 * The list of threads with a header.
 */
export const ThreadsList: React.FunctionComponent<Props> = ({ kind, query, onQueryChange, ...props }) => {
    const [threadsOrError, setThreadsOrError] = useState<typeof LOADING | GQL.IDiscussionThreadConnection | ErrorLike>(
        LOADING
    )

    // tslint:disable-next-line: no-floating-promises because fetchDiscussionThreads never throws
    useMemo(async () => {
        try {
            setThreadsOrError(await fetchDiscussionThreads({ query }).toPromise())
        } catch (err) {
            setThreadsOrError(asError(err))
        }
    }, [query])

    return (
        <div className="threads-list">
            <ThreadsListHeader {...props} kind={kind} query={query} onQueryChange={onQueryChange} />
            <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between">
                    <div className="form-check mx-2">
                        <input className="form-check-input position-static" type="checkbox" aria-label="Select item" />
                    </div>
                    <div className="font-weight-normal flex-1">
                        <strong>
                            <AlertOutlineIcon className="icon-inline" />{' '}
                            {threadsOrError !== LOADING && !isErrorLike(threadsOrError)
                                ? `${threadsOrError.totalCount} open`
                                : 'Open'}{' '}
                            &nbsp;{' '}
                        </strong>
                        <CheckIcon className="icon-inline" /> 0 closed
                    </div>
                    <div>
                        <ThreadsListHeaderFilterButtonDropdown
                            header="Filter by who's assigned"
                            items={['sqs (you)', 'ekonev', 'jleiner', 'ziyang', 'kting7', 'ffranksena']}
                        >
                            Assignee
                        </ThreadsListHeaderFilterButtonDropdown>
                        <ThreadsListHeaderFilterButtonDropdown
                            header="Filter by label"
                            items={[
                                'perf',
                                'tech-lead',
                                'services',
                                'bugs',
                                'build',
                                'noisy',
                                'security',
                                'appsec',
                                'infosec',
                                'compliance',
                                'docs',
                            ]}
                        >
                            Labels
                        </ThreadsListHeaderFilterButtonDropdown>
                        <ThreadsListHeaderFilterButtonDropdown
                            header="Sort by"
                            items={['Priority', 'Most recently updated', 'Least recently updated']}
                        >
                            Sort
                        </ThreadsListHeaderFilterButtonDropdown>
                    </div>
                </div>
                {threadsOrError === LOADING ? (
                    <LoadingSpinner className="mt-2" />
                ) : isErrorLike(threadsOrError) ? (
                    <div className="alert alert-error mt-2">{threadsOrError.message}</div>
                ) : threadsOrError.nodes.length === 0 ? (
                    <p className="p-2 mb-0 text-muted">No {nounForThreadKind(kind, true)} found.</p>
                ) : (
                    <ul className="list-group list-group-flush">
                        {threadsOrError.nodes.map((thread, i) => (
                            <ThreadsListItem key={i} location={props.location} thread={thread} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
