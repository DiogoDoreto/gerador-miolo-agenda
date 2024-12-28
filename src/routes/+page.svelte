<script lang="ts">
  import { TabItem, Tabs } from 'flowbite-svelte';
  import { BookOpenOutline, ClipboardOutline, PaletteOutline } from 'flowbite-svelte-icons';
  import FormColors from './form-colors.svelte';
  import FormData from './form-data.svelte';
  import FormPage from './form-page.svelte';
  import PdfPreview from './pdf-preview.svelte';
</script>

<div class="ml-[50vw] lg:ml-[70vw]">
  <Tabs tabStyle="underline">
    <TabItem open>
      <div slot="title" class="flex items-center gap-2">
        <BookOpenOutline />
        Página
      </div>
      <FormPage />
    </TabItem>
    <TabItem>
      <div slot="title" class="flex items-center gap-2">
        <PaletteOutline />
        Cores
      </div>
      <FormColors />
    </TabItem>
    <TabItem>
      <div slot="title" class="flex items-center gap-2">
        <ClipboardOutline />
        Dados
      </div>
      <FormData />
    </TabItem>
  </Tabs>
</div>

<PdfPreview class="w-[50vw] lg:w-[70vw]" />
