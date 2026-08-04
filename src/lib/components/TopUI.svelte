<script lang="ts">
    import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt/import";
    import type { Editor } from "@tiptap/core";
    import { onMount } from "svelte";
    import Modal from "./Modal.svelte";

    const { editor, outputDialog }: { editor: Editor | undefined; outputDialog: Modal } = $props();

    let recentlySaved = $state(false);

    let snapshots = $state<object[]>([]);
    let doesContentExist: boolean = $derived(editor ? !editor.isEmpty : false);
    let importText: string = $state("");

    let loadDialog: Modal = $state()!;
    let importDialog: Modal = $state()!;

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

    function saveSnapshot() {
        const snapshotsTemp = localStorage.getItem("snapshots");
        if (snapshotsTemp) {
            snapshots = JSON.parse(snapshotsTemp);
            snapshots.push(editor!.getJSON());
            localStorage.setItem("snapshots", JSON.stringify(snapshots));
        } else {
            localStorage.setItem("snapshots", JSON.stringify([editor!.getJSON()]));
            snapshots = [editor!.getJSON()];
        }
        recentlySaved = true;
        setTimeout(() => {
            recentlySaved = false;
        }, 4000);
    }
</script>

<div class="flex w-full items-center bg-zinc-950 text-zinc-300" style="font-family: Lexend">
    <div class="flex items-center px-3 py-2 hover:bg-white/3">
        <img src="/dph.svg" class="size-5" alt="logo" height="20" width="20" />
        <span class="nomob ml-3">Minecraft Text Editor</span>
    </div>
    <button class="flex items-center px-3 py-2 hover:bg-white/3" onclick={importDialog?.open}
        >Import</button>
    {#if doesContentExist}
        <button class="flex items-center px-3 py-2 hover:bg-white/3" onclick={outputDialog?.open}
            >Export</button>
        <button class="flex items-center px-3 py-2 hover:bg-white/3" onclick={saveSnapshot}
            >Save{recentlySaved ? "d!" : ""}</button>
    {/if}
    <button class="flex items-center px-3 py-2 hover:bg-white/3" onclick={loadDialog?.open}
        >Load</button>
    <div class="grow"></div>
    <a
        href="https://discord.datapackhub.net/"
        class="nomob flex items-center px-3 py-2 hover:bg-white/3">Discord</a>
    <a href="https://datapack.wiki/" class="nomob flex items-center px-3 py-2 hover:bg-white/3"
        >Datapack Wiki</a>
</div>

{#await import("$lib/components/modals/topbar/LoadModal.svelte") then modal}
    <modal.default bind:loadDialog {editor} {snapshots} />
{/await}

{#await import("$lib/components/modals/topbar/ImportModal.svelte") then modal}
    <modal.default bind:importDialog {importText} {importToEditor} />
{/await}
