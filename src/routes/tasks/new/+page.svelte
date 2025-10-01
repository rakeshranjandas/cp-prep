<script lang="ts">
  import { goto } from '$app/navigation';
  import { getTaskState, type Task } from '$lib/state/tasks-state.svelte';
  import { z } from 'zod';

  let taskState = getTaskState()

  let title: string = $state('');
  let platform: string = $state('LeetCode');
  let tags: string = $state('dp, arrays');
  let firstReview: string = $state<string>(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  let status: Task['status'] = $state<Task['status']>('Todo');
  let notes: string = $state("");
  let url: string = $state("");

  let errorMsgs: Record<string, string> = $state({});

  const taskSchema = z.object({
    title: z.string().min(1, { message: "Title cannot be empty" }),
    platform: z.string().min(1, { message: "Platform cannot be empty" }),
    tags: z.string().min(1, { message: "Tags cannot be empty" }),
    firstReview: z.string().min(1, { message: "First review date required" }),
    status: z.enum(["Todo", "In Progress", "Solved", "Review"], { message: "Status required" }),
    notes: z.string(),
    url: z.string().url({ message: "URL must be valid" }).optional().or(z.literal("").transform(() => undefined)),
  });

  function onSubmit(e: Event) {
    e.preventDefault();
    errorMsgs = {};
    const result = taskSchema.safeParse({ title, platform, tags, firstReview, status, notes, url });
    if (!result.success) {
      for (const err of result.error.errors) {
        if (err.path[0]) errorMsgs[err.path[0]] = err.message;
      }
      return;
    }

    let newTask: Task = {
      id: 0,
      title,
      platform,
      tags: tags.split(",").map((t) => t.trim()),
      status,
      notes,
      url,
      nextReview: firstReview
    };

    taskState.addTask(newTask);

    // In a real app, save to server here. For now, navigate back.
    goto('/tasks');
  }
</script>

<main class="mx-auto max-w-2xl space-y-6">
  <header class="flex items-center justify-between">
    <h1 class="text-balance text-xl font-semibold text-foreground">Add Task</h1>
    <a href="/tasks" class="text-sm text-primary hover:underline">Back to tasks</a>
  </header>

  <form onsubmit={onSubmit} class="space-y-4 rounded-md border border-border p-4">
    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Title</span>
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={title} />
        {#if errorMsgs.title}
          <span class="text-xs text-red-600 mt-1">{errorMsgs.title}</span>
        {/if}
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Platform</span>
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={platform} />
        {#if errorMsgs.platform}
          <span class="text-xs text-red-600 mt-1">{errorMsgs.platform}</span>
        {/if}
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Tags</span>
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={tags} placeholder="comma-separated" />
        {#if errorMsgs.tags}
          <span class="text-xs text-red-600 mt-1">{errorMsgs.tags}</span>
        {/if}
      </label>
    </div>

    <div class="grid gap-4 md:grid-cols-1">
      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">URL</span>
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={url} />
        {#if errorMsgs.url}
          <span class="text-xs text-red-600 mt-1">{errorMsgs.url}</span>
        {/if}
      </label>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">First review date</span>
        <input type="date" class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={firstReview} />
        {#if errorMsgs.firstReview}
          <span class="text-xs text-red-600 mt-1">{errorMsgs.firstReview}</span>
        {/if}
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Status</span>
        <select class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={status}>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Solved</option>
          <option>Review</option>
        </select>
        {#if errorMsgs.status}
          <span class="text-xs text-red-600 mt-1">{errorMsgs.status}</span>
        {/if}
      </label>
    </div>

    <div class="grid gap-4">
      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Notes</span>
        <textarea class="border" rows="10" bind:value={notes}></textarea>
        {#if errorMsgs.notes}
          <span class="text-xs text-red-600 mt-1">{errorMsgs.notes}</span>
        {/if}
      </label>
    </div>

    <div class="flex items-center gap-2">
      <button type="submit" class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
        Save Task
      </button>
      <a href="/tasks" class="text-sm text-muted-foreground hover:text-foreground">Cancel</a>
    </div>
  </form>
</main>
