<script lang="ts">
	import { tooltip } from "$lib/tooltip";
	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconObfuscate from "~icons/tabler/password";
	import IconShadow from "~icons/tabler/shadow";

	const { editor, small = false } = $props();
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
	<label
		for="shadow_color{small ? "_small" : ""}"
		aria-label="Shadow Color"
		{@attach tooltip}
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} rounded-md font-medium hover:bg-white/3">
		<IconShadow />
	</label>
	<input
		type="color"
		id="shadow_color{small ? "_small" : ""}"
		class="w-0"
		bind:value={shadowColorValue}
		onchange={() =>
			editor.chain().focus().setShadowColor(shadowColorValue).run()} />
{/if}
