import classNames from 'classnames'
import formatDistance from 'date-fns/formatDistance'
import CheckCircleIcon from 'mdi-react/CheckCircleIcon'
import CloseCircleIcon from 'mdi-react/CloseCircleIcon'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import React from 'react'
import { displayRepoName } from '../../../../../../shared/src/components/RepoFileLink'
import * as GQL from '../../../../../../shared/src/graphql/schema'

interface Props {
    repo: string
    prNumber: number
    status: 'open' | 'merged' | 'closed'
    updatedAt: string
    updatedBy: string
    className?: string
}

const STATUS_ICONS: Record<Props['status'], React.ComponentType<{ className?: string }>> = {
    open: SourcePullIcon,
    merged: CheckCircleIcon,
    closed: CloseCircleIcon,
}

/**
 * A status indicator for a single GitHub pull request in a thread.
 */
export const PullRequestStatusItem: React.FunctionComponent<Props> = ({
    repo,
    prNumber,
    status,
    updatedAt,
    updatedBy,
    className = '',
}) => {
    const Icon = STATUS_ICONS[status]
    return (
        <div className={`${className} d-flex align-items-start`}>
            <Icon
                className={classNames('icon-inline', 'mr-2', 'h5', 'mb-0', {
                    'text-info': status === 'open',
                    'text-success': status === 'merged',
                    'text-danger': status === 'closed',
                })}
            />
            <div>
                <div>
                    <a href={`https://${repo}/pull/${prNumber}`} target="_blank">
                        {displayRepoName(repo)}
                        <strong>#{prNumber}</strong>
                    </a>
                </div>
                <small className="text-muted">
                    Updated {formatDistance(Date.parse(updatedAt), Date.now())} ago by <strong>{updatedBy}</strong>
                </small>
            </div>
        </div>
    )
}
