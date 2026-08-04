<script lang="ts">
    import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt/import";
    import type { Editor } from "@tiptap/core";
    import { onMount } from "svelte";
    import Modal from "./Modal.svelte";

    import IconSaved from "~icons/tabler/folder";
    import IconUpload from "~icons/tabler/upload";
    import IconSettings from "~icons/tabler/settings";

    const { editor, outputDialog }: { editor: Editor | undefined; outputDialog: Modal } = $props();

    let snapshots = $state<object[]>([]);
    let importText: string = $state("");

    let loadDialog: Modal = $state()!;
    let importDialog: Modal = $state()!;
    let settingsDialog: Modal = $state()!;

    onMount(() => {
        if (localStorage.getItem("snapshots")) {
            snapshots = JSON.parse(localStorage.getItem("snapshots")!);
        } else {
            snapshots = [];
            localStorage.setItem("snapshots", "[]");
        }
    });

    function importToEditor() {
        const jsonContent = snbtToDocument(convertToTextOrEmpty(importText));
        editor?.commands.setContent(jsonContent, { emitUpdate: true });
        importDialog?.close();
    }
</script>

<div class="flex w-full items-center bg-zinc-950 text-zinc-300 text-sm" style="font-family: Lexend">
    <div class="flex items-center px-3 py-2 hover:bg-white/3">
        <img src="/dph.svg" class="size-5" alt="logo" height="20" width="20" />
        <span class="nomob ml-2 font-semibold">Minecraft Text Editor</span>
    </div>
    <button class="flex items-center space-x-[0.45rem] px-[0.6rem] py-2 hover:bg-white/3" onclick={importDialog?.open}>
        <IconUpload class="text-xs" />
        <span>Import</span>
    </button>
    <!-- {#if doesContentExist}
        <button class="flex items-center space-x-[0.45rem] px-[0.6rem] py-2 hover:bg-white/3" onclick={outputDialog?.open}
            >Export</button>
    {/if} -->
    <button class="flex items-center space-x-[0.45rem] px-[0.6rem] py-2 hover:bg-white/3" onclick={loadDialog?.open}>
        <IconSaved class="text-xs" />
        <span>Saved</span>
    </button>
    <button class="flex items-center space-x-[0.45rem] px-[0.6rem] py-2 hover:bg-white/3" onclick={settingsDialog?.open}>
        <IconSettings class="text-xs" />
        <span>Settings</span>
    </button>
    <div class="grow"></div>
    <a
        href="https://discord.datapackhub.net/"
        class="nomob flex items-center space-x-[0.45rem] px-[0.6rem] py-2 hover:bg-white/3">Discord</a>
    <a href="https://datapack.wiki/" class="nomob flex items-center space-x-[0.45rem] px-[0.6rem] py-2 hover:bg-white/3"
        >Datapack Wiki</a>
</div>

{#await import("$lib/components/modals/topbar/SavedTextsModal.svelte") then modal}
    <modal.default bind:loadDialog {editor} {snapshots} />
{/await}

{#await import("$lib/components/modals/topbar/ImportModal.svelte") then modal}
    <modal.default bind:importDialog {importText} {importToEditor} />
{/await}

{#await import("$lib/components/modals/topbar/SettingsModal.svelte") then modal}
    <modal.default bind:settingsDialog />
{/await}
