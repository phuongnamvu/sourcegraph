import H from 'history'
import React from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ThreadStatusItemsList } from './ThreadStatusItemsList'

interface Props {
    thread: GQL.IDiscussionThread

    history: H.History
    location: H.Location
}

/**
 * The activity page for a single thread.
 */
export const ThreadActivityPage: React.FunctionComponent<Props> = ({ thread, ...props }) => (
    <div className="thread-activity-page">
        <ThreadStatusItemsList {...props} thread={thread} />
    </div>
)
