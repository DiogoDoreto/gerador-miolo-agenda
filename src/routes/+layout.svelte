<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
	<title>Gerador de Miolo de Agenda</title>
</svelte:head>

{@render children()}
