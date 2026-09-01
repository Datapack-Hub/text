<script lang="ts">
    import { page } from "$app/state";
    import CheckBox from "$lib/components/CheckBox.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import { convertToTextOrEmpty, importBook, snbtToDocument } from "$lib/text/nbt/import";
    import type { Editor, JSONContent } from "@tiptap/core";

    interface Props {
        importDialog?: Modal;
        editor?: Editor;
        pages?: JSONContent[];
        pageIndex?: number;
    }

    type ImportMode = "append" | "replace" | "overwrite";

    let {
        importDialog = $bindable(),
        editor,
        pages = $bindable(),
        pageIndex = $bindable(),
    }: Props = $props();

    let importText: string = $state("");
    let importAppend: boolean = $state(false);
    let bookImportMode: ImportMode = $state("append");

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

    function importBookToEditor() {
        const convertedContent = convertToTextOrEmpty(importText!);

        if (bookImportMode === "overwrite") {
            const jsonContent = importBook(convertedContent);
            pages = jsonContent;
            pageIndex = 0;
        } else if (bookImportMode === "append") {
            const jsonContent = snbtToDocument(convertedContent);
            pages?.splice(pageIndex! + 1, 0, jsonContent);
            pageIndex = pageIndex! + 1;
        } else if (bookImportMode === "replace") {
            const jsonContent = snbtToDocument(convertedContent);
            editor?.commands.setContent(jsonContent, { emitUpdate: true });
        }
        importDialog?.close();
    }
</script>

<Modal title="Import from NBT" bind:this={importDialog} key="I">
    {#if page.url.pathname === "/book"}
        <div class="flex w-full flex-col space-y-2">
            <p>
                Paste text components here to import them into the book editor. This action is
                undoable.
            </p>
            <textarea
                class="flex h-32 items-start rounded-lg bg-zinc-950 p-3 font-mono text-sm"
                placeholder="Paste NBT text components here"
                bind:value={importText}></textarea>

            <div class="flex items-center space-x-2">
                <label for="appendToEditor" class="flex flex-col">
                    <span>Import behaviour</span>
                    <span class="text-xs text-zinc-500"
                        >Determines how to handle the imported text components. Append will add the
                        text as a new page, replace will replace the current page, and overwrite
                        will replace all content (book import).</span>
                </label>

                <select
                    name="importMode"
                    bind:value={bookImportMode}
                    class="rounded-lg border-r-8 border-zinc-900 bg-zinc-900 p-2 text-sm">
                    <option value="append">Append as page</option>
                    <option value="replace">Replace current page</option>
                    <option value="overwrite">Replace all content</option>
                </select>
            </div>

            <button onclick={importBookToEditor} class="btn">Import</button>
        </div>
    {:else}
        <div class="flex w-full flex-col space-y-2">
            <p>
                Paste text components here to import them into the editor. This action is undoable.
            </p>
            <textarea
                class="flex h-32 items-start rounded-lg bg-zinc-950 p-3 font-mono text-sm"
                placeholder="Paste NBT text components here"
                bind:value={importText}></textarea>

            <div class="flex items-center space-x-2">
                <CheckBox label="appendToEditor" bind:value={importAppend} />
                <label for="appendToEditor" class="flex flex-col">
                    <span>Append to current editor content</span>
                    <span class="text-xs text-zinc-500"
                        >If enabled, the imported text components will appear at the end of the
                        current editor content.</span>
                </label>
            </div>
            <button onclick={importToEditor} class="btn">Import</button>
        </div>
    {/if}
</Modal>
