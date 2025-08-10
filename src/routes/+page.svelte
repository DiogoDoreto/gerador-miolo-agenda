<script lang="ts">
  import { TabItem, Tabs } from 'flowbite-svelte';
  import { BookOpenOutline, ClipboardOutline, PaletteOutline } from 'flowbite-svelte-icons';
  import CanvasPreview from './canvas-preview.svelte';
  import FormColors from './form-colors.svelte';
  import FormData from './form-data.svelte';
  import FormPage from './form-page.svelte';
  import PdfPreview from './pdf-preview.svelte';

  let showCanvasPreview = $state(true);
</script>

<div class="ml-[50vw] lg:ml-[70vw]">
  <Tabs tabStyle="underline">
    <TabItem open>
      {#snippet titleSlot()}
        <div class="flex items-center gap-2">
          <ClipboardOutline />
          Dados
        </div>
      {/snippet}
      <FormData />
    </TabItem>
    <TabItem>
      {#snippet titleSlot()}
        <div class="flex items-center gap-2">
          <PaletteOutline />
          Cores
        </div>
      {/snippet}
      <FormColors />
    </TabItem>
    <TabItem>
      {#snippet titleSlot()}
        <div class="flex items-center gap-2">
          <BookOpenOutline />
          Página
        </div>
      {/snippet}
      <FormPage />
    </TabItem>
  </Tabs>
</div>

{#if showCanvasPreview}
  <CanvasPreview class="fixed top-0 left-0 h-screen w-[50vw] lg:w-[70vw]" />
{:else}
  <PdfPreview class="w-[50vw] lg:w-[70vw]" />
{/if}
