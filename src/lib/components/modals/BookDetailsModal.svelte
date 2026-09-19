<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";

    interface Props {
        bookDetailsDialog?: Modal;
        title: string;
        author: string;
        generation?: number;
    }

    let {
        bookDetailsDialog = $bindable(),
        title = $bindable("Title"),
        author = $bindable("Author"),
        generation = $bindable(0),
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

        <label for="generation" class="mt-2">Book generation</label>
        <select name="generation" class="input-basic" bind:value={generation}>
            <option value="0">Original</option>
            <option value="1">Copy of Original</option>
            <option value="2">Copy of Copy</option>
            <option value="3">Tattered</option>
        </select>
    </div>
</Modal>
