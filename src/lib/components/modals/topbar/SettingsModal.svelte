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
                <span class="text-xs text-zinc-500">If enabled, the output character count will be visible at the bottom of the screen.</span>
            </label>
        </div>
        <div class="flex items-center space-x-2">
            <CheckBox label="syntaxHighlight" bind:value={$appSettings.syntaxHighlight} />
            <label for="syntaxHighlight" class="flex flex-col">
                <span>Syntax highlighted output</span>
                <span class="text-xs text-zinc-500">If enabled, the component output will be syntax highlighted at the bottom of the screen.</span>
            </label>
        </div>
        <div class="flex items-center space-x-2">
            <CheckBox label="realisticLineHeight" bind:value={$appSettings.realisticLineHeight} />
            <label for="realisticLineHeight" class="flex flex-col">
                <span>Use realistic line height</span>
                <span class="text-xs text-zinc-500">If enabled, the space between lines in the editor will be more similar to that of the Minecraft chat.</span>
            </label>
        </div>
    </div>
</Modal>
