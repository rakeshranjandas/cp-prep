import { getContext, setContext } from "svelte";

export interface Task {
    id: number;
    title: string;
    platform: string;
    tags: string[];
    status: "Todo" | "In Progress" | "Solved" | "Review";
    lastReviewed?: string; // Date yyyy-mm-dd e.g. "2025-10-03"
    nextReview?: string;   // Date yyyy-mm-dd e.g. "2025-10-03"
    notes?: string;
    url?: string;
};

const dummyTasks: Task[] = [
    {
        id: 1,
        title: "Two Sum",
        platform: "LeetCode",
        status: "Solved",
        tags: ["Array", "Hash Table"],
        lastReviewed: "2025-09-20",
        nextReview: "2025-10-22",
    },
    {
        id: 2,
        title: "Binary Tree Inorder Traversal",
        platform: "LeetCode",
        status: "In Progress",
        tags: ["Tree", "DFS"],
        lastReviewed: "2025-09-25",
        nextReview: "2025-10-01",
    },
    {
        id: 3,
        title: "Merge k Sorted Lists",
        platform: "LeetCode",
        status: "Todo",
        tags: ["Linked List", "Heap"],
        lastReviewed: "2025-09-15",
        nextReview: "2025-10-05",
    },
    {
        id: 4,
        title: "Valid Parentheses",
        platform: "LeetCode",
        status: "Solved",
        tags: ["Stack", "String"],
        lastReviewed: "2025-09-18",
    },
    {
        id: 5,
        title: "Maximum Subarray",
        platform: "LeetCode",
        status: "In Progress",
        tags: ["Array", "Dynamic Programming"],
        lastReviewed: "2025-09-22",
    },
];

export class TaskState {
    tasks = $state<Task[]>([]);

    constructor(tasks: Task[]) {
        this.tasks = tasks;
    }

    getDueTasks(): Task[] {
        const now = new Date();
        return [...this.tasks]
            .filter(
            (t) =>
                t.nextReview &&
                new Date(t.nextReview).getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000 // Within 7 days
            )
            .sort(
            (a, b) =>
                new Date(a.nextReview!).getTime() -
                new Date(b.nextReview!).getTime()
            );
    }

    getAllTasks(): Task[] {
        return [...this.tasks].sort((a, b) => b.id - a.id);
    }

    addTask(newTask: Task): void {
        newTask['id'] = this.tasks.length + 1;
        this.tasks = [...this.tasks, newTask]
    }
}

const TASK_STATE_KEY = Symbol("TASK_STATE");

export function setTaskState() {
    return setContext(TASK_STATE_KEY, new TaskState(dummyTasks));
}

export function getTaskState() {
    return getContext<ReturnType<typeof setTaskState>>(TASK_STATE_KEY);
}