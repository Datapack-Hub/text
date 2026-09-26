<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import MiniRenderer from "$lib/components/text/MiniRenderer.svelte";
    import { tooltip } from "$lib/tooltip";
    import type { Editor } from "@tiptap/core";

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
        <div class="flex max-h-[50vh] flex-col overflow-y-auto">
            {#each snapshots as snapshot (snapshot)}
                <div class="flex flex-col border-b-2 border-zinc-600 py-2">
                    <div class="rounded-md bg-zinc-900">
                        <MiniRenderer value={snapshot} />
                    </div>
                    <div class="mt-1 flex w-fit gap-1">
                        <button
                            {@attach tooltip}
                            aria-label="Load snapshot"
                            class="btn"
                            onclick={() => {
                                editor?.commands.setContent(snapshot);
                                editor?.commands.focus();
                            }}>Load</button>
                        <button
                            {@attach tooltip}
                            aria-label="Delete snapshot"
                            class="btn"
                            onclick={() => {
                                snapshots = snapshots.filter(
                                    (_, index) => index !== snapshots.indexOf(snapshot),
                                );
                                localStorage.setItem("snapshots", JSON.stringify(snapshots));
                            }}>Delete</button>
                    </div>
                </div>
            {/each}
        </div>
        <button class="btn mt-6" onclick={saveSnapshot}>Save current text</button>
    </div>
</Modal>
