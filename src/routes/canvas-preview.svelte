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
  let context = $derived(canvas?.getContext('2d'));
  let size = $state({ width: 0, height: 0 });

  let cfg = $derived($state.snapshot(config) as Config);
  let pages = $derived(generatePages(cfg));
  let totalPages = $derived(pages.length);
  let currentPage = $state(0);

  $effect(() => {
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
  });

  $effect(() => {
    // size has to be mentioned to re-run the effect when it changes
    if (!context || !size) return;
    const docRenderer = new DocumentRenderer(cfg, 'canvas', context);
    // Render logic: first page alone, then pairs
    if (currentPage === 0) {
      docRenderer.renderCanvas(undefined, pages[0]);
    } else {
      docRenderer.renderCanvas(pages[currentPage], pages[currentPage + 1]);
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
</script>

<div class={['flex flex-col', className]}>
  <CanvasPagination bind:currentPage {totalPages} />

  <canvas class={['block flex-1']} bind:this={canvas}></canvas>
</div>
