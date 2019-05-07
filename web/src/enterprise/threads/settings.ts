export interface ThreadSettings {
    query: string
    pullRequestTemplate?: {
        title?: string
        branch?: string
        description?: string
    }
}
