<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import MiniRenderer from "$lib/components/text/MiniRenderer.svelte";
    import { tooltip } from "$lib/tooltip";
    import type { Editor } from "@tiptap/core";
    import IconDelete from "~icons/tabler/trash";
    import IconLoad from "~icons/tabler/upload";

    interface Props {
        editor: Editor | undefined;
        snapshots: object[];
        loadDialog?: Modal;
    }

    let { editor, snapshots, loadDialog = $bindable() }: Props = $props();

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
    }
</script>

<Modal title="Saved texts" bind:this={loadDialog} key="L">
    <div class="">
        {#if snapshots.length == 0}
            <p>You have not saved anything yet!</p>
        {/if}
        <div class="flex max-h-96 flex-col gap-4 overflow-y-auto rounded-md p-3">
            {#each snapshots as snapshot (snapshot)}
                <div class="flex flex-col">
                    <div class="rounded-t-md rounded-br-md bg-zinc-900">
                        <MiniRenderer value={snapshot} />
                    </div>
                    <div class="flex w-fit rounded-b-md bg-zinc-950">
                        <button
                            {@attach tooltip}
                            aria-label="Load snapshot"
                            class="border-r border-zinc-800 px-3 py-2 hover:bg-white/3"
                            onclick={() => {
                                editor?.commands.setContent(snapshot);
                                editor?.commands.focus();
                            }}><IconLoad /></button>
                        <button
                            {@attach tooltip}
                            aria-label="Delete snapshot"
                            class="px-3 py-2 hover:bg-white/3"
                            onclick={() => {
                                snapshots = snapshots.filter(
                                    (_, index) => index !== snapshots.indexOf(snapshot),
                                );
                                localStorage.setItem("snapshots", JSON.stringify(snapshots));
                            }}><IconDelete /></button>
                    </div>
                </div>
            {/each}
        </div>
        <button class="btn mt-6" onclick={saveSnapshot}>Save current text</button>
    </div>
</Modal>
