<script lang="ts">
  import { InputAddon, Label, Select } from 'flowbite-svelte';
  import { PageSizes } from 'pdf-lib';
  import { config } from './form-state.svelte.js';
  import MmInput from './mm-input.svelte';
  import {
    ArrowDownOutline,
    ArrowLeftOutline,
    ArrowRightOutline,
    ArrowUpOutline,
  } from 'flowbite-svelte-icons';

  const PageNameToSize = {
    A4: PageSizes.A4,
    A5: PageSizes.A5,
  } as const;

  const pageItems = Array.from(Object.keys(PageNameToSize)).map((p) => ({ name: p, value: p }));

  type PageName = keyof typeof PageNameToSize;
  let selectedPage = $state<PageName>('A5');

  function updatePage(page: PageName) {
    selectedPage = page;
    config.page.size = PageNameToSize[page];
  }
</script>

<div class="space-y-6">
  <Label>
    Tamanho da página:
    <Select items={pageItems} bind:value={() => selectedPage, updatePage} />
  </Label>

  <div class="space-y-2">
    <Label>Margens da página esquerda:</Label>
    <MmInput bind:value={config.page.margins.leftPage.top}>
      <InputAddon>
        <ArrowUpOutline />
      </InputAddon>
    </MmInput>
    <MmInput bind:value={config.page.margins.leftPage.bottom}>
      <InputAddon>
        <ArrowDownOutline />
      </InputAddon>
    </MmInput>
    <MmInput bind:value={config.page.margins.leftPage.left}>
      <InputAddon>
        <ArrowLeftOutline />
      </InputAddon>
    </MmInput>
    <MmInput bind:value={config.page.margins.leftPage.right}>
      <InputAddon>
        <ArrowRightOutline />
      </InputAddon>
    </MmInput>
  </div>

  <div class="space-y-2">
    <Label>Margens da página direita:</Label>
    <MmInput bind:value={config.page.margins.rightPage.top}>
      <InputAddon>
        <ArrowUpOutline />
      </InputAddon>
    </MmInput>
    <MmInput bind:value={config.page.margins.rightPage.bottom}>
      <InputAddon>
        <ArrowDownOutline />
      </InputAddon>
    </MmInput>
    <MmInput bind:value={config.page.margins.rightPage.left}>
      <InputAddon>
        <ArrowLeftOutline />
      </InputAddon>
    </MmInput>
    <MmInput bind:value={config.page.margins.rightPage.right}>
      <InputAddon>
        <ArrowRightOutline />
      </InputAddon>
    </MmInput>
  </div>
</div>
