import { getContext, setContext } from "svelte";

export type Platform = "Codeforces" | "LeetCode" | "AtCoder" | "CodeChef";

export interface Task {
    id: number;
    title: string;
    platform: Platform;
    tags: string[];
    status: "Todo" | "In Progress" | "Solved" | "Review";
};

const dummyTasks: Task[] = [
    {
        id: 1,
        title: "Two Sum",
        platform: "LeetCode",
        status: "Solved",
        tags: ["Array", "Hash Table"],
    },
    {
        id: 2,
        title: "Binary Tree Inorder Traversal",
        platform: "LeetCode",
        status: "In Progress",
        tags: ["Tree", "DFS"],
    },
    {
        id: 3,
        title: "Merge k Sorted Lists",
        platform: "LeetCode",
        status: "Todo",
        tags: ["Linked List", "Heap"],
    },
    {
        id: 4,
        title: "Valid Parentheses",
        platform: "LeetCode",
        status: "Solved",
        tags: ["Stack", "String"],
    },
    {
        id: 5,
        title: "Maximum Subarray",
        platform: "LeetCode",
        status: "In Progress",
        tags: ["Array", "Dynamic Programming"],
    },
];

export class TaskState {
    tasks = $state<Task[]>([]);

    constructor(tasks: Task[]) {
        this.tasks = tasks;
    }

    getDueTasks(): Task[] {
        return this.tasks.filter((t) => t.id%2 == 0);
    }

    getAllTasks(): Task[] {
        return this.tasks;
    }

}

const TASK_STATE_KEY = Symbol("TASK_STATE");

export function setTaskState() {
    return setContext(TASK_STATE_KEY, new TaskState(dummyTasks));
}

export function getTaskState() {
    return getContext<ReturnType<typeof setTaskState>>(TASK_STATE_KEY);
}