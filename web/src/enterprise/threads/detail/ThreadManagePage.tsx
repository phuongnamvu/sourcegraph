import React from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'

interface Props {
    thread: GQL.IDiscussionThread
}

/**
 * The manage page for a single thread.
 */
export const ThreadManagePage: React.FunctionComponent<Props> = ({ thread }) => (
    <div className="thread-manage-page">MANAGE</div>
)
