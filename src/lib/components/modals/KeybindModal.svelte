<script>
    import Modal from "$lib/components/Modal.svelte";
    import Key from "../Key.svelte";

    let { keybindDialog = $bindable() } = $props();

    let modifierKey =
        navigator.platform.startsWith("Mac") || navigator.platform.includes("iPhone")
            ? "⌘"
            : "Ctrl";

    const keysAndActions = [
        { keys: [modifierKey, "B"], action: "Bold" },
        { keys: [modifierKey, "I"], action: "Italic" },
        { keys: [modifierKey, "U"], action: "Underline" },
        { keys: [modifierKey, "Shift", "S"], action: "Strikethrough" },
        { keys: [modifierKey, "O"], action: "Obfuscate" },
        { keys: [modifierKey, "Z"], action: "Undo" },
        { keys: [modifierKey, "Y"], action: "Redo" },
        { keys: [modifierKey, "Shift", "X"], action: "Clear all formatting" },
    ];
    const modalKeybinds = [
        { keys: [modifierKey, "Shift", "G"], action: "Add Color Gradient" },
        { keys: [modifierKey, "Shift", "K"], action: "View Keybinds" },
        { keys: [modifierKey, "Shift", "T"], action: "Add Click Event" },
        { keys: [modifierKey, "Shift", "H"], action: "Add Hover Event" },
        { keys: [modifierKey, "Shift", "C"], action: "Add Custom Color" },
        { keys: [modifierKey, "Shift", "F"], action: "Add a font" },
        { keys: [modifierKey, "Shift", "W"], action: "Add Custom Source" },
        { keys: [modifierKey, "Shift", "U"], action: "Unicode Menu" },
        { keys: [modifierKey, "Shift", "I"], action: "Import Menu" },
        { keys: [modifierKey, "Shift", "E"], action: "Export Menu" },
        { keys: [modifierKey, "Shift", "L"], action: "Load a snapshot" },
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
