<script lang="ts">
  import { generatePdf } from '$lib/generate-pdf.js';
  import { Alert, Card, Spinner } from 'flowbite-svelte';
  import { config } from './form-state.svelte.js';
  import { BugOutline } from 'flowbite-svelte-icons';

  interface Props {
    class?: string;
  }
  const { class: className }: Props = $props();
  const classes = ['fixed left-0 top-0', className];

  let src = $state('');
  let processing = $state(true);
  let errorMsg = $state('');

  $effect(() => {
    processing = true;
    errorMsg = '';
    const t = (function (cfg) {
      return setTimeout(async () => {
        try {
          src = await generatePdf(cfg);
        } catch (err) {
          errorMsg = (err as Error).message;
          console.error(err)
          console.error('config', cfg)
        }
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
{#if errorMsg}
  <Alert border color="red" class="absolute left-4 top-4 w-fit opacity-90" padding="sm">
    <BugOutline slot="icon" />
    {errorMsg}
  </Alert>
{/if}
