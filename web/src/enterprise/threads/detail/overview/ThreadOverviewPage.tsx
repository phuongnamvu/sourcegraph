import H from 'history'
import React from 'react'
import { Link } from 'react-router-dom'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ErrorLike } from '../../../../../../shared/src/util/errors'
import { DiscussionsThread } from '../../../../repo/blob/discussions/DiscussionsThread'
import { ThreadSettings } from '../../settings'
import { ThreadStatusItemsProgressBar } from '../activity/ThreadStatusItemsProgressBar'
import { ThreadPullRequestTemplateEditForm } from '../manage/ThreadPullRequestTemplateEditForm'

interface Props extends ExtensionsControllerProps {
    thread: GQL.IDiscussionThread
    onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
    threadSettings: ThreadSettings

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
export const ThreadOverviewPage: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    threadSettings,
    ...props
}) => (
    <div className="thread-overview-page">
        {threadSettings.createPullRequests ? (
            <div className="d-flex align-items-center position-relative mb-3 border rounded">
                <Link to={`${thread.url}/activity`} className="stretched-link" />
                <ThreadStatusItemsProgressBar className="flex-1 rounded" height="1.25rem" label="50% complete" />
            </div>
        ) : (
            <div className="alert alert-info mb-3 position-relative">
                <Link
                    to={`${thread.url}/activity`}
                    className="stretched-link font-weight-bold"
                    style={{ color: 'var(--body-color)' }}
                >
                    10 pull requests pending
                </Link>
            </div>
        )}
        <DiscussionsThread {...props} threadID={thread.id} className="border border-top-0 rounded" />
    </div>
)
