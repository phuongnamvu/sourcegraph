import H from 'history'
import React from 'react'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { DiscussionsThread } from '../../../../repo/blob/discussions/DiscussionsThread'

interface Props extends ExtensionsControllerProps {
    thread: GQL.IDiscussionThread

    history: H.History
    location: H.Location
}

/**
 * The overview page for a single thread.
 *
 * TODO(sqs): figure out how this interacts with changes - it seems the thread would find multiple
 * hits and you might want to group them arbitrarily into batches that you will address - that is a
 * "change".
 */
export const ThreadOverviewPage: React.FunctionComponent<Props> = ({ thread, ...props }) => (
    <div className="thread-overview-page">
        <DiscussionsThread {...props} threadID={thread.id} className="border border-top-0 rounded" />
    </div>
)
