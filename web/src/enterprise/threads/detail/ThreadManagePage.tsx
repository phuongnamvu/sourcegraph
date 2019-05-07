import H from 'history'
import React from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { ThreadSettingsEditForm } from './ThreadSettingsEditForm'

interface Props {
    thread: GQL.IDiscussionThread
    history: H.History
}

/**
 * The manage page for a single thread.
 */
export const ThreadManagePage: React.FunctionComponent<Props> = ({ thread, ...props }) => (
    <div className="thread-manage-page">
        <ThreadSettingsEditForm {...props} thread={thread} />
    </div>
)
