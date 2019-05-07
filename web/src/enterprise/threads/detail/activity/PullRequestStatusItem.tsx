import classNames from 'classnames'
import formatDistance from 'date-fns/formatDistance'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import React from 'react'
import { displayRepoName } from '../../../../../../shared/src/components/RepoFileLink'
import * as GQL from '../../../../../../shared/src/graphql/schema'

interface Props {
    repo: string
    prNumber: number
    status: 'open' | 'merged' | 'closed'
    updatedAt: string
    className?: string
}

const STATUS_ICONS: Record<Props['status'], React.ComponentType<{ className?: string }>> = {
    open: SourcePullIcon,
    merged: CheckIcon,
    closed: AlertCircleIcon,
}

/**
 * A status indicator for a single GitHub pull request in a thread.
 */
export const PullRequestStatusItem: React.FunctionComponent<Props> = ({
    repo,
    prNumber,
    status,
    updatedAt,
    className = '',
}) => {
    const Icon = STATUS_ICONS[status]
    return (
        <div className={`${className} d-flex align-items-center`}>
            <Icon
                className={classNames('icon-inline', 'mr-2', 'h5', 'mb-0', {
                    'text-info': status === 'open',
                    'text-success': status === 'merged',
                    'text-danger': status === 'closed',
                })}
            />
            <a href={`https://${repo}/pulls/${prNumber}`} target="_blank">
                {displayRepoName(repo)}
                <strong>#{prNumber}</strong>
            </a>
            {formatDistance(Date.parse(updatedAt), Date.now())}
        </div>
    )
}
