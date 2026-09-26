<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { tooltip_right } from "$lib/tooltip";
    import IconInfo from "~icons/tabler/info-circle";
    import CheckBox from "../CheckBox.svelte";

    interface Props {
        bookDetailsDialog?: Modal;
        title: string;
        author: string;
        generation?: number;
        hideDetails?: boolean;
    }

    let {
        bookDetailsDialog = $bindable(),
        title = $bindable("Custom Book"),
        author = $bindable("Your Name Here"),
        generation = $bindable(0),
        hideDetails = $bindable(false),
    }: Props = $props();
</script>

<Modal title="Book Details" bind:this={bookDetailsDialog} key="D">
    <div class="flex w-full flex-col">
        <label for="title">Title</label>
        <input
            name="title"
            type="text"
            placeholder="Book title"
            class="input-basic mb-2"
            bind:value={title} />

        <label for="author">Author</label>
        <input
            name="author"
            type="text"
            placeholder="Book author"
            class="input-basic"
            bind:value={author} />

        <div class="mt-2 flex items-center space-x-1">
            <span>Book Generation</span>
            <IconInfo
                class="text-sm text-zinc-300"
                {@attach tooltip_right}
                aria-label="The 'copy' type of the book, e.g. Original, Copy of Original, etc." />
        </div>
        <select name="generation" class="input-basic" bind:value={generation}>
            <option value={0}>Original</option>
            <option value={1}>Copy of Original</option>
            <option value={2}>Copy of Copy</option>
            <option value={3}>Tattered</option>
        </select>

        <div class="mt-2 flex items-center space-x-2">
            <CheckBox label="realisticLineHeight" bind:value={hideDetails} />
            <label for="realisticLineHeight" class="flex flex-col">
                <span>Hide book details</span>
                <span class="text-xs text-zinc-500"
                    >If enabled, the author and title will not be visible in the tooltip of the book
                    item.</span>
            </label>
        </div>
    </div>
</Modal>
