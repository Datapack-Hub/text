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

	<meta name="twitter:card" content="summary_large_image" />
	<meta property="og:title" content="Minecraft Text and /tellraw Editor" />
	<meta property="og:site_name" content="Datapack Hub" />
	<meta
		property="og:description"
		content="Create /tellraw commands and text components (JSON text) for Minecraft Java Edition with our easy-to-use, modern online tool!" />
	<meta
		property="og:image"
		content="https://us-east-1.tixte.net/uploads/dph.tixte.co/text-editor-banner.png" />
	<meta property="og:url" content="https://text.datapackhub.net/" />
	<meta name="theme-color" content="#ff631a" />
</svelte:head>

<div
	class="font-lexend h-full min-h-screen w-full overflow-clip bg-zinc-900 text-white">
	{@render children()}
</div>
