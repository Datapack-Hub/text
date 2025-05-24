<script lang="ts">
	import "../app.css";
	import "../fonts.css";
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>Minecraft Text Editor by Datapack Hub</title>
</svelte:head>

<div class="font-lexend bg-zinc-900 text-white min-h-screen h-full w-full">
	{@render children()}
</div>
