<script lang="ts">
	import tippy from "svelte-tippy";

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
	aria-label="bold"
	onclick={() => editor.chain().focus().toggleBold().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'bold',
	)
		? 'bg-zinc-800'
		: ''}"
	use:tippy={{ content: "Bold", placement: "bottom" }}>
	<IconBold />
</button>
<button
	aria-label="italic"
	onclick={() => editor.chain().focus().toggleItalic().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'italic',
	)
		? 'bg-zinc-800'
		: ''}"
	use:tippy={{ content: "Italic", placement: "bottom" }}>
	<IconItalic />
</button>
<button
	aria-label="strikethrough"
	onclick={() => editor.chain().focus().toggleStrike().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'strike',
	)
		? 'bg-zinc-800'
		: ''}"
	use:tippy={{ content: "Strikethrough", placement: "bottom" }}>
	<IconStrikethrough />
</button>
<button
	aria-label="underline"
	onclick={() => editor.chain().focus().toggleUnderline().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'underline',
	)
		? 'bg-zinc-800'
		: ''}"
	use:tippy={{ content: "Underline", placement: "bottom" }}>
	<IconUnderline />
</button>
<button
	aria-label="obfuscated"
	onclick={() => editor.chain().focus().toggleObfuscated().run()}
	class="p-1 {small
		? 'text-sm'
		: 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive(
		'obfuscated',
	)
		? 'bg-zinc-800'
		: ''}"
	use:tippy={{ content: "Obfuscated", placement: "bottom" }}>
	<IconObfuscate />
</button>
{#if editor.isActive("shadowColor")}
	<button
		aria-label="shadow_color"
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} rounded-md bg-zinc-800 font-medium hover:bg-white/3"
		onclick={() => editor.chain().focus().unsetShadowColor().run()}
		use:tippy={{ content: "Shadow Color", placement: "bottom" }}>
		<IconShadow />
	</button>
{:else}
	<label
		for="shadow_color"
		aria-label="shadow_color"
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} rounded-md font-medium hover:bg-white/3"
		use:tippy={{ content: "Shadow Color", placement: "bottom" }}>
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
