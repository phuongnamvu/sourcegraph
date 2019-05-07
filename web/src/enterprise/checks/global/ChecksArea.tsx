import CheckboxMultipleMarkedOutlineIcon from 'mdi-react/CheckboxMultipleMarkedOutlineIcon'
import React from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { ThreadsArea, ThreadsAreaProps } from '../../threads/global/ThreadsArea'

interface Props extends Pick<ThreadsAreaProps, Exclude<keyof ThreadsAreaProps, 'kind'>> {}

/**
 * The global checks area.
 */
export const ChecksArea: React.FunctionComponent<Props> = props => (
    <ThreadsArea {...props} kind={GQL.DiscussionThreadKind.CHECK} kindIcon={CheckboxMultipleMarkedOutlineIcon} />
)
