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

  const pages = [
    { value: PageSizes.A5, name: 'A5' },
    { value: PageSizes.A4, name: 'A4' },
  ];
</script>

<div class="space-y-6">
  <Label>
    Tamanho da página:
    <Select items={pages} bind:value={config.page.size} />
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
