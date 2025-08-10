<script lang="ts">
  import { Button } from 'flowbite-svelte';

  interface Props {
    currentPage: number;
    totalPages: number;
    class?: string;
  }

  let { currentPage = $bindable(), totalPages }: Props = $props();

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

  // Progress bar: percentage of pages completed (0-100)
  let progressPercent = $derived(totalPages > 1 ? ((currentPage + 1) / totalPages) * 100 : 100);

  let dragging = $state(false);
  let barRef: HTMLDivElement | null = null;

  function handlePointerDown(event: PointerEvent) {
    dragging = true;
    document.body.style.userSelect = 'none';
    updatePageFromPointer(event);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }
  function handlePointerMove(event: PointerEvent) {
    if (!dragging) return;
    updatePageFromPointer(event);
  }
  function handlePointerUp() {
    dragging = false;
    document.body.style.userSelect = '';
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }
  function updatePageFromPointer(event: PointerEvent) {
    if (!barRef) return;
    const rect = barRef.getBoundingClientRect();
    let x = event.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percent = x / rect.width;
    let newPage = Math.round(percent * (totalPages - 1));
    newPage = Math.max(0, Math.min(newPage, totalPages - 1));
    if (newPage === 0) {
      currentPage = 0;
    } else if (newPage % 2 === 0) {
      currentPage = newPage === totalPages - 1 ? newPage - 1 : newPage + 1;
    } else {
      currentPage = newPage;
    }
  }
</script>

<div
  class="group relative z-1 flex w-full flex-col items-center"
  role="region"
  aria-label="Navegação de páginas"
  bind:this={barRef}
>
  <div class="flex w-full items-center justify-center gap-4 p-3 shadow-md">
    <Button
      onclick={prevPage}
      disabled={prevDisabled}
      class="rounded border px-2 py-1 disabled:opacity-50"
    >
      Anterior
    </Button>
    <span>
      {showingStart === showingEnd
        ? `Mostrando página ${showingStart} de ${totalPages}`
        : `Mostrando páginas ${showingStart}–${showingEnd} de ${totalPages}`}
    </span>
    <Button
      onclick={nextPage}
      disabled={nextDisabled}
      class="rounded border px-2 py-1 disabled:opacity-50"
    >
      Próxima
    </Button>
  </div>

  <div
    class="bg-secondary-500 absolute bottom-0 left-0 h-1"
    style:width={`${progressPercent}%`}
  ></div>
  <div
    class="border-secondary-500 absolute bottom-0 z-10 size-5 translate-y-[calc(50%-2px)] cursor-grab rounded-full border-2 bg-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 active:cursor-grabbing active:opacity-100"
    style:left={`calc(${progressPercent}% - var(--spacing) * 5 / 2)`}
    onpointerdown={handlePointerDown}
    role="slider"
    aria-valuenow={currentPage + 1}
    aria-valuemin={1}
    aria-valuemax={totalPages}
    aria-label="Arraste para mudar de página"
  ></div>
</div>
