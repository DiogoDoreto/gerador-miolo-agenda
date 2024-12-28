<script lang="ts">
  import { generatePdf } from '$lib/generate-pdf.js';
  import { Card, Spinner } from 'flowbite-svelte';
  import { config } from './form-state.svelte.js';

  interface Props {
    class?: string;
  }
  const { class: className }: Props = $props();
  const classes = ['fixed left-0 top-0', className];

  let src = $state('');
  let processing = $state(true);

  $effect(() => {
    processing = true;
    const t = (function (cfg) {
      return setTimeout(async () => {
        src = await generatePdf(cfg);
        processing = false;
      }, 500);
    })($state.snapshot(config));
    return () => clearTimeout(t);
  });
</script>

<iframe class={['h-screen', classes]} {src} title="Agenda"></iframe>
{#if processing}
  <Card class="absolute left-4 top-4 w-fit opacity-90" padding="sm">
    <Spinner />
  </Card>
{/if}
