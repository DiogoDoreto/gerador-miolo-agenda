<script lang="ts">
  import { Alert, Card, Spinner } from 'flowbite-svelte';
  import { BugOutline } from 'flowbite-svelte-icons';
  import { config } from './form-state.svelte.js';
  import type { Config } from '$lib/types.js';
  import { DocumentRenderer } from '$lib/renderer/document.js';
  import { generatePages } from '$lib/generate-pages.js';

  interface Props {
    class?: string;
  }
  const { class: className }: Props = $props();

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

<iframe class={['fixed top-0 left-0 h-screen', className]} {src} title="Agenda"></iframe>
{#if processing}
  <Card class="absolute top-4 left-4 w-fit p-3 opacity-90">
    <Spinner />
  </Card>
{/if}
{#if errorMsg}
  <Alert border color="red" class="absolute top-4 left-4 w-fit p-3 opacity-90">
    {#snippet icon()}<BugOutline class="size-4" />{/snippet}
    {errorMsg}
  </Alert>
{/if}
