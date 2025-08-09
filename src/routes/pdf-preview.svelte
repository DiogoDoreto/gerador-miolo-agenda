<script lang="ts">
  import { Alert, Card, Spinner } from 'flowbite-svelte';
  import { config } from './form-state.svelte.js';
  import { BugOutline } from 'flowbite-svelte-icons';
  import type { Config } from '$lib/types.js';
  import { DocumentRenderer } from '$lib/renderer/document.js';
  import { generatePages } from '$lib/generate-pages.js';

  interface Props {
    class?: string;
  }
  const { class: className }: Props = $props();
  const classes = ['fixed left-0 top-0', className];

  let src = $state('');
  let processing = $state(true);
  let errorMsg = $state('');

  let cfg = $derived($state.snapshot(config) as Config);
  let pages = $derived(generatePages(cfg));
  let docRenderer = $derived(new DocumentRenderer(cfg, 'pdf'));

  $effect(() => {
    const timeout = setTimeout(() => {
      processing = true;
    }, 500);

    docRenderer
      .renderPdfDocument(pages)
      .then((url) => {
        src = url;
      })
      .catch((err) => {
        errorMsg = err.message;
      })
      .finally(() => {
        clearTimeout(timeout);
        processing = false;
      });
  });
</script>

<iframe class={['h-screen', classes]} {src} title="Agenda"></iframe>
{#if processing}
  <Card class="absolute top-4 left-4 w-fit opacity-90" padding="sm">
    <Spinner />
  </Card>
{/if}
{#if errorMsg}
  <Alert border color="red" class="absolute top-4 left-4 w-fit opacity-90" padding="sm">
    <BugOutline slot="icon" />
    {errorMsg}
  </Alert>
{/if}
