import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import MapSearchIcon from 'mdi-react/MapSearchIcon'
import React, { useMemo, useState } from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../shared/src/util/errors'
import { ErrorBoundary } from '../../../components/ErrorBoundary'
import { HeroPage } from '../../../components/HeroPage'
import { fetchDiscussionThreadAndComments } from '../../../discussions/backend'
import { ThreadsAreaContext } from '../global/ThreadsArea'
import { ThreadActivityPage } from './activity/ThreadActivityPage'
import { ThreadManagePage } from './manage/ThreadManagePage'
import { ThreadOverviewPage } from './overview/ThreadOverviewPage'
import { ThreadAreaHeader } from './ThreadAreaHeader'

const NotFoundPage = () => (
    <HeroPage icon={MapSearchIcon} title="404: Not Found" subtitle="Sorry, the requested  page was not found." />
)

interface Props extends ThreadsAreaContext, RouteComponentProps<{ threadID: string }> {}

const LOADING: 'loading' = 'loading'

/**
 * The area for a single thread.
 */
export const ThreadArea: React.FunctionComponent<Props> = props => {
    const [threadOrError, setThreadOrError] = useState<typeof LOADING | GQL.IDiscussionThread | ErrorLike>(LOADING)

    // tslint:disable-next-line: no-floating-promises beacuse fetchDiscussionThreadAndComments never throws
    useMemo(async () => {
        try {
            setThreadOrError(await fetchDiscussionThreadAndComments(props.match.params.threadID).toPromise())
        } catch (err) {
            setThreadOrError(asError(err))
        }
    }, [props.match.params.threadID])

    if (threadOrError === LOADING) {
        return null // loading
    }
    if (isErrorLike(threadOrError)) {
        return <HeroPage icon={AlertCircleIcon} title="Error" subtitle={threadOrError.message} />
    }

    if (threadOrError.kind !== props.kind) {
        return (
            <Redirect
                to={{
                    ...props.location,
                    pathname: props.location.pathname.replace(
                        `/${props.kind.toLowerCase()}s/`,
                        `/${threadOrError.kind.toLowerCase()}s/`
                    ),
                }}
            />
        )
    }

    const context: ThreadsAreaContext & { thread: GQL.IDiscussionThread; areaURL: string } = {
        ...props,
        thread: threadOrError,
        areaURL: props.match.url,
    }

    return (
        <div className="thread-area area--vertical">
            <ThreadAreaHeader {...context} />
            <div className="container pt-3">
                <ErrorBoundary location={props.location}>
                    <Switch>
                        <Route
                            path={props.match.url}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => <ThreadOverviewPage {...routeComponentProps} {...context} />}
                        />
                        <Route
                            path={`${props.match.url}/activity`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => <ThreadActivityPage {...routeComponentProps} {...context} />}
                        />
                        <Route
                            path={`${props.match.url}/manage`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => <ThreadManagePage {...routeComponentProps} {...context} />}
                        />
                        <Route key="hardcoded-key" component={NotFoundPage} />
                    </Switch>
                </ErrorBoundary>
            </div>
        </div>
    )
}
