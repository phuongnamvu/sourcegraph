import H from 'history'
import React from 'react'
import { ContributableMenu } from '../../../../shared/src/api/protocol'
import { ExtensionsControllerProps } from '../../../../shared/src/extensions/controller'
import { PlatformContextProps } from '../../../../shared/src/platform/context'
import { TelemetryProps } from '../../../../shared/src/telemetry/telemetryService'
import { WebActionsNavItems as ActionsNavItems } from '../../components/shared'
import { FilterChip } from '../FilterChip'

interface Props
    extends ExtensionsControllerProps<'executeCommand' | 'services'>,
        PlatformContextProps<'forceUpdateTooltip'>,
        TelemetryProps {
    className?: string
    location: H.Location
}

export const SearchContextBar: React.FunctionComponent<Props> = ({ className = '', ...props }) => (
    <nav className={`search-context-bar border-right ${className}`}>
        <section className="card border-0 rounded-0">
            <h5 className="card-header rounded-0">Repositories</h5>
            <ul className="list-group list-group-flush mt-1">
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="/sourcegraph/sourcegr" value="a" query="a" />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="sourcegraph/sourcegraph" value="_" query="a" count={93} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="sourcegraph/go-diff" value="_" query="a" count={19} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="sourcegraph/infrastructure" value="_" query="a" count={15} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="theupdateframework/notary" value="_" query="a" count={11} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="twbs/bootstrap" value="_" query="a" count={7} />
                </li>
            </ul>
        </section>
        <section className="card border-0 rounded-0 mt-3">
            <h5 className="card-header rounded-0">Languages</h5>
            <ul className="list-group list-group-flush mt-1">
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="typescript" value="_" query="a" count={38} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="go" value="_" query="a" count={19} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="scss" value="_" query="a" count={7} />
                </li>
            </ul>
        </section>
        <section className="card border-0 rounded-0 mt-3">
            <h5 className="card-header rounded-0">Owners</h5>
            <ul className="list-group list-group-flush mt-1">
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="@tsenart" value="_" query="a" count={23} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="@felixfbecker" value="_" query="a" count={16} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="@beyang" value="_" query="a" count={7} />
                </li>
            </ul>
        </section>
        <section className="card border-0 rounded-0 mt-3">
            <h5 className="card-header rounded-0">Updated</h5>
            <ul className="list-group list-group-flush mt-1">
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="Last 24 hours" value="_" query="a" count={3} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="Last 7 days" value="_" query="a" count={18} />
                </li>
                <li className="list-group-item border-0 py-0">
                    <FilterChip name="More than 1 year ago" value="_" query="a" count={83} />
                </li>
            </ul>
        </section>
        <section className="border-top mt-3 pt-1">
            <ActionsNavItems
                {...props}
                menu={ContributableMenu.SearchResultsToolbar}
                wrapInList={true}
                actionItemClass="nav-link px-2"
            />
        </section>
    </nav>
)
