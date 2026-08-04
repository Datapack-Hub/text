<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";

    interface Props {
        importDialog?: Modal;
        importText?: string;
        importToEditor: () => void;
    }

    let { importDialog = $bindable(), importText = $bindable(), importToEditor }: Props = $props();
</script>

<Modal title="Import from NBT" bind:this={importDialog} key="I">
    <div class="flex w-full flex-col space-y-2">
        <p>
            Paste your text components below to import them into the editor. This will clear the
            current contents of the editor!
        </p>
        <textarea
            class="font-minecraft flex h-32 items-start rounded-lg bg-zinc-950 p-3"
            placeholder="Paste NBT text components here"
            bind:value={importText}></textarea>

        <button onclick={importToEditor} class="btn">
            Import
        </button>
    </div>
</Modal>
