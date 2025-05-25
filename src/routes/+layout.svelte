<script lang="ts">
	import "../app.css";
	import "../fonts.css";
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>Minecraft Text Editor</title>
	<meta name="title" content="Minecraft Text Editor">
	<meta name="description" content="Create text components (JSON text) for Minecraft Java Edition commands with our UI!">
	<meta name="keywords" content="datapacks, commands, minecraft, text, json text, minecraft tools">
	<meta name="robots" content="index, follow">
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<meta name="language" content="English">
	<meta name="author" content="Datapack Hub">
</svelte:head>

<div class="font-lexend bg-zinc-900 text-white min-h-screen h-full w-full">
	{@render children()}
</div>
