import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import DeleteIcon from 'mdi-react/DeleteIcon'
import React, { useCallback, useState } from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../shared/src/util/errors'
import { updateThread } from '../../../discussions/backend'
import { nounForThreadKind } from '../util'

interface Props {
    thread: Pick<GQL.IDiscussionThread, 'id' | 'kind'>
    history: H.History
}

const LOADING: 'loading' = 'loading'

export const ThreadDeleteButton: React.FunctionComponent<Props> = ({ thread: { id: threadID, kind }, history }) => {
    const [deleteOrError, setDeleteOrError] = useState<null | typeof LOADING | ErrorLike>(null)
    const onClick = useCallback<React.FormEventHandler>(
        async e => {
            e.preventDefault()
            if (!confirm(`Are you sure you want to delete this ${nounForThreadKind(kind)}?`)) {
                return
            }
            setDeleteOrError(LOADING)
            try {
                await updateThread({ ThreadID: threadID, Delete: true }).toPromise()
                history.push('/threads')
            } catch (err) {
                setDeleteOrError(asError(err))
            }
        },
        [deleteOrError]
    )
    return (
        <div>
            <button type="submit" disabled={deleteOrError === LOADING} className="btn btn-danger" onClick={onClick}>
                {deleteOrError === LOADING ? (
                    <LoadingSpinner className="icon-inline" />
                ) : (
                    <DeleteIcon className="icon-inline" />
                )}{' '}
                Delete {nounForThreadKind(kind)}
            </button>
            {isErrorLike(deleteOrError) && <div className="alert alert-danger mt-3">{deleteOrError.message}</div>}
        </div>
    )
}
