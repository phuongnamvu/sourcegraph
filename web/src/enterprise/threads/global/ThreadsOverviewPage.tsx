import H from 'history'
import React from 'react'
import { ThreadsList } from '../list/ThreadsList'
import { threadQueryForThreadKind } from '../util'
import { ThreadsAreaContext } from './ThreadsArea'

interface Props extends ThreadsAreaContext {
    history: H.History
    location: H.Location
}

/**
 * The threads overview page.
 */
export const ThreadsOverviewPage: React.FunctionComponent<Props> = props => {
    const q = new URLSearchParams(location.search).get('q')
    const query = q === null ? threadQueryForThreadKind(props.kind) : q
    const onQueryChange = (query: string) => {
        const params = new URLSearchParams(location.search)
        params.set('q', query)
        props.history.push({ search: `${params}` })
    }

    return (
        <div className="threads-overview-page mt-3 container">
            <ThreadsList {...props} query={query} onQueryChange={onQueryChange} />
        </div>
    )
}
