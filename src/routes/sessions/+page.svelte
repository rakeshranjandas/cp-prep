<script lang="ts">
  import { sessions as initialSessions, tasks as allTasks, type Session } from '$lib/data/sample';

  let sessions = [...initialSessions];

  let selectedTab: 'active' | 'all' = $state('active');
  const visibleSessions = sessions.filter((s) => selectedTab === 'active' ? s.active : true);

  function taskTitles(ids: string[]) {
    return ids
      .map((id) => allTasks.find((t) => t.id === id)?.title || id)
      .filter(Boolean);
  }
</script>

<section class="space-y-4">
  <div class="flex items-center justify-between gap-3">
    <div role="tablist" aria-label="Sessions view" class="flex items-center gap-2">
      <button
        role="tab"
        aria-selected={selectedTab === 'active'}
        onclick={() => (selectedTab = 'active')}
        class="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
        data-active={selectedTab === 'active'}
      >
        Active
      </button>
      <button
        role="tab"
        aria-selected={selectedTab === 'all'}
        onclick={() => (selectedTab = 'all')}
        class="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
        data-active={selectedTab === 'all'}
      >
        All
      </button>
    </div>

    <a
      href="/sessions/new"
      class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
    >
      Add Session
    </a>
  </div>

  <div class="overflow-x-auto rounded-lg border bg-card">
    <table class="w-full text-left text-sm">
      <thead class="bg-muted/50 text-muted-foreground opacity-70 text-xs">
        <tr>
          <th class="px-4 py-3 font-medium">Label</th>
          <th class="px-4 py-3 font-medium">Description</th>
          <th class="px-4 py-3 font-medium">Tasks</th>
          <th class="px-4 py-3 font-medium">Active</th>
        </tr>
      </thead>
      <tbody>
        {#each visibleSessions as s}
          <tr class="border-t">
            <td class="px-4 py-3">
              <a href="/sessions/{s.id}" class="font-medium text-foreground hover:underline">{s.label}</a>
            </td>
            <td class="px-4 py-3 text-foreground">{s.description}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                {#each taskTitles(s.taskIds) as title}
                  <span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{title}</span>
                {/each}
                {#if s.taskIds.length === 0}
                  <span class="text-muted-foreground">—</span>
                {/if}
              </div>
            </td>
            <td class="px-4 py-3">
              {#if s.active}
                <span class="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Active</span>
              {:else}
                <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">Paused</span>
              {/if}
            </td>
          </tr>
        {/each}
        {#if visibleSessions.length === 0}
          <tr>
            <td class="px-4 py-6 text-center text-muted-foreground" colspan="4">
              No sessions to show.
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</section>
