<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { page } from '$app/stores';
  import type { Task } from '$lib/data/sample';
  import { tasks } from '$lib/data/sample';
  import { derived } from 'svelte/store';
  
  import { writable } from 'svelte/store';

  const task = derived(page, ($page) => tasks.find((t) => t.id === $page.params.id) ?? null);

  const editMode = writable(false);
  const draft = writable<Task | null>(null);
  const tagsInput = writable('');

  $effect(() => {
    const t = $task;
    if (t && !$editMode) {
      draft.set({ ...t, tags: [...t.tags] });
      tagsInput.set(t.tags.join(', '));
    }
    if (!t) {
      draft.set(null);
      tagsInput.set('');
    }
  });

  function onEdit() {
    editMode.set(true);
  }
  function onCancel() {
    editMode.set(false);
  }
  function onUpdate(event: SubmitEvent) {
    event.preventDefault();
    const currentDraft = $draft;
    if (!currentDraft) return;
    currentDraft.tags = $tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    editMode.set(false);
  }
</script>

<main class="max-w-5xl mx-auto p-6 space-y-6">
  <header class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-foreground text-pretty">Task Details</h1>
    <div class="flex items-center gap-2">
      {#if $task}
        {#if !$editMode}
          <button class="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
                  onclick={onEdit}>Edit</button>
        {:else}
          <button class="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
                  onclick={onCancel}>Cancel</button>
          <button class="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
                  onclick={preventDefault((e) => onUpdate(e as unknown as SubmitEvent))}>Update</button>
        {/if}
      {/if}
      <a href="/tasks" class="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">
        Back to Tasks
      </a>
    </div>
  </header>

  {#if $task}
    <section class="rounded-lg border border-border bg-card text-card-foreground">
      <div class="p-6 space-y-4">
        {#if $editMode && $draft}
          <form onsubmit={preventDefault(onUpdate)} class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Title</span>
                <input class="w-full rounded-md border border-border bg-background px-3 py-2"
                       type="text" bind:value={$draft.title} />
              </label>

              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Platform</span>
                <select class="w-full rounded-md border border-border bg-background px-3 py-2"
                        bind:value={$draft.platform}>
                  <option>LeetCode</option>
                  <option>Codeforces</option>
                  <option>AtCoder</option>
                  <option>CodeChef</option>
                </select>
              </label>

              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Difficulty</span>
                <select class="w-full rounded-md border border-border bg-background px-3 py-2"
                        bind:value={$draft.difficulty}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </label>

              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Status</span>
                <select class="w-full rounded-md border border-border bg-background px-3 py-2"
                        bind:value={$draft.status}>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Solved</option>
                  <option>Review</option>
                </select>
              </label>

              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Last Reviewed</span>
                <input class="w-full rounded-md border border-border bg-background px-3 py-2"
                       type="date" bind:value={$draft.lastReviewed} />
              </label>

              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Interval (days)</span>
                <input class="w-full rounded-md border border-border bg-background px-3 py-2"
                       type="number" min="0" bind:value={$draft.intervalDays} />
              </label>
            </div>

            <label class="space-y-1 block">
              <span class="text-sm text-muted-foreground">Tags (comma-separated)</span>
              <input class="w-full rounded-md border border-border bg-background px-3 py-2"
                     type="text" bind:value={$tagsInput} placeholder="array, dp, graphs" />
            </label>

            <label class="space-y-1 block">
              <span class="text-sm text-muted-foreground">URL (optional)</span>
              <input class="w-full rounded-md border border-border bg-background px-3 py-2"
                     type="url" bind:value={$draft.url} placeholder="https://..." />
            </label>

            <label class="space-y-1 block">
              <span class="text-sm text-muted-foreground">Notes (optional)</span>
              <textarea class="w-full rounded-md border border-border bg-background px-3 py-2"
                        rows="4" bind:value={$draft.notes} placeholder="Key takeaways..."></textarea>
            </label>

            <div class="pt-2">
              <button class="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">
                Update
              </button>
            </div>
          </form>
        {:else}
          <div>
            <div class="text-sm text-muted-foreground">Title</div>
            <div class="text-lg font-semibold">{$task.title}</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-muted-foreground">Platform</div>
              <div class="text-base">{$task.platform}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Difficulty</div>
              <div class="text-base">{$task.difficulty}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Status</div>
              <div class="text-base">{$task.status}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Last Reviewed</div>
              <div class="text-base">{$task.lastReviewed}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Interval</div>
              <div class="text-base">{$task.intervalDays} days</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">URL</div>
              <div class="text-base">
                {#if $task.url}
                  <a href={$task.url} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                    Open Problem
                  </a>
                {:else}
                  <span class="text-muted-foreground">—</span>
                {/if}
              </div>
            </div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Tags</div>
            <div class="flex flex-wrap gap-2 mt-1">
              {#each $task.tags as tag}
                <span class="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{tag}</span>
              {/each}
              {#if $task.tags.length === 0}
                <span class="text-muted-foreground">No tags</span>
              {/if}
            </div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Notes</div>
            <p class="text-base leading-relaxed mt-1">
              {#if $task.notes}
                {$task.notes}
              {:else}
                <span class="text-muted-foreground">No notes added yet.</span>
              {/if}
            </p>
          </div>
        {/if}
      </div>
    </section>
  {:else}
    <section class="rounded-lg border border-border bg-card text-card-foreground p-6">
      <p class="text-muted-foreground">Task not found.</p>
    </section>
  {/if}
</main>
