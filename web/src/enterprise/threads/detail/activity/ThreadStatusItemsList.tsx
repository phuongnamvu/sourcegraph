import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import CheckCircleIcon from 'mdi-react/CheckCircleIcon'
import CloseCircleIcon from 'mdi-react/CloseCircleIcon'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import React, { useMemo, useState } from 'react'
import { of } from 'rxjs'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../../shared/src/util/errors'
import { PullRequestStatusItem } from './PullRequestStatusItem'
import { ThreadStatusItemsListHeaderFilterButtonDropdown } from './ThreadStatusItemsListHeaderFilterButtonDropdown'
import { ThreadStatusItemsProgressBar } from './ThreadStatusItemsProgressBar'

const DATA: {
    repo: string
    label?: string
    prNumber: number
    status: 'open' | 'merged' | 'closed'
    updatedAt: string
    updatedBy: string
    commentsCount: number
}[] = [
    {
        repo: 'github.com/sourcegraph/go-diff',
        prNumber: 87,
        status: 'open',
        updatedAt: new Date(Date.now() - 10000000).toISOString(),
        updatedBy: 'alice',
        commentsCount: 1,
    },
    {
        repo: 'github.com/sourcegraph/codeintellify',
        label: 'client/chrome/',
        prNumber: 1841,
        status: 'open',
        updatedAt: new Date(Date.now() - 5000000).toISOString(),
        updatedBy: 'lguychard',
        commentsCount: 7,
    },
    {
        repo: 'github.com/sourcegraph/codeintellify',
        label: 'client/firefox/',
        prNumber: 1842,
        status: 'open',
        updatedAt: new Date(Date.now() - 2300000).toISOString(),
        updatedBy: 'felixfbecker',
        commentsCount: 2,
    },
    {
        repo: 'github.com/sourcegraph/csp',
        prNumber: 9,
        status: 'closed',
        updatedAt: new Date(Date.now() - 9300000).toISOString(),
        updatedBy: 'peter91',
        commentsCount: 5,
    },
    {
        repo: 'github.com/sourcegraph/sitemap',
        prNumber: 48,
        status: 'closed',
        updatedAt: new Date(Date.now() - 4100000).toISOString(),
        updatedBy: 'carol',
        commentsCount: 0,
    },
    {
        repo: 'github.com/sourcegraph/sourcegraph-lightstep',
        prNumber: 51,
        status: 'merged',
        updatedAt: new Date(Date.now() - 7100000).toISOString(),
        updatedBy: 'tsenart',
        commentsCount: 1,
    },
    {
        repo: 'github.com/sourcegraph/docsite',
        label: 'cmd/docsite/',
        prNumber: 149,
        status: 'merged',
        updatedAt: new Date(Date.now() - 5500000).toISOString(),
        updatedBy: 'felixfbecker',
        commentsCount: 5,
    },
    {
        repo: 'github.com/sourcegraph/docsite',
        label: 'pkg/markdown/',
        prNumber: 150,
        status: 'merged',
        updatedAt: new Date(Date.now() - 3500000).toISOString(),
        updatedBy: 'ryan-blunden',
        commentsCount: 2,
    },
    {
        repo: 'github.com/sourcegraph/thyme',
        prNumber: 147,
        status: 'merged',
        updatedAt: new Date(Date.now() - 100000).toISOString(),
        updatedBy: 'beyang',
        commentsCount: 21,
    },
    {
        repo: 'github.com/sourcegraph/sourcegraph-git-extras',
        prNumber: 511,
        status: 'merged',
        updatedAt: new Date(Date.now() - 6200000).toISOString(),
        updatedBy: 'xyzhao',
        commentsCount: 2,
    },
]

const queryStatusItems = (_threadID: string) => of({ nodes: DATA, totalCount: DATA.length })

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
                    <div className="form-check mx-2">
                        <input className="form-check-input position-static" type="checkbox" aria-label="Select item" />
                    </div>
                    <div className="font-weight-normal flex-1">
                        50% complete&nbsp;&nbsp;
                        <SourcePullIcon className="icon-inline" />{' '}
                        {itemsOrError !== LOADING && !isErrorLike(itemsOrError)
                            ? `${itemsOrError.nodes.filter(({ status }) => status === 'open').length} open`
                            : 'Open'}{' '}
                        &nbsp;&nbsp;
                        <CheckCircleIcon className="icon-inline" />{' '}
                        {itemsOrError !== LOADING && !isErrorLike(itemsOrError)
                            ? `${itemsOrError.nodes.filter(({ status }) => status === 'merged').length} merged`
                            : 'Merged'}{' '}
                        &nbsp;&nbsp;
                        <CloseCircleIcon className="icon-inline" />{' '}
                        {itemsOrError !== LOADING && !isErrorLike(itemsOrError)
                            ? `${itemsOrError.nodes.filter(({ status }) => status === 'closed').length} closed`
                            : 'Closed'}{' '}
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
                <ThreadStatusItemsProgressBar />
                {itemsOrError === LOADING ? (
                    <LoadingSpinner className="mt-2" />
                ) : isErrorLike(itemsOrError) ? (
                    <div className="alert alert-error mt-2">{itemsOrError.message}</div>
                ) : itemsOrError.nodes.length === 0 ? (
                    <p className="p-2 mb-0 text-muted">No status items found.</p>
                ) : (
                    <div className="list-group list-group-flush">
                        {itemsOrError.nodes.map((data, i) => (
                            <PullRequestStatusItem key={i} {...data} className="list-group-item p-2" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
