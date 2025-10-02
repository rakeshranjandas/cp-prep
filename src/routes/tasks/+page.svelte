<script lang="ts">
  import {getTaskState, type Task} from '$lib/state/tasks-state.svelte'

  let taskState = getTaskState();

  let allTasks: Task[] = $derived.by(() => {
    if (!taskState) return [];
    return taskState.getAllTasks();
  });

  let dueTasks: Task[] = $derived.by(() => {
    if (!taskState) return [];
    return taskState.getDueTasks();
  });

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

  function reviewDateColor(isoDate: string | undefined) {
    if (!isoDate) return '';
    const today = new Date();
    const date = new Date(isoDate);
    // Remove time for today comparison
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);

    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      // Today or past
      return 'text-red-600 font-bold';
    } else if (diffDays <= 6) {
      // Within this week
      return 'text-red-500';
    } else {
      // Farther than a week
      return 'text-black';
    }
  }
</script>

<section class="flex flex-col gap-4">
  <div class="flex items-center">
    <a
      href="/tasks/new"
      class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 border opacity-50"
    >
      Add Task
    </a>
  </div>
  <div class="grid grid-cols-[1fr_auto] gap-15 items-start">
    <!-- All Tasks Table (left) -->
    <div class="flex-1 overflow-x-auto rounded-lg border bg-card">
    <h2 class="text-lg font-semibold px-4 py-2">All Tasks</h2>
    <table class="w-full text-left text-sm">
      <thead class="bg-muted/50 text-muted-foreground opacity-70 text-xs">
        <tr>
          <th class="px-4 py-3 font-medium">Title</th>
          <th class="px-4 py-3 font-medium text-center">Platform</th>
          <th class="px-4 py-3 font-medium text-center">Tags</th>
          <th class="px-4 py-3 font-medium text-center">Next Review</th>
          <th class="px-4 py-3 font-medium text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each allTasks as t}
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
                  <span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground border">{tag}</span>
                {/each}
                {#if t.tags.length === 0}
                  <span class="text-muted-foreground">—</span>
                {/if}
              </div>
            </td>
            <td class={`px-4 py-3 text-center ${reviewDateColor(t.nextReview)}`}> 
            {t.nextReview}
            </td>
            <td class="px-4 py-3 text-center">
              <span class={`text-sm font-medium ${statusColor(t.status)}`}>{t.status}</span>
            </td>
          </tr>
        {/each}
        {#if allTasks.length === 0}
          <tr>
            <td class="px-4 py-6 text-center text-muted-foreground" colspan="8">
              No tasks to show.
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

    <!-- Due Tasks List (right) -->
    <div class="w-[170px] min-w-[140px] max-w-[240px] rounded-lg border bg-card px-2 py-2 text-right">
      <h2 class="text-base font-semibold mb-2 opacity-50">Due Tasks</h2>
      <ul class="space-y-2">
        {#each dueTasks as t}
          <li class="border-b last:border-b-0 pb-2 text-sm">
            <a href="/tasks/{t.id}" class={`text-foreground hover:underline block ${reviewDateColor(t.nextReview)}`}>
              {t.title}
            </a>
            <!-- <span class={`block text-xs mt-0.5 ${reviewDateColor(t.nextReview)}`}>{t.nextReview}</span> -->
          </li>
        {/each}
        {#if dueTasks.length === 0}
          <li class="text-center text-muted-foreground py-4">No due tasks.</li>
        {/if}
      </ul>
    </div>
  </div>
</section>
