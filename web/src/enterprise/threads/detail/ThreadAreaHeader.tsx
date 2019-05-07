import CheckboxMultipleMarkedOutlineIcon from 'mdi-react/CheckboxMultipleMarkedOutlineIcon'
import HistoryIcon from 'mdi-react/HistoryIcon'
import SettingsIcon from 'mdi-react/SettingsIcon'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { ChatIcon } from '../../../../../shared/src/components/icons'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { ThreadsAreaContext } from '../global/ThreadsArea'

interface Props extends Pick<ThreadsAreaContext, 'kindIcon'> {
    thread: GQL.IDiscussionThread
    areaURL: string
}

/**
 * The header for the thread area (for a single thread).
 */
export const ThreadAreaHeader: React.FunctionComponent<Props> = ({ thread, areaURL, kindIcon: KindIcon }) => (
    <div className="thread-header border-top-0 border-bottom simple-area-header">
        <div className="container">
            <h1 className="font-weight-normal mt-3">
                <KindIcon className="icon-inline text-muted small" /> {thread.title}
            </h1>
            <div className="area-header__nav mt-4">
                <div className="area-header__nav-links">
                    <NavLink
                        to={areaURL}
                        className="btn area-header__nav-link"
                        activeClassName="area-header__nav-link--active"
                        exact={true}
                    >
                        <ChatIcon className="icon-inline" /> Conversation
                    </NavLink>
                    <NavLink
                        to={`${areaURL}/activity`}
                        className="btn area-header__nav-link"
                        activeClassName="area-header__nav-link--active"
                        exact={true}
                    >
                        <HistoryIcon className="icon-inline" /> Activity
                    </NavLink>
                    <NavLink
                        to={`${areaURL}/manage`}
                        className="btn area-header__nav-link"
                        activeClassName="area-header__nav-link--active"
                        exact={true}
                    >
                        <SettingsIcon className="icon-inline" /> Manage
                    </NavLink>
                </div>
            </div>
        </div>
    </div>
)
