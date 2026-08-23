<script lang="ts">
    import CheckBox from "$lib/components/CheckBox.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import { appSettings } from "$lib/settings";

    interface Props {
        settingsDialog?: Modal;
    }

    let { settingsDialog = $bindable() }: Props = $props();
</script>

<Modal title="Settings" bind:this={settingsDialog} key="L">
    <div class="flex w-full flex-col space-y-2">
        <div class="flex items-center space-x-2">
            <CheckBox label="showCharacterCount" bind:value={$appSettings.showCharacterCount} />
            <label for="showCharacterCount" class="flex flex-col">
                <span>Show character count</span>
                <span class="text-xs text-zinc-500"
                    >If enabled, the output character count will be visible at the bottom of the
                    screen.</span>
            </label>
        </div>

        <div class="flex items-center space-x-2">
            <CheckBox label="syntaxHighlight" bind:value={$appSettings.syntaxHighlight} />
            <label for="syntaxHighlight" class="flex flex-col">
                <span>Syntax highlighted output</span>
                <span class="text-xs text-zinc-500"
                    >If enabled, the component output will be syntax highlighted at the bottom of
                    the screen.</span>
            </label>
        </div>

        <div class="flex items-center space-x-2">
            <CheckBox label="realisticLineHeight" bind:value={$appSettings.realisticLineHeight} />
            <label for="realisticLineHeight" class="flex flex-col">
                <span>Use realistic line height</span>
                <span class="text-xs text-zinc-500"
                    >If enabled, the space between lines in the editor will be more similar to that
                    of the Minecraft chat.</span>
            </label>
        </div>

        <div class="flex items-center space-x-2">
            <CheckBox label="realisticLineHeight" bind:value={$appSettings.hideSelectionExport} />
            <label for="hideSelectionExport" class="flex flex-col">
                <span>Hide "Export this" button</span>
                <span class="text-xs text-zinc-500"
                    >If enabled, the selection export feature ("export this" button) will be
                    disabled</span>
            </label>
        </div>

        <div class="flex items-center space-x-2">
            <select
                name="fontSize"
                bind:value={$appSettings.fontSize}
                class="rounded-md bg-zinc-900 p-2">
                <option value={0}>Small</option>
                <option value={1}>Default</option>
                <option value={2}>Large</option>
            </select>
            <label for="fontSize" class="flex flex-col">
                <span>Editor font size</span>
                <span class="text-xs text-zinc-500"
                    >This alters the font size in the editor, but not the output.</span>
            </label>
        </div>
        <div class="flex items-center space-x-2">
            <select
                name="editorMode"
                bind:value={$appSettings.mode}
                class="rounded-md bg-zinc-900 p-2">
                <option value="normal">Normal</option>
                <option value="book">Book</option>
            </select>
            <label for="editorMode" class="flex flex-col">
                <span>Editor mode (BETA)</span>
                <span class="text-xs text-zinc-500"
                    >This alters the limits of the editor to support features such as book editing.</span>
            </label>
        </div>
    </div>
</Modal>
