import H from 'history'
import HistoryIcon from 'mdi-react/HistoryIcon'
import SettingsIcon from 'mdi-react/SettingsIcon'
import TagOutlineIcon from 'mdi-react/TagOutlineIcon'
import React from 'react'
import { Link } from 'react-router-dom'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { nounForThreadKind } from '../util'
import { ThreadsListFilter } from './ThreadsListFilter'

interface Props {
    kind: GQL.DiscussionThreadKind

    query: string
    onQueryChange: (query: string) => void

    location: H.Location
}

/**
 * The header for the list of threads.
 */
export const ThreadsListHeader: React.FunctionComponent<Props> = ({ kind, query, onQueryChange, location }) => (
    <div className="d-flex justify-content-between align-items-start">
        <div className="flex-1 mr-5 d-flex">
            <div className="flex-1 mb-3 mr-2">
                <ThreadsListFilter value={query} onChange={onQueryChange} />
            </div>
            <div className="btn-group mb-3 mr-4" role="group">
                <Link to={`${location.pathname}/-/manage/activity`} className="btn btn-outline-link">
                    <HistoryIcon className="icon-inline" /> Activity
                </Link>
                <Link to={`${location.pathname}/labels`} className="btn btn-outline-link">
                    <TagOutlineIcon className="icon-inline" /> Labels <span className="badge badge-secondary">9</span>
                </Link>
            </div>
        </div>
        <div className="btn-group" role="group">
            <Link to={`${location.pathname}/-/manage`} className="btn btn-outline-link">
                <SettingsIcon className="icon-inline" /> Manage{' '}
            </Link>
            {/* tslint:disable-next-line: jsx-ban-props to avoid its width changing between checks/codemods */}
            <Link to={`${location.pathname}/-/new`} className="btn btn-success" style={{ minWidth: '118px' }}>
                New {nounForThreadKind(kind)}
            </Link>
        </div>
    </div>
)
