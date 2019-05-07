import H from 'history'
import CheckboxMultipleBlankOutlineIcon from 'mdi-react/CheckboxMultipleBlankOutlineIcon'
import MessageOutlineIcon from 'mdi-react/MessageOutlineIcon'
import React from 'react'
import { Link } from 'react-router-dom'
import * as GQL from '../../../../../shared/src/graphql/schema'

interface Props {
    thread: GQL.IDiscussionThread
    location: H.Location
}

/**
 * A list item for a thread in {@link ThreadsList}.
 */
export const ThreadsListItem: React.FunctionComponent<Props> = ({ thread, location }) => (
    <li className="list-group-item p-2">
        <div className="d-flex align-items-start">
            <div
                className="form-check mx-2"
                /* tslint:disable-next-line:jsx-ban-props */
                style={{ marginTop: '2px' /* stylelint-disable-line declaration-property-unit-whitelist */ }}
            >
                <input className="form-check-input position-static" type="checkbox" aria-label="Select item" />
            </div>
            <CheckboxMultipleBlankOutlineIcon
                className={`icon-inline small mr-2 mt-1 ${threadIconColorClass(thread)}`}
                data-tooltip={threadIconTooltip(thread)}
            />
            <div className="flex-1">
                <h3 className="d-flex align-items-center mb-0">
                    {/* tslint:disable-next-line:jsx-ban-props */}
                    <Link to={`${location.pathname}/${thread.id}`} style={{ color: 'var(--body-color)' }}>
                        {thread.title}
                    </Link>
                    <span className="badge badge-secondary ml-1 d-none">123</span> {/* TODO!(sqs) */}
                </h3>

                {thread.labels && (
                    <div>
                        {thread.labels.map((label, i) => (
                            <span key={i} className={`badge mr-1 ${badgeColorClass(label)}`}>
                                {label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <ul className="list-inline d-flex align-items-center">
                    {thread.comments.totalCount > 0 && (
                        <li className="list-inline-item">
                            <small className="text-muted">
                                <MessageOutlineIcon className="icon-inline" /> {thread.comments.totalCount}
                            </small>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    </li>
)

function threadIconColorClass({ archivedAt }: Pick<GQL.IDiscussionThread, 'archivedAt'>): string {
    return archivedAt ? 'text-muted' : 'text-danger'
}

function threadIconTooltip({ archivedAt }: Pick<GQL.IDiscussionThread, 'archivedAt'>): string {
    return archivedAt ? 'Archived thread (no action needed)' : 'Open thread (needs attention)'
}

function badgeColorClass(label: string): string {
    if (label === 'security' || label.endsWith('sec')) {
        return 'badge-danger'
    }
    const CLASSES = ['badge-primary', 'badge-warning', 'badge-info', 'badge-success']
    const k = label.split('').reduce((sum, c) => (sum += c.charCodeAt(0)), 0)
    return CLASSES[k % (CLASSES.length - 1)]
}
