<script lang="ts">
	import tippy from "svelte-tippy";

	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconObfuscate from "~icons/tabler/password";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";

	const { editor } = $props();
</script>

<button
	aria-label="bold"
	onclick={() => editor.chain().focus().toggleBold().run()}
	class="p-1 text-lg hover:bg-white/2 rounded-md font-medium {editor.isActive(
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
	class="p-1 text-lg hover:bg-white/2 rounded-md font-medium {editor.isActive(
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
	class="p-1 text-lg hover:bg-white/2 rounded-md font-medium {editor.isActive(
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
	class="p-1 text-lg hover:bg-white/2 rounded-md font-medium {editor.isActive(
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
	class="p-1 text-lg hover:bg-white/2 rounded-md font-medium {editor.isActive(
		'obfuscated',
	)
		? 'bg-zinc-800'
		: ''}"
	use:tippy={{ content: "Obfuscated", placement: "bottom" }}>
	<IconObfuscate />
</button>
