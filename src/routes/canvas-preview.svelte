<script lang="ts">
  interface Props {
    class?: string;
  }

  const { class: className }: Props = $props();

  let canvas: HTMLCanvasElement | undefined;
  let size = $state({ width: 0, height: 0 });

  $effect(() => {
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
    ctx.fillStyle = 'black';
    ctx.fillRect(5, size.height - 105, 100, 100);
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
