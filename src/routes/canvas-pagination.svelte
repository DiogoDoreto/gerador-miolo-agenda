<script lang="ts">
  import { Button } from 'flowbite-svelte';

  interface Props {
    currentPage: number;
    totalPages: number;
    class?: string;
  }

  let { currentPage = $bindable(), totalPages, class: className }: Props = $props();

  // Clamp currentPage to valid range if total pages change
  $effect(() => {
    if (currentPage < 0) currentPage = 0;
    if (currentPage >= totalPages) currentPage = Math.max(0, totalPages - 1);
  });

  // For this pagination: first page solo, then pairs (1+2, 3+4, ...)
  function prevPage() {
    if (currentPage > 0) {
      if (currentPage === 1) currentPage = 0;
      else currentPage = Math.max(1, currentPage - 2);
    }
  }
  function nextPage() {
    // If on first page, jump to 1; else +2, but don't exceed totalPages
    if (currentPage === 0 && totalPages > 1) currentPage = 1;
    else if (currentPage + 2 < totalPages) currentPage += 2;
    else if (currentPage + 1 < totalPages) currentPage += 1;
  }

  let showingStart = $derived(currentPage + 1);
  let showingEnd = $derived(currentPage === 0 ? 1 : Math.min(currentPage + 2, totalPages));
  let prevDisabled = $derived(currentPage === 0);
  let nextDisabled = $derived(
    (currentPage === 0 && totalPages <= 1) || (currentPage > 0 && currentPage + 1 >= totalPages)
  );
</script>

<div class={['z-1 flex items-center justify-center gap-4 p-2 shadow-md', className]}>
  <Button
    onclick={prevPage}
    disabled={prevDisabled}
    class="rounded border px-2 py-1 disabled:opacity-50"
  >
    Previous
  </Button>
  <span>
    {showingStart === showingEnd
      ? `Showing page ${showingStart} of ${totalPages}`
      : `Showing pages ${showingStart}–${showingEnd} of ${totalPages}`}
  </span>
  <Button
    onclick={nextPage}
    disabled={nextDisabled}
    class="rounded border px-2 py-1 disabled:opacity-50"
  >
    Next
  </Button>
</div>
