import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import AlertOutlineIcon from 'mdi-react/AlertOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import React, { useMemo, useState } from 'react'
import { of } from 'rxjs'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../../shared/src/util/errors'
import { PullRequestStatusItem } from './PullRequestStatusItem'
import { ThreadStatusItemsListHeaderFilterButtonDropdown } from './ThreadStatusItemsListHeaderFilterButtonDropdown'

const DATA: { repo: string; prNumber: number; status: 'open' | 'merged' | 'closed'; updatedAt: string }[] = [
    {
        repo: 'github.com/sourcegraph/go-diff',
        prNumber: 87,
        status: 'open',
        updatedAt: new Date(Date.now() - 10000000).toISOString(),
    },
    {
        repo: 'github.com/sourcegraph/codeintellify',
        prNumber: 1841,
        status: 'open',
        updatedAt: new Date(Date.now() - 5000000).toISOString(),
    },
    {
        repo: 'github.com/sourcegraph/csp',
        prNumber: 9,
        status: 'closed',
        updatedAt: new Date(Date.now() - 9300000).toISOString(),
    },
    {
        repo: 'github.com/sourcegraph/sitemap',
        prNumber: 48,
        status: 'closed',
        updatedAt: new Date(Date.now() - 4100000).toISOString(),
    },
    {
        repo: 'github.com/sourcegraph/sourcegraph-lightstep',
        prNumber: 51,
        status: 'merged',
        updatedAt: new Date(Date.now() - 7100000).toISOString(),
    },
    {
        repo: 'github.com/sourcegraph/docsite',
        prNumber: 149,
        status: 'merged',
        updatedAt: new Date(Date.now() - 3500000).toISOString(),
    },
    {
        repo: 'github.com/sourcegraph/thyme',
        prNumber: 147,
        status: 'merged',
        updatedAt: new Date(Date.now() - 100000).toISOString(),
    },
    {
        repo: 'github.com/sourcegraph/sourcegraph-git-extras',
        prNumber: 511,
        status: 'merged',
        updatedAt: new Date(Date.now() - 6200000).toISOString(),
    },
]

const queryStatusItems = () => of({ nodes: DATA, totalCount: DATA.length })

interface Props {
    thread: Pick<GQL.IDiscussionThread, 'id'>

    history: H.History
    location: H.Location
}

const LOADING: 'loading' = 'loading'

/**
 * The list of thread status items.
 */
export const ThreadStatusItemsList: React.FunctionComponent<Props> = ({ thread: { id: threadID } }) => {
    const [itemsOrError, setThreadsOrError] = useState<
        typeof LOADING | { nodes: typeof DATA; totalCount: number } | ErrorLike
    >(LOADING)

    // tslint:disable-next-line: no-floating-promises because queryStatusItems never throws
    useMemo(async () => {
        try {
            setThreadsOrError(await queryStatusItems(threadID).toPromise())
        } catch (err) {
            setThreadsOrError(asError(err))
        }
    }, [threadID])

    return (
        <div className="thread-status-items-list">
            <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between">
                    <div className="form-thread mx-2">
                        <input className="form-thread-input position-static" type="checkbox" aria-label="Select item" />
                    </div>
                    <div className="font-weight-normal flex-1">
                        <strong>
                            <AlertOutlineIcon className="icon-inline" />{' '}
                            {itemsOrError !== LOADING && !isErrorLike(itemsOrError)
                                ? `${itemsOrError.totalCount} open`
                                : 'Open'}{' '}
                            &nbsp;{' '}
                        </strong>
                        <CheckIcon className="icon-inline" /> 0 closed
                    </div>
                    <div>
                        <ThreadStatusItemsListHeaderFilterButtonDropdown
                            header="Filter by who's assigned"
                            items={['sqs (you)', 'ekonev', 'jleiner', 'ziyang', 'kting7', 'ffranksena']}
                        >
                            Assignee
                        </ThreadStatusItemsListHeaderFilterButtonDropdown>
                        <ThreadStatusItemsListHeaderFilterButtonDropdown
                            header="Sort by"
                            items={['Priority', 'Most recently updated', 'Least recently updated']}
                        >
                            Sort
                        </ThreadStatusItemsListHeaderFilterButtonDropdown>
                    </div>
                </div>
                {itemsOrError === LOADING ? (
                    <LoadingSpinner className="mt-2" />
                ) : isErrorLike(itemsOrError) ? (
                    <div className="alert alert-error mt-2">{itemsOrError.message}</div>
                ) : itemsOrError.nodes.length === 0 ? (
                    <p className="p-2 mb-0 text-muted">No status items found.</p>
                ) : (
                    <ul className="list-group list-group-flush">
                        {itemsOrError.nodes.map((data, i) => (
                            <PullRequestStatusItem key={i} {...data} className="list-group-item p-2" />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
