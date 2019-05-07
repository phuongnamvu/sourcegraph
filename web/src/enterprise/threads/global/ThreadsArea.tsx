import MapSearchIcon from 'mdi-react/MapSearchIcon'
import React from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { HeroPage } from '../../../components/HeroPage'
import { RepoHeaderContributionsLifecycleProps } from '../../../repo/RepoHeader'
import { ThreadArea } from '../detail/ThreadArea'
import { ThreadsManageArea } from './manage/ThreadsManageArea'
import { ThreadsOverviewPage } from './ThreadsOverviewPage'

const NotFoundPage = () => (
    <HeroPage icon={MapSearchIcon} title="404: Not Found" subtitle="Sorry, the requested threads page was not found." />
)

/**
 * Properties passed to all page components in the threads area.
 */
export interface ThreadsAreaContext {}

interface Props extends ThreadsAreaContext, RouteComponentProps<{}>, RepoHeaderContributionsLifecycleProps {}

/**
 * The global threads area.
 */
export class ThreadsArea extends React.Component<Props> {
    public render(): JSX.Element | null {
        const context: ThreadsAreaContext = {}

        return (
            <div className="threads-area area--vertical pt-0">
                <Switch>
                    <Route
                        path={this.props.match.url}
                        key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                        exact={true}
                        // tslint:disable-next-line:jsx-no-lambda
                        render={routeComponentProps => <ThreadsOverviewPage {...routeComponentProps} {...context} />}
                    />
                    <Route
                        path={`${this.props.match.url}/-/manage`}
                        key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                        // tslint:disable-next-line:jsx-no-lambda
                        render={routeComponentProps => <ThreadsManageArea {...routeComponentProps} {...context} />}
                    />
                    <Route
                        path={`${this.props.match.url}/:threadID`}
                        key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                        // tslint:disable-next-line:jsx-no-lambda
                        render={routeComponentProps => <ThreadArea {...routeComponentProps} {...context} />}
                    />
                    <Route key="hardcoded-key" component={NotFoundPage} />
                </Switch>
            </div>
        )
    }
}
