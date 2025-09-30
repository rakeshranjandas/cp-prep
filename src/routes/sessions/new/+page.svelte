<script lang="ts">
  import { goto } from '$app/navigation';

  let label = $state('');
  let description = $state('');
  let active = $state(true);

  function onSubmit(e: Event) {
    e.preventDefault();
    // In a real app, save to server here. For now, navigate back.
    goto('/sessions');
  }
</script>

<main class="mx-auto max-w-2xl space-y-6">
  <header class="flex items-center justify-between">
    <h1 class="text-balance text-xl font-semibold text-foreground">Add Session</h1>
    <a href="/sessions" class="text-sm text-primary hover:underline">Back to sessions</a>
  </header>

  <form onsubmit={onSubmit} class="space-y-4 rounded-md border border-border p-4">
    <div class="grid gap-4">
      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Label</span>
        <input class="rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={label} required />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Description</span>
        <textarea class="min-h-[96px] rounded-md border border-border bg-background px-3 py-2 text-foreground" bind:value={description}></textarea>
      </label>

      <label class="inline-flex items-center gap-2">
        <input type="checkbox" bind:checked={active} class="h-4 w-4" />
        <span class="text-sm text-foreground">Active</span>
      </label>
    </div>

    <div class="flex items-center gap-2">
      <button type="submit" class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
        Save Session
      </button>
      <a href="/sessions" class="text-sm text-muted-foreground hover:text-foreground">Cancel</a>
    </div>
  </form>
</main>
