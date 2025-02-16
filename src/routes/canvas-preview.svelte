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

  $effect(() => {
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
  });

  $effect(() => {
    // size has to be mentioned to re-run the effect on its change
    if (!context || !size) return;
    const docRenderer = new DocumentRenderer(cfg, 'canvas', context);
    docRenderer.renderCanvas(pages);
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

<canvas class={['block', className]} bind:this={canvas}></canvas>
