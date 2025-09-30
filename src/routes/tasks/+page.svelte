<script lang="ts">
  import {getTaskState, type Task} from '$lib/state/tasks-state.svelte'

  let selectedTab: 'due' | 'all' = $state('due');

 let taskState = getTaskState()

 let tasks: Task[] = $derived.by(() => {
  if (!taskState) return [];
  return selectedTab == 'due' ? taskState.getDueTasks() : taskState.getAllTasks()
 })

  function statusColor(s: Task['status']) {
    switch (s) {
      case 'Todo':
        return 'text-muted-foreground';
      case 'In Progress':
        return 'text-blue-700';
      case 'Solved':
        return 'text-emerald-700';
      case 'Review':
        return 'text-amber-700';
    }
  }
</script>

<section class="space-y-4">
  <div class="flex items-center justify-between gap-3">
    <div role="tablist" aria-label="Tasks view" class="flex items-center gap-2">
      <button
        role="tab"
        aria-selected={selectedTab === 'due'}
        onclick={() => (selectedTab = 'due')}
        class="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
        data-active={selectedTab === 'due'}
      >
        Due
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
      href="/tasks/new"
      class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
    >
      Add Task
    </a>
  </div>

  <div class="overflow-x-auto rounded-lg border bg-card">
    <table class="w-full text-left text-sm">
      <thead class="bg-muted/50 text-muted-foreground opacity-70 text-xs">
        <tr>
          <th class="px-4 py-3 font-medium">Title</th>
          <th class="px-4 py-3 font-medium text-center">Platform</th>
          <th class="px-4 py-3 font-medium text-center">Tags</th>
          <th class="px-4 py-3 font-medium text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each tasks as t}
          <tr class="border-t">
            <td class="px-4 py-3">
              <a href="/tasks/{t.id}" class="font-medium text-foreground hover:underline">{t.title}</a>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{t.platform}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex flex-wrap gap-1 justify-center">
                {#each t.tags as tag}
                  <span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                {/each}
                {#if t.tags.length === 0}
                  <span class="text-muted-foreground">—</span>
                {/if}
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <span class={`text-sm font-medium ${statusColor(t.status)}`}>{t.status}</span>
            </td>
          </tr>
        {/each}
        {#if tasks.length === 0}
          <tr>
            <td class="px-4 py-6 text-center text-muted-foreground" colspan="8">
              No tasks to show.
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

</section>
