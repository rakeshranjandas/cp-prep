

export type Session = {
  id: string
  title: string
  description: string
  tasks: Task[]
  isActive: boolean
  createdAt: Date
  completedTasks: number
}


let sessions = [
    {
        id: "session1",
        title: "Arrays & Hashing Fundamentals",
        description: "Master basic array operations and hash table techniques",
        taskIds: ["1", "2"],
        isActive: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedTasks: 1,
    },
    {
        id: "session2",
        title: "Tree Algorithms Deep Dive",
        description: "Advanced tree traversal and manipulation problems",
        taskIds: ["3", "4", "5"],
        isActive: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedTasks: 1,
    },
    {
        id: "session3",
        title: "Dynamic Programming Mastery",
        description: "Comprehensive DP problem solving techniques",
        taskIds: [],
        isActive: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedTasks: 0,
    },
];