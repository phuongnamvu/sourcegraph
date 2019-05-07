import formatDistance from 'date-fns/formatDistance'
import HistoryIcon from 'mdi-react/HistoryIcon'
import React from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'

interface Props {
    thread: GQL.IDiscussionThread
}

/**
 * The overview page for a single thread.
 *
 * TODO(sqs): figure out how this interacts with changes - it seems the thread would find multiple
 * hits and you might want to group them arbitrarily into batches that you will address - that is a
 * "change".
 */
export const ThreadOverviewPage: React.FunctionComponent<Props> = ({ thread }) => (
    <div className="thread-overview-page">
        <ul className="list-inline d-flex align-items-center mb-1">
            <li className="list-inline-item">
                <small className="text-muted">
                    <HistoryIcon className="icon-inline" />
                    {formatDistance(Date.parse(thread.createdAt), Date.now())} by {thread.author} in <code>TODO</code>
                </small>
            </li>
        </ul>
    </div>
)
