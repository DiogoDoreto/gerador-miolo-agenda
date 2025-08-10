<script lang="ts">
  import { generatePages } from '$lib/generate-pages.js';
  import { DocumentRenderer } from '$lib/renderer/document.js';
  import type { Config } from '$lib/types.js';
  import { Button } from 'flowbite-svelte';
  import { config } from './form-state.svelte.js';

  interface Props {
    class?: string;
  }

  const { class: className }: Props = $props();

  let canvas: HTMLCanvasElement | undefined;
  let context = $derived(canvas?.getContext('2d'));
  let size = $state({ width: 0, height: 0 });

  let cfg = $derived($state.snapshot(config) as Config);
  let pages = $derived(generatePages(cfg));

  let groupIndex = $state(0);
  let maxGroup = $derived(Math.max(0, Math.ceil((pages.length - 1) / 2)));

  // Clamp groupIndex to valid range if pages change
  $effect(() => {
    if (groupIndex > maxGroup) {
      groupIndex = maxGroup;
    }
  });

  $effect(() => {
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
  });

  $effect(() => {
    // size has to be mentioned to re-run the effect on its change
    if (!context || !size) return;
    const docRenderer = new DocumentRenderer(cfg, 'canvas', context);
    // Render logic: first page alone, then pairs
    if (groupIndex === 0) {
      docRenderer.renderCanvas(undefined, pages[0]);
    } else {
      const pageIndex = 1 + 2 * (groupIndex - 1);
      docRenderer.renderCanvas(pages[pageIndex], pages[pageIndex + 1]);
    }
  });

  $effect(() => {
    if (!canvas) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          size = { width: entry.contentRect.width, height: entry.contentRect.height };
        }
      }
    });

    ro.observe(canvas);
    return () => ro.disconnect();
  });

  function prevPage() {
    groupIndex = Math.max(0, groupIndex - 1);
  }
  function nextPage() {
    groupIndex = Math.min(maxGroup, groupIndex + 1);
  }

  let showingStart = $derived(groupIndex === 0 ? 1 : 2 + (groupIndex - 1) * 2);
  let showingEnd = $derived(
    groupIndex === 0 ? 1 : Math.min(3 + (groupIndex - 1) * 2, pages.length)
  );
  let totalPages = $derived(pages.length);
  let prevDisabled = $derived(groupIndex === 0);
  let nextDisabled = $derived(groupIndex >= maxGroup);
</script>

<div class={['flex flex-col', className]}>
  <div class="z-1 flex items-center justify-center gap-4 p-2 shadow-md">
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

  <canvas class={['block flex-1']} bind:this={canvas}></canvas>
</div>
