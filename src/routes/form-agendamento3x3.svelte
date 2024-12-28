<script lang="ts">
  import type { Agendamento3x3Config } from '$lib/types.js';
  import { Label, NumberInput, Textarea } from 'flowbite-svelte';

  interface Props {
    value?: Agendamento3x3Config;
  }
  let { value = $bindable() }: Props = $props();

  let formValue: Agendamento3x3Config = $state(
    value || {
      kind: 'agendamento3x3',
      timesheet: generateDefaultTimesheet(),
      rowsPerTime: 3,
    }
  );

  $effect(() => {
    const valueSnapshot = $state.snapshot(formValue);
    const keys = Array.from(Object.keys(valueSnapshot)) as (keyof Agendamento3x3Config)[];
    const changed = !value || keys.some((key) => value![key] !== valueSnapshot[key]);
    if (changed) {
      value = valueSnapshot;
    }
  });

  function generateDefaultTimesheet() {
    const formatTime = (n: number) => `${String(n).padStart(2, '0')}:00`;
    return Array.from({ length: 9 })
      .map((_, index) => formatTime(index + 8))
      .join('\n');
  }
</script>

<div class="space-y-4">
  <Label>
    Linhas entre horários:
    <NumberInput min={1} bind:value={formValue.rowsPerTime} />
  </Label>

  <Label>
    Lista de horários (1 por linha):
    <Textarea rows={10} bind:value={formValue.timesheet} />
  </Label>
</div>
