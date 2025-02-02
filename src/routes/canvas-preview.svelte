<script lang="ts">
  import { generatePages } from '$lib/generate-pages.js';
  import { renderCanvas } from '$lib/render-canvas.js';
  import type { Config } from '$lib/types.js';
  import { config } from './form-state.svelte.js';

  interface Props {
    class?: string;
  }

  const { class: className }: Props = $props();

  let canvas: HTMLCanvasElement | undefined;
  let size = $state({ width: 0, height: 0 });

  $effect(() => {
    const t = (function (cfg) {
      return setTimeout(() => {
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        canvas.width = size.width;
        canvas.height = size.height;
        const pages = generatePages(cfg);
        renderCanvas(ctx, cfg, [pages[1], pages[2]]);
      }, 500);
    })($state.snapshot(config) as Config);
    return () => clearTimeout(t);
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
