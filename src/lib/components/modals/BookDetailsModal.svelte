<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";

    interface Props {
        bookDetailsDialog?: Modal;
        title: string;
        author: string;
    }

    let {
        bookDetailsDialog = $bindable(),
        title = $bindable("Title"),
        author = $bindable("Author"),
    }: Props = $props();
</script>

<Modal title="Book Details" bind:this={bookDetailsDialog} key="D">
    <div class="flex w-full flex-col space-y-2">
        <label for="title" class="flex flex-col">
            <span>Book title</span>
            <span class="text-xs text-zinc-500">The title of the book.</span>
        </label>
        <input
            name="title"
            type="text"
            placeholder="Book title"
            class="input-basic"
            bind:value={title} />
        <label for="author" class="flex flex-col">
            <span>Book author</span>
            <span class="text-xs text-zinc-500">The author of the book.</span>
        </label>
        <input
            name="author"
            type="text"
            placeholder="Book author"
            class="input-basic"
            bind:value={author} />
    </div>
</Modal>
