import * as GQL from '../../../../shared/src/graphql/schema'

export function nounForThreadKind(kind: GQL.DiscussionThreadKind, plural = false): string {
    return `${kind.toLowerCase()}${plural ? 's' : ''}`
}

export function threadQueryForThreadKind(kind: GQL.DiscussionThreadKind): string {
    return `is:${kind.toLowerCase()}`
}
