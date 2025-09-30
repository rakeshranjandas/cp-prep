<script lang="ts">
  import { goto } from '$app/navigation';

  type Difficulty = 'Easy' | 'Medium' | 'Hard';

  let title = $state('');
  let platform = $state('LeetCode');
  let difficulty = $state<Difficulty>('Medium');
  let tags = $state('dp, arrays');
  let firstReview = $state<string>(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  let intervalDays = $state(3);
  let status = $state<'Todo' | 'In Progress' | 'Solved' | 'Review'>('Todo');

  function onSubmit(e: Event) {
    e.preventDefault();
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
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={title} required />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Platform</span>
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={platform} />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Difficulty</span>
        <select class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={difficulty}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Tags</span>
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={tags} placeholder="comma-separated" />
      </label>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">First review date</span>
        <input type="date" class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={firstReview} />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Interval (days)</span>
        <input type="number" min="1" class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={intervalDays} />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Status</span>
        <select class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={status}>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Solved</option>
          <option>Review</option>
        </select>
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
