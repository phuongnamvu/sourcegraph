import classNames from 'classnames'
import formatDistance from 'date-fns/formatDistance'
import { upperFirst } from 'lodash'
import CheckCircleIcon from 'mdi-react/CheckCircleIcon'
import CloseCircleIcon from 'mdi-react/CloseCircleIcon'
import DotsHorizontalCircleIcon from 'mdi-react/DotsHorizontalCircleIcon'
import MessageOutlineIcon from 'mdi-react/MessageOutlineIcon'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import React from 'react'
import { displayRepoName } from '../../../../../../shared/src/components/RepoFileLink'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { pluralize } from '../../../../../../shared/src/util/strings'

interface Props {
    repo: string
    label?: string
    prNumber: number
    status: 'open' | 'merged' | 'closed' | 'pending'
    updatedAt: string
    updatedBy: string
    commentsCount: number
    className?: string
}

const STATUS_ICONS: Record<Props['status'], React.ComponentType<{ className?: string }>> = {
    open: SourcePullIcon,
    merged: CheckCircleIcon,
    closed: CloseCircleIcon,
    pending: DotsHorizontalCircleIcon,
}

/**
 * A status indicator for a single GitHub pull request in a thread.
 */
export const PullRequestStatusItem: React.FunctionComponent<Props> = ({
    repo,
    label = '',
    prNumber,
    status,
    updatedAt,
    updatedBy,
    commentsCount,
    className = '',
}) => {
    const Icon = STATUS_ICONS[status]
    return (
        <div className={`${className}`}>
            <div className="d-flex align-items-start">
                <div
                    className="form-check mx-2"
                    /* tslint:disable-next-line:jsx-ban-props */
                    style={{ marginTop: '2px' /* stylelint-disable-line declaration-property-unit-whitelist */ }}
                >
                    <input className="form-check-input position-static" type="checkbox" aria-label="Select item" />
                </div>
                <Icon
                    className={classNames('icon-inline', 'mr-2', 'h5', 'mb-0', {
                        'text-info': status === 'open',
                        'text-success': status === 'merged',
                        'text-danger': status === 'closed',
                        'text-warning': status === 'pending',
                    })}
                    data-tooltip={upperFirst(status)}
                />
                <div className="flex-1">
                    <h3 className="d-flex align-items-center mb-0">
                        <a
                            href={`https://${repo}/pull/${prNumber}`}
                            target="_blank"
                            // tslint:disable-next-line:jsx-ban-props
                            style={{ color: 'var(--body-color)' }}
                        >
                            {label ? (
                                <>
                                    <span className="font-weight-normal">{displayRepoName(repo)}</span> &mdash;{' '}
                                    <code>{label}</code>
                                </>
                            ) : (
                                displayRepoName(repo)
                            )}
                        </a>
                    </h3>
                    {status === 'pending' ? (
                        <small className="text-muted">
                            {commentsCount} {pluralize('line', commentsCount)} changed
                        </small>
                    ) : (
                        <small className="text-muted">
                            #{prNumber} updated {formatDistance(Date.parse(updatedAt), Date.now())} ago by{' '}
                            <strong>{updatedBy}</strong>
                        </small>
                    )}
                </div>
                <div>
                    {status === 'pending' ? (
                        <button type="button" className="btn btn-outline-success">
                            Create PR
                        </button>
                    ) : (
                        commentsCount > 0 && (
                            <ul className="list-inline d-flex align-items-center">
                                <li className="list-inline-item">
                                    <small className="text-muted">
                                        <MessageOutlineIcon className="icon-inline" /> {commentsCount}
                                    </small>
                                </li>
                            </ul>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
