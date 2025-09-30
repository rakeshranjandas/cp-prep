export interface Task {
    id: string,
    url?: string,
    title: string,
    platform?: string,
    tags: string[],
    notes?: string,
    nextReviewDate?: Date,
    reviewCount?: number,
    sessionId?: number,
}