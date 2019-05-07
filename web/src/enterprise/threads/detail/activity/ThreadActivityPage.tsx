import H from 'history'
import React from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ErrorLike } from '../../../../../../shared/src/util/errors'
import { ThreadCreatePullRequestsButton } from '../../form/ThreadCreatePullRequestsButton'
import { ThreadSettings } from '../../settings'
import { ThreadPullRequestTemplateEditForm } from '../manage/ThreadPullRequestTemplateEditForm'
import { ThreadStatusItemsList } from './ThreadStatusItemsList'

interface Props {
    thread: GQL.IDiscussionThread
    onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
    threadSettings: ThreadSettings

    history: H.History
    location: H.Location
}

/**
 * The activity page for a single thread.
 */
export const ThreadActivityPage: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    threadSettings,
    ...props
}) => (
    <div className="thread-activity-page">
        {!threadSettings.pullRequestTemplate && (
            <div className="border rounded p-3 mb-3">
                <h2>Create pull request template</h2>
                <ThreadPullRequestTemplateEditForm
                    thread={thread}
                    onThreadUpdate={onThreadUpdate}
                    threadSettings={threadSettings}
                />
            </div>
        )}
        <ThreadStatusItemsList
            {...props}
            thread={thread}
            threadSettings={threadSettings}
            action={
                threadSettings.pullRequestTemplate &&
                !threadSettings.createPullRequests && (
                    <ThreadCreatePullRequestsButton
                        {...props}
                        thread={thread}
                        onThreadUpdate={onThreadUpdate}
                        threadSettings={threadSettings}
                    />
                )
            }
        />
        <br />
        <br />
    </div>
)
