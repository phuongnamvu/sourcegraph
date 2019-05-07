import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import RayEndArrowIcon from 'mdi-react/RayEndArrowIcon'
import SourceBranchIcon from 'mdi-react/SourceBranchIcon'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import React, { useCallback, useState } from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../../shared/src/util/errors'
import { Form } from '../../../../components/Form'
import { updateThread } from '../../../../discussions/backend'
import { queryFindAndReplaceOptions } from '../../../codemod/query'
import { ThreadSettings } from '../../settings'

interface Props {
    thread: Pick<GQL.IDiscussionThread, 'id' | 'settings'>
    onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
    threadSettings: ThreadSettings
}

const LOADING: 'loading' = 'loading'

// tslint:disable: jsx-no-lambda
export const ThreadPullRequestTemplateEditForm: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    threadSettings,
}) => {
    const query = threadSettings.query
    const { find, replace } = queryFindAndReplaceOptions(query)

    const titlePlaceholder = `${find} 🠖 ${replace} (Sourcegraph codemod)`
    const branchPlaceholder = 'codemod/' + [find, replace].map(v => v.replace(/[^\w]+/g, '_')).join('-')

    const [uncommittedSettings, setUncommittedSettings] = useState<ThreadSettings>({
        ...threadSettings,
        pullRequestTemplate: {
            title: titlePlaceholder,
            branch: branchPlaceholder,
            ...threadSettings.pullRequestTemplate,
        },
    })
    const [updateOrError, setUpdateOrError] = useState<null | typeof LOADING | GQL.IDiscussionThread | ErrorLike>(null)
    const onSubmit = useCallback<React.FormEventHandler>(
        async e => {
            e.preventDefault()
            setUpdateOrError(LOADING)
            try {
                const updatedThread = await updateThread({
                    ThreadID: thread.id,
                    settings: JSON.stringify(uncommittedSettings, null, 2),
                }).toPromise()
                setUpdateOrError(updatedThread)
                onThreadUpdate(updatedThread)
            } catch (err) {
                setUpdateOrError(asError(err))
            }
        },
        [uncommittedSettings, updateOrError]
    )

    return (
        <Form className="form" onSubmit={onSubmit}>
            <div className="row">
                <div className="col-md-10 col-lg-8">
                    <div className="form-group">
                        <label htmlFor="thread-pull-request-template-edit-form__title">Pull request title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="thread-pull-request-template-edit-form__title"
                            placeholder={titlePlaceholder}
                            onChange={e =>
                                setUncommittedSettings({
                                    ...uncommittedSettings,
                                    pullRequestTemplate: {
                                        ...uncommittedSettings.pullRequestTemplate,
                                        title: e.currentTarget.value,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="thread-pull-request-template-edit-form__branchName">Branch</label>
                        <div className="d-flex align-items-center">
                            <code
                                className="border rounded text-muted p-1"
                                data-tooltip="Changing the base branch is not yet supported"
                            >
                                <SourceBranchIcon className="icon-inline mr-1" />
                                master
                            </code>{' '}
                            <RayEndArrowIcon className="icon-inline mx-2 text-muted" />
                            <input
                                type="text"
                                className="form-control form-control-sm flex-0 w-auto text-monospace"
                                id="thread-pull-request-template-edit-form__branchName"
                                placeholder={branchPlaceholder}
                                size={30}
                                onChange={e =>
                                    setUncommittedSettings({
                                        ...uncommittedSettings,
                                        pullRequestTemplate: {
                                            ...uncommittedSettings.pullRequestTemplate,
                                            branch: e.currentTarget.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="thread-pull-request-template-edit-form__description">
                            Pull request description
                        </label>
                        <textarea
                            className="form-control"
                            id="thread-pull-request-template-edit-form__description"
                            aria-describedby="thread-pull-request-template-edit-form__description-help"
                            rows={4}
                            defaultValue={
                                // tslint:disable-next-line: no-invalid-template-strings
                                'Sourcegraph codemod: [${query}](${query_url})\n\nRelated PRs: ${related_links}'
                            }
                            onChange={e =>
                                setUncommittedSettings({
                                    ...uncommittedSettings,
                                    pullRequestTemplate: {
                                        ...uncommittedSettings.pullRequestTemplate,
                                        description: e.currentTarget.value,
                                    },
                                })
                            }
                        />
                        <small
                            id="thread-pull-request-template-edit-form__description-help"
                            className="form-text text-muted"
                        >
                            Template variables:{' '}
                            <code data-tooltip="The full search query">
                                {'${query}'} {/* tslint:disable-line: no-invalid-template-strings */}
                            </code>{' '}
                            &nbsp;{' '}
                            <code data-tooltip="The URL to the search results page on Sourcegraph">
                                {'${query_url}'} {/* tslint:disable-line: no-invalid-template-strings */}
                            </code>{' '}
                            &nbsp;{' '}
                            <code data-tooltip="Formatted links to all other pull requests (in other repositories) created by this codemod">
                                {'${related_links}'} {/* tslint:disable-line: no-invalid-template-strings */}
                            </code>
                        </small>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={updateOrError === LOADING}>
                        {updateOrError === LOADING ? (
                            <LoadingSpinner className="icon-inline" />
                        ) : (
                            <SourcePullIcon className="icon-inline" />
                        )}{' '}
                        Create pull requests
                    </button>
                    {isErrorLike(updateOrError) && (
                        <div className="alert alert-danger mt-3">{updateOrError.message}</div>
                    )}
                </div>
            </div>
        </Form>
    )
}
