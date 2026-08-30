<script lang="ts">
    import CheckBox from "$lib/components/CheckBox.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt/import";
    import type { Editor } from "@tiptap/core";

    interface Props {
        importDialog?: Modal;
        editor?: Editor
    }

    let { importDialog = $bindable(), editor }: Props = $props();

    let importText: string = $state("")
    let importAppend: boolean = $state(false)

    function importToEditor() {
        const jsonContent = snbtToDocument(convertToTextOrEmpty(importText!));
        if (importAppend) {
            const endPosition = editor?.state.doc.content.size;
            editor?.commands.insertContentAt(endPosition!, jsonContent);
        } else {
            editor?.commands.setContent(jsonContent, { emitUpdate: true });
        }
        importDialog?.close();
    }
</script>

<Modal title="Import from NBT" bind:this={importDialog} key="I">
    <div class="flex w-full flex-col space-y-2">
        <p>Paste text components here to import them into the editor. This action is undoable.</p>
        <textarea
            class="font-mono text-sm flex h-32 items-start rounded-lg bg-zinc-950 p-3"
            placeholder="Paste NBT text components here"
            bind:value={importText}></textarea>

        <div class="flex items-center space-x-2">
            <CheckBox label="appendToEditor" bind:value={importAppend} />
            <label for="appendToEditor" class="flex flex-col">
                <span>Append to current editor content</span>
                <span class="text-xs text-zinc-500"
                    >If enabled, the imported text components will appear at the end of the current editor content.</span>
            </label>
        </div>

        <button onclick={importToEditor} class="btn">Import</button>
    </div>
</Modal>
