<script lang="ts">
  import { generatePages } from '$lib/generate-pages.js';
  import { DocumentRenderer } from '$lib/renderer/document.js';
  import type { Config } from '$lib/types.js';
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

  let pageIndex = $state(0);
  const pagesPerView = 2;

  // Clamp pageIndex to valid range if pages change
  $effect(() => {
    if (pageIndex > pages.length - 1) {
      pageIndex = Math.max(
        0,
        pages.length -
          (pages.length % pagesPerView === 0 ? pagesPerView : pages.length % pagesPerView)
      );
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
    // Only render the current slice of pages
    docRenderer.renderCanvas(pages.slice(pageIndex, pageIndex + pagesPerView));
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
    pageIndex = Math.max(0, pageIndex - pagesPerView);
  }
  function nextPage() {
    pageIndex = Math.min(
      pages.length -
        (pages.length % pagesPerView === 0 ? pagesPerView : pages.length % pagesPerView),
      pageIndex + pagesPerView
    );
    if (pageIndex >= pages.length)
      pageIndex =
        pages.length -
        (pages.length % pagesPerView === 0 ? pagesPerView : pages.length % pagesPerView);
  }

  let showingStart = $derived(pageIndex + 1);
  let showingEnd = $derived(Math.min(pageIndex + pagesPerView, pages.length));
  let totalPages = $derived(pages.length);
  let prevDisabled = $derived(pageIndex === 0);
  let nextDisabled = $derived(pageIndex + pagesPerView >= pages.length);
</script>

<div class={['flex flex-col', className]}>
  <div class="mb-2 flex items-center gap-4">
    <button
      onclick={prevPage}
      disabled={prevDisabled}
      class="rounded border px-2 py-1 disabled:opacity-50">Previous</button
    >
    <span>
      Showing pages {showingStart}{showingEnd > showingStart ? `–${showingEnd}` : ''} of {totalPages}
    </span>
    <button
      onclick={nextPage}
      disabled={nextDisabled}
      class="rounded border px-2 py-1 disabled:opacity-50">Next</button
    >
  </div>

  <canvas class={['block flex-1']} bind:this={canvas}></canvas>
</div>
