<script lang="ts">
	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconObfuscate from "~icons/tabler/password";
	import IconShadow from "~icons/tabler/shadow";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";

	const { editor, small = false } = $props();
	let shadowColorValue = $state("#ffffff");
</script>

<button
	aria-label="Bold"
	onclick={() => editor.chain().focus().toggleBold().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} hint--bottom hint--rounded hint--no-shadow rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'bold',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconBold />
</button>
<button
	aria-label="Italic"
	onclick={() => editor.chain().focus().toggleItalic().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} hint--bottom hint--rounded hint--no-shadow rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'italic',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconItalic />
</button>
<button
	aria-label="Strikethrough"
	onclick={() => editor.chain().focus().toggleStrike().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} hint--bottom hint--rounded hint--no-shadow rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'strike',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconStrikethrough />
</button>
<button
	aria-label="Underline"
	onclick={() => editor.chain().focus().toggleUnderline().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} hint--bottom hint--rounded hint--no-shadow rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'underline',
	)
		? 'bg-zinc-800'
		: ''}">
	<IconUnderline />
</button>
<button
	aria-label="Obfuscated"
	onclick={() => editor.chain().focus().toggleObfuscated().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} hint--bottom hint--rounded hint--no-shadow rounded-md font-medium hover:bg-white/3 {editor.isActive(
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
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} hint--bottom hint--rounded hint--no-shadow rounded-md bg-zinc-800 font-medium hover:bg-white/3"
		onclick={() => editor.chain().focus().unsetShadowColor().run()}>
		<IconShadow />
	</button>
{:else}
	<label
		for="shadow_color"
		aria-label="Shadow Color"
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} hint--bottom hint--rounded hint--no-shadow rounded-md font-medium hover:bg-white/3">
		<IconShadow />
	</label>
	<input
		type="color"
		id="shadow_color"
		class="w-0"
		bind:value={shadowColorValue}
		onchange={() =>
			editor.chain().focus().setShadowColor(shadowColorValue).run()} />
{/if}
