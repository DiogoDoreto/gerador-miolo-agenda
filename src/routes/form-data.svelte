<script lang="ts">
  import { Checkbox, Label, Select } from 'flowbite-svelte';
  import FormAgendamento3x3 from './form-agendamento3x3.svelte';
  import { config } from './form-state.svelte.js';

  const thisYear = new Date().getUTCFullYear();
  const yearList = [
    { value: thisYear, name: thisYear },
    { value: thisYear + 1, name: thisYear + 1 },
  ];

  const innerTemplates = [{ value: FormAgendamento3x3, name: 'Agendamento 3x3' }];

  let InnerTemplateForm = $state(innerTemplates[0].value);
</script>

<div class="space-y-4">
  <Label>
    Ano:
    <Select items={yearList} bind:value={config.data.year} />
  </Label>

  <Checkbox bind:checked={config.data.showCalendarPages}>Páginas de calendário</Checkbox>

  <Label>
    Template do miolo
    <Select items={innerTemplates} bind:value={InnerTemplateForm} />
  </Label>

  <InnerTemplateForm bind:value={config.data.innerTemplateConfig} />
</div>
