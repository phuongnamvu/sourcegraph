import H from 'history'
import { upperFirst } from 'lodash'
import React from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ErrorLike } from '../../../../../../shared/src/util/errors'
import { ThreadDeleteButton } from '../../form/ThreadDeleteButton'
import { ThreadSettings } from '../../settings'
import { nounForThreadKind } from '../../util'
import { ThreadPullRequestTemplateEditForm } from './ThreadPullRequestTemplateEditForm'
import { ThreadSettingsEditForm } from './ThreadSettingsEditForm'

interface Props {
    thread: GQL.IDiscussionThread
    threadSettings: ThreadSettings
    onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
    isLightTheme: boolean
    history: H.History
}

/**
 * The manage page for a single thread.
 */
export const ThreadManagePage: React.FunctionComponent<Props> = ({ thread, ...props }) => (
    <div className="thread-manage-page">
        <div className="card d-block">
            <h4 className="card-header">{upperFirst(nounForThreadKind(thread.kind))} pull request template</h4>
            <div className="card-body">
                <ThreadPullRequestTemplateEditForm {...props} thread={thread} />
            </div>
        </div>
        <div className="card mt-3 d-block">
            <h4 className="card-header">{upperFirst(nounForThreadKind(thread.kind))} settings</h4>
            <div className="card-body">
                <ThreadSettingsEditForm {...props} thread={thread} />
            </div>
        </div>
        <div className="card mt-5 d-inline-block">
            <h4 className="card-header">{upperFirst(nounForThreadKind(thread.kind))} actions</h4>
            <div className="card-body">
                <ThreadDeleteButton {...props} thread={thread} />
            </div>
        </div>
    </div>
)
