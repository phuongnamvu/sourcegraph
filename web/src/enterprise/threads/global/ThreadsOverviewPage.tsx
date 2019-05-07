import H from 'history'
import React from 'react'
import { ThreadsAreaContext } from './ThreadsArea'
import { ThreadsList } from './ThreadsList'

interface Props extends ThreadsAreaContext {
    location: H.Location
}

/**
 * The threads overview page.
 */
export const ThreadsOverviewPage: React.FunctionComponent<Props> = ({ location }) => (
    <div className="threads-overview-page mt-3 container">
        <ThreadsList location={location} />
    </div>
)
