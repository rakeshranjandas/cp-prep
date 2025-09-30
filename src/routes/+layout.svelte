<script lang="ts">
    import { setTaskState } from '$lib/state/tasks-state.svelte';
  import '../app.css';
  let { children } = $props();
  let taskState = setTaskState()
</script>

<header class="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="/" class="font-semibold text-foreground">CP Prep</a>
    <div class="flex items-center gap-2">
      <a
        href="/tasks"
        class="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >Tasks</a
      >
      <a
        href="/sessions"
        class="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >Sessions</a
      >
    </div>
  </nav>
</header>

<main class="mx-auto max-w-6xl p-4 md:p-6">
  {@render children()}
</main>
