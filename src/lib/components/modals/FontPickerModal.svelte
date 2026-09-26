<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import IconFont from "~icons/tabler/function";
    import IconUploadFont from "~icons/tabler/function-filled";
    import IconCustom from "~icons/tabler/file-plus";
    import IconClose from "~icons/tabler/x";
    import type { Editor } from "@tiptap/core";
    import { fontLUT } from "$lib/tiptap/extensions/fonts";
    import { openDataStore } from "$lib/db";

    let {
        editor,
        fontDialog = $bindable(),
        fontUploadModal,
        fontName = $bindable(),
    } = $props<{
        editor: Editor;
        fontDialog?: Modal;
        fontUploadModal: Modal;
        fontName: string;
    }>();

    async function deleteFont(identifier: string) {
        const db = await openDataStore();

        await db.delete("fonts", identifier);
        fontLUT.delete(identifier);
    }
</script>

<Modal title="Set font" bind:this={fontDialog} key="F">
    <div class="flex w-full flex-col space-y-2">
        <p>Select one of the default Minecraft fonts below:</p>
        <div class="flex flex-col space-y-1">
            <button
                data-testid="font-button-default"
                onclick={() => {
                    editor?.chain().focus().unsetFont().run();
                    fontDialog?.close();
                }}
                class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                <IconFont />
                <span>Default</span>
            </button>
            <button
                data-testid="font-button-illageralt"
                onclick={() => {
                    editor?.chain().focus().setFont("minecraft:illageralt").run();
                    fontDialog?.close();
                }}
                class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                <IconFont />
                <span>Illager Alt</span>
                <span class="font-mono text-white/60">(minecraft:illageralt)</span>
            </button>
            <button
                data-testid="font-button-alt"
                onclick={() => {
                    editor?.chain().focus().setFont("minecraft:alt").run();
                    fontDialog?.close();
                }}
                class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                <IconFont />
                <span>Standard Galactic Alphabet (enchant table)</span>
                <span class="font-mono text-white/60">(minecraft:alt)</span>
            </button>
        </div>

        <p class="my-2">To use a custom font in the editor, upload or select one below.</p>
        <div class="flex flex-col space-y-1">
            {#each fontLUT as [identifier, _]}
                <div
                    class="flex h-full w-full items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <button
                        onclick={() => {
                            editor?.chain().focus().setFont(identifier).run();
                            fontDialog?.close();
                        }}
                        class="flex flex-1 items-center space-x-2">
                        <IconUploadFont />
                        <span class="font-mono text-white">{identifier}</span>
                    </button>
                    <button class="font-mono text-white" onclick={() => deleteFont(identifier)}
                        ><IconClose /></button>
                </div>
            {/each}
            <button
                onclick={() => {
                    fontDialog!.close();
                    fontUploadModal!.open();
                }}
                class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                <IconCustom />
                <span>Upload a custom font...</span>
                <span class="font-mono text-white/60">(.ttf, .otf, .woff2)</span>
            </button>
        </div>

        <p class="my-2">Or, if you want to use a custom font without importing it, enter the ID:</p>
        <input type="text" class="input-basic" placeholder="namespace:id" bind:value={fontName} />

        <p class="text-sm text-white/60">
            <b>Note:</b> in order for a custom font to show up ingame, you will need to add it with a
            resource pack. Also, if you don't import a font into the editor, it will show up here as your
            browser's default font.
        </p>

        <button
            onclick={() => {
                editor?.chain().focus().setFont(fontName).run();
                fontDialog?.close();
            }}
            class="btn">
            Set Font
        </button>
    </div>
</Modal>
