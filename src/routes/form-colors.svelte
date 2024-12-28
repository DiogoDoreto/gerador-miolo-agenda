<script>
  import { ButtonGroup, Card, Heading, Input, InputAddon } from 'flowbite-svelte';
  import { config } from './form-state.svelte';
</script>

<div class="space-y-4">
  <Card>
    <Heading tag="h3" class="mb-2 text-xl">Tabela</Heading>

    <div class="flex flex-wrap gap-2">
      <label>
        <ButtonGroup>
          <InputAddon>Borda</InputAddon>
          <Input type="color" class="h-14 w-14" bind:value={config.colors.table.border} />
        </ButtonGroup>
      </label>
    </div>
  </Card>

  <Card>
    <Heading tag="h3" class="mb-2 text-xl">Tabela > Cabeçalho</Heading>

    <div class="flex flex-wrap gap-2">
      <label>
        <ButtonGroup>
          <InputAddon>Fundo</InputAddon>
          <Input
            type="color"
            class="h-14 w-14"
            bind:value={config.colors.table.header.background}
          />
        </ButtonGroup>
      </label>
      <label>
        <ButtonGroup>
          <InputAddon>Texto</InputAddon>
          <Input type="color" class="h-14 w-14" bind:value={config.colors.table.header.text} />
        </ButtonGroup>
      </label>
    </div>
  </Card>

  <Card>
    <Heading tag="h3" class="mb-2 text-xl">Tabela > Sub-Cabeçalho</Heading>

    <div class="flex flex-wrap gap-2">
      <label>
        <ButtonGroup>
          <InputAddon>Fundo</InputAddon>
          <Input
            type="color"
            class="h-14 w-14"
            bind:value={config.colors.table.subheader.background}
          />
        </ButtonGroup>
      </label>
      <label>
        <ButtonGroup>
          <InputAddon>Texto</InputAddon>
          <Input type="color" class="h-14 w-14" bind:value={config.colors.table.subheader.text} />
        </ButtonGroup>
      </label>
    </div>
  </Card>
</div>
