<script lang="ts">
	import "../app.css";
	import "../fonts.css";
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>Minecraft Text Editor</title>
	<meta name="title" content="Minecraft Text Editor" />
	<meta
		name="description"
		content="Minecraft Tellraw Editor for Java Edition. Create colored Minecraft /tellraw, /title, and items with our easy to use editor (especially for datapacks)." />
	<meta
		name="keywords"
		content="minecraft, tellraw, text, editor, java edition, commands, datapacks, title, item lore, coloured, tool" />
	<meta name="robots" content="index, follow" />
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="language" content="English" />
	<meta name="author" content="Datapack Hub" />

	<meta property="og:title" content="Minecraft Text Editor" />
	<meta property="og:description" content="Create /tellraw commands and text components (JSON text) for Minecraft Java Edition with our easy-to-use, modern online tool!" />
	<meta property="og:image" content="https://us-east-1.tixte.net/uploads/dph.tixte.co/text-editor-banner.png" />
	<meta property="og:url" content="https://text.datapackhub.net/" />
</svelte:head>

<div
	class="font-lexend bg-zinc-900 text-white min-h-screen min-w-screen h-full w-full">
	{@render children()}
</div>
