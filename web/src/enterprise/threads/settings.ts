export interface ThreadSettings {
    query: string
    createPullRequests?: boolean
    pullRequestTemplate?: {
        title?: string
        branch?: string
        description?: string
    }
}
