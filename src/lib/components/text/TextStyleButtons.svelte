<script lang="ts">
	import { colorMap, defaultColorLUT } from "$lib/text/utils";
	import { tooltip } from "$lib/tooltip";
	import type { Editor } from "@tiptap/core";
	import ColorPicker from "svelte-awesome-color-picker";
	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconObfuscate from "~icons/tabler/password";
	import IconShadow from "~icons/tabler/shadow";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";

	const { editor, small = false }: { editor: Editor; small?: boolean } =
		$props();
	let shadowColorValue = $state("#ffffff");
</script>

<button
	aria-label="Bold"
	onclick={() => editor.chain().focus().toggleBold().run()}
	{@attach tooltip}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'bold',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconBold />
</button>
<button
	aria-label="Italic"
	onclick={() => editor.chain().focus().toggleItalic().run()}
	{@attach tooltip}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'italic',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconItalic />
</button>
<button
	aria-label="Strikethrough"
	onclick={() => editor.chain().focus().toggleStrike().run()}
	{@attach tooltip}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'strike',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconStrikethrough />
</button>
<button
	aria-label="Underline"
	onclick={() => editor.chain().focus().toggleUnderline().run()}
	{@attach tooltip}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'underline',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconUnderline />
</button>
<button
	aria-label="Obfuscated"
	onclick={() => editor.chain().focus().toggleObfuscated().run()}
	{@attach tooltip}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'obfuscated',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconObfuscate />
</button>
<div class="mx-2 h-5 w-px bg-zinc-600"></div>
{#if editor.isActive("shadowColor")}
	<button
		aria-label="Shadow Color"
		name="shadow_color"
		{@attach tooltip}
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} rounded-md bg-zinc-800 font-medium hover:bg-white/3"
		onclick={() => editor.chain().focus().unsetShadowColor().run()}>
		<IconShadow />
	</button>
{:else}
	<button
		aria-label="Shadow Color"
		name="shadow_color"
		{@attach tooltip}
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} rounded-md font-medium hover:bg-white/3"
		onclick={() => {
			editor.chain().focus().setShadowColor(shadowColorValue).run();
		}}>
		<IconShadow />
	</button>
{/if}
<!-- isAlpha is off because ARGB != RGBA and i want to get the update out -->
<ColorPicker
	isAlpha={false}
	bind:hex={shadowColorValue}
	--cp-bg-color="#18181b"
	--cp-text-color="white"
	--cp-input-color="#0C0C0E"
	--cp-button-hover-color="#18181b"
	--input-size="20px"
	textInputModes={["hex"]}
	swatches={Object.values(colorMap).map((c) => c.value)}
	label="" />
<div class="mx-2 h-5 w-px bg-zinc-600"></div>