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
    <div class="flex w-full flex-col">
        <label for="title">Book title</label>
        <input
            name="title"
            type="text"
            placeholder="Book title"
            class="input-basic mb-2"
            bind:value={title} />

        <label for="author">Book author</label>
        <input
            name="author"
            type="text"
            placeholder="Book author"
            class="input-basic"
            bind:value={author} />
    </div>
</Modal>
