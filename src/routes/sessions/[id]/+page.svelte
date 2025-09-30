<script lang="ts">
  import { page } from '$app/stores';
  import { sessions, tasks } from '$lib/data/sample';
  import { derived } from 'svelte/store';
  
  import { writable } from 'svelte/store';

  const id = derived(page, ($page) => $page.params.id);
  const session = derived(id, ($id) => sessions.find((s) => s.id === $id) ?? null);
  const sessionTasks = derived(session, ($session) =>
    $session
      ? $session.taskIds
          .map((tid) => tasks.find((t) => t.id === tid))
          .filter(Boolean)
      : []
  );

  const editMode = writable(false);
  const draft = writable<{ id: string; label: string; description: string; active: boolean } | null>(null);

  $effect(() => {
    const s = session.get();
    const em = editMode.get();
    if (s && !em) {
      draft.set({ id: s.id, label: s.label, description: s.description, active: s.active });
    }
    if (!s) draft.set(null);
  });

  function onEdit() {
    editMode.set(true);
  }

  function onCancel() {
    const s = session.get();
    if (s) {
      draft.set({ id: s.id, label: s.label, description: s.description, active: s.active });
    }
    editMode.set(false);
  }

  function onUpdate(event: SubmitEvent) {
    event.preventDefault();
    editMode.set(false);
  }
</script>

<main class="max-w-5xl mx-auto p-6 space-y-6">
  <header class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-foreground text-pretty">Session Details</h1>
    <div class="flex items-center gap-2">
      {#if $session}
        {#if !$editMode}
          <button class="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
                  onclick={onEdit}>Edit</button>
        {:else}
          <button class="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
                  onclick={onCancel}>Cancel</button>
          <button class="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
                  onclick={(e) => onUpdate(e as unknown as SubmitEvent)}>Update</button>
        {/if}
      {/if}
      <a href="/sessions" class="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">
        Back to Sessions
      </a>
    </div>
  </header>

  {#if $session}
    <section class="rounded-lg border border-border bg-card text-card-foreground">
      <div class="p-6 space-y-4">
        {#if $editMode && $draft}
          <form onsubmit={onUpdate} class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Label</span>
                <input class="w-full rounded-md border border-border bg-background px-3 py-2"
                       type="text" bind:value={$draft.label} />
              </label>

              <label class="space-y-1">
                <span class="text-sm text-muted-foreground">Status</span>
                <div class="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                  <input id="active" type="checkbox" bind:checked={$draft.active} />
                  <label for="active" class="text-sm">Active</label>
                </div>
              </label>
            </div>

            <label class="space-y-1 block">
              <span class="text-sm text-muted-foreground">Description</span>
              <textarea class="w-full rounded-md border border-border bg-background px-3 py-2"
                        rows="4" bind:value={$draft.description}
                        placeholder="What does this session focus on?"></textarea>
            </label>

            <div class="pt-2">
              <button class="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">
                Update
              </button>
            </div>
          </form>
        {:else}
          <div>
            <div class="text-sm text-muted-foreground">Label</div>
            <div class="text-lg font-semibold">{$session.label}</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-muted-foreground">Description</div>
              <div class="text-base">{$session.description}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Status</div>
              {#if $session.active}
                <span class="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  Active
                </span>
              {:else}
                <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  Paused
                </span>
              {/if}
            </div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground mb-2">Included Tasks ({$sessionTasks.length})</div>
            {#if $sessionTasks.length > 0}
              <div class="space-y-2">
                {#each $sessionTasks as task}
                  <div class="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                    <div class="flex-1">
                      <a href={"/tasks/" + task.id} class="font-medium text-foreground hover:underline">
                        {task.title}
                      </a>
                    </div>
                    <span class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {task.platform}
                    </span>
                    <span class="text-sm text-muted-foreground">{task.difficulty}</span>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-muted-foreground">No tasks assigned to this session.</p>
            {/if}
          </div>
        {/if}
      </div>
    </section>
  {:else}
    <section class="rounded-lg border border-border bg-card text-card-foreground p-6">
      <p class="text-muted-foreground">Session not found.</p>
    </section>
  {/if}
</main>
