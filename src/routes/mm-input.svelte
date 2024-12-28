<script lang="ts">
  import { points_to_mm, mm_to_points } from '$lib/units.js';
  import { ButtonGroup, Input, InputAddon } from 'flowbite-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    value: number;
    children?: Snippet;
  }
  let { children, value = $bindable() }: Props = $props();
</script>

<ButtonGroup>
  {@render children?.()}
  <Input
    type="number"
    min="0"
    class="w-16"
    bind:value={() => points_to_mm(value), (v) => (value = mm_to_points(v))}
  />
  <InputAddon>mm</InputAddon>
</ButtonGroup>
