import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import CheckIcon from 'mdi-react/CheckIcon'
import React, { useCallback, useState } from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../shared/src/util/errors'
import { updateThread } from '../../../discussions/backend'
import { ThreadSettings } from '../settings'

interface Props {
    thread: Pick<GQL.IDiscussionThread, 'id' | 'kind'>
    onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
    threadSettings: ThreadSettings
}

const LOADING: 'loading' = 'loading'

export const ThreadCreatePullRequestsButton: React.FunctionComponent<Props> = ({
    thread: { id: threadID },
    onThreadUpdate,
    threadSettings,
}) => {
    const [updateOrError, setUpdateOrError] = useState<null | typeof LOADING | GQL.IDiscussionThread | ErrorLike>(null)
    const onClick = useCallback<React.FormEventHandler>(
        async e => {
            e.preventDefault()
            setUpdateOrError(LOADING)
            try {
                const updatedThread = await updateThread({
                    ThreadID: threadID,
                    settings: JSON.stringify({ ...threadSettings, createPullRequests: true }, null, 2),
                }).toPromise()
                setUpdateOrError(updatedThread)
                onThreadUpdate(updatedThread)
            } catch (err) {
                setUpdateOrError(asError(err))
            }
        },
        [updateOrError]
    )
    return (
        <div>
            <button type="submit" disabled={updateOrError === LOADING} className="btn btn-success" onClick={onClick}>
                {updateOrError === LOADING ? (
                    <LoadingSpinner className="icon-inline" />
                ) : (
                    <CheckIcon className="icon-inline" />
                )}{' '}
                Create 10 pending PRs
            </button>
            {isErrorLike(updateOrError) && <div className="alert alert-danger mt-3">{updateOrError.message}</div>}
        </div>
    )
}
