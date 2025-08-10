<script lang="ts">
  import { generatePages } from '$lib/generate-pages.js';
  import { DocumentRenderer } from '$lib/renderer/document.js';
  import type { Config } from '$lib/types.js';
  import CanvasPagination from './canvas-pagination.svelte';
  import { config } from './form-state.svelte.js';

  interface Props {
    class?: string;
  }

  const { class: className }: Props = $props();

  let canvas: HTMLCanvasElement | undefined;
  let container: HTMLDivElement | undefined;
  let size = $state({ width: 0, height: 0 });
  let cfg = $derived($state.snapshot(config) as Config);
  let pages = $derived(generatePages(cfg));
  let totalPages = $derived(pages.length);
  let currentPage = $state(0);

  $effect(() => {
    if (!canvas || !size) return;
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) return;

    const docRenderer = new DocumentRenderer(cfg, 'canvas', context);
    // Render logic: first page alone, then pairs
    if (currentPage === 0) {
      docRenderer.renderCanvas(undefined, pages[0]);
    } else {
      docRenderer.renderCanvas(pages[currentPage], pages[currentPage + 1]);
    }
  });

  $effect(() => {
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      size = { width, height };
    });
    ro.observe(container);
    return () => ro.disconnect();
  });
</script>

<div class={['flex flex-col', className]}>
  <CanvasPagination bind:currentPage {totalPages} />

  <div class="relative h-full w-full flex-1" bind:this={container}>
    <canvas class="absolute inset-0 h-full w-full" bind:this={canvas}></canvas>
  </div>
</div>
