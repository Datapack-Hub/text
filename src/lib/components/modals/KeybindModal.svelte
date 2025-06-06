<script>
	import Modal from "$lib/Modal.svelte";
	import Key from "../Key.svelte";

	let { keybindDialog = $bindable() } = $props();

	const keysAndActions = [
		{ keys: ["Ctrl", "Shift", "G"], action: "Color Gradient" },
		{ keys: ["Ctrl", "Shift", "K"], action: "Keybinds dialog (this one)" },
		{ keys: ["Ctrl", "Shift", "T"], action: "Click Event dialog" },
		{ keys: ["Ctrl", "Shift", "E"], action: "Export" },
		{ keys: ["Ctrl", "Shift", "W"], action: "Add Custom Source" },
		{ keys: ["Ctrl", "Shift", "H"], action: "Hover Event" },
		{ keys: ["Ctrl", "Shift", "C"], action: "Custom Color" },
		{ keys: ["Ctrl", "Shift", "L"], action: "Load a snapshot" },
		{ keys: ["Ctrl", "Shift", "I"], action: "Import from NBT" },
		// normal text editor keybinds
		{ keys: ["Ctrl", "B"], action: "Bold" },
		{ keys: ["Ctrl", "I"], action: "Italic" },
		{ keys: ["Ctrl", "U"], action: "Underline" },
		{ keys: ["Ctrl", "Shift", "S"], action: "Strikethrough" },
		{ keys: ["Ctrl", "O"], action: "Obfuscate (random characters)" },
		{ keys: ["Ctrl", "Z"], action: "Undo" },
		{ keys: ["Ctrl", "Y"], action: "Redo" },
		{ keys: ["Ctrl", "Shift", "X"], action: "Clear all formatting" },
	];
</script>

<Modal title="Keybinds" bind:this={keybindDialog} opened big key="K">
	<div class="grid grid-cols-2">
		{#each keysAndActions as { keys, action }}
			<div class="flex gap-2 items-center mb-2">
				{#each keys as key}
					<Key>{key}</Key>
				{/each}
				-
				<span>{action}</span>
			</div>
		{/each}
	</div>
</Modal>
