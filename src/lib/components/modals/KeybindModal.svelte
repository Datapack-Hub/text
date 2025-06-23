<script>
	import Modal from "$lib/components/Modal.svelte";
	import Key from "../Key.svelte";

	let { keybindDialog = $bindable() } = $props();

	const keysAndActions = [
		{ keys: ["Ctrl", "B"], action: "Bold" },
		{ keys: ["Ctrl", "I"], action: "Italic" },
		{ keys: ["Ctrl", "U"], action: "Underline" },
		{ keys: ["Ctrl", "Shift", "S"], action: "Strikethrough" },
		{ keys: ["Ctrl", "O"], action: "Obfuscate" },
		{ keys: ["Ctrl", "Z"], action: "Undo" },
		{ keys: ["Ctrl", "Y"], action: "Redo" },
		{ keys: ["Ctrl", "Shift", "X"], action: "Clear all formatting" },
	];
	const modalKeybinds = [
		{ keys: ["Ctrl", "Shift", "G"], action: "Add Color Gradient" },
		{ keys: ["Ctrl", "Shift", "K"], action: "View Keybinds" },
		{ keys: ["Ctrl", "Shift", "T"], action: "Add Click Event" },
		{ keys: ["Ctrl", "Shift", "H"], action: "Add Hover Event" },
		{ keys: ["Ctrl", "Shift", "C"], action: "Add Custom Color" },
		{ keys: ["Ctrl", "Shift", "F"], action: "Add a font" },
		{ keys: ["Ctrl", "Shift", "W"], action: "Add Custom Source" },
		{ keys: ["Ctrl", "Shift", "U"], action: "Unicode Menu" },
		{ keys: ["Ctrl", "Shift", "I"], action: "Import Menu" },
		{ keys: ["Ctrl", "Shift", "E"], action: "Export Menu" },
		{ keys: ["Ctrl", "Shift", "L"], action: "Load a snapshot" },
	];
</script>

<Modal title="Keybinds" bind:this={keybindDialog} flexible key="K">
	<p class="col-span-3 text-xl font-bold">Formatting Keybinds</p>
	<div class="mt-4 grid grid-flow-col-dense grid-cols-2 grid-rows-6 space-x-3">
		{#each keysAndActions as { keys, action }}
			<div class="mb-2 flex items-center gap-2">
				{#each keys as key}
					<Key>{key}</Key>
				{/each}
				-
				<span>{action}</span>
			</div>
		{/each}
	</div>
	<p class="col-span-3 text-xl font-bold">Modal Keybinds</p>
	<div class="mt-4 grid grid-flow-col-dense grid-cols-2 grid-rows-6 space-x-3">
		{#each modalKeybinds as { keys, action }}
			<div class="mb-2 flex items-center gap-2">
				{#each keys as key}
					<Key>{key}</Key>
				{/each}
				-
				<span>{action}</span>
			</div>
		{/each}
	</div>
</Modal>
