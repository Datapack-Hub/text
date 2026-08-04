<script lang="ts">
    import { Combobox, type WithoutChildrenOrChild, mergeProps } from "bits-ui";
    import IconCaret from "~icons/tabler/caret-up-down";
    import IconCheck from "~icons/tabler/check";

    type Props = Combobox.RootProps & {
        inputProps?: WithoutChildrenOrChild<Combobox.InputProps>;
        contentProps?: WithoutChildrenOrChild<Combobox.ContentProps>;
    };

    let {
        items = [],
        value = $bindable(),
        open = $bindable(false),
        inputProps,
        contentProps,
        type,
        ...restProps
    }: Props = $props();

    let searchValue = $state("");

    const filteredItems = $derived.by(() => {
        if (searchValue === "") return items;
        return items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));
    });

    function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
        searchValue = e.currentTarget.value;
        value = searchValue;
    }

    function handleOpenChange(newOpen: boolean) {
        if (!newOpen) searchValue = "";
    }

    const mergedRootProps = $derived(mergeProps(restProps, { onOpenChange: handleOpenChange }));
    const mergedInputProps = $derived(mergeProps(inputProps, { oninput: handleInput }));
</script>

<!--
Destructuring (required for bindable) and discriminated unions don't play well together,
so we cast the value to `never` to avoid type errors here. However, on the consumer
side, the component will still be type-checked correctly.
-->
<Combobox.Root {type} {items} bind:value={value as never} bind:open {...mergedRootProps}>
    <div class="relative flex rounded-md bg-zinc-900 p-2">
        <Combobox.Input {...mergedInputProps} class="w-full outline-0" />
        <Combobox.Trigger><IconCaret /></Combobox.Trigger>
    </div>
    <Combobox.Portal>
        <Combobox.Content
            {...contentProps}
            class="font-lexend mt-2 w-lg rounded bg-zinc-950 p-2 shadow-xl">
            {#each filteredItems as item, i (i + item.value)}
                <Combobox.Item
                    {...item}
                    class="my-0.5 flex cursor-pointer items-center justify-between rounded-md px-4 py-1 text-white transition-colors hover:bg-zinc-900/60 active:bg-zinc-800/60">
                    {#snippet children({ selected })}
                        <span>
                            {item.label}
                        </span>
                        {#if selected}
                            <IconCheck />
                        {/if}
                    {/snippet}
                </Combobox.Item>
            {:else}
                <span class="text-zinc-500">No results found</span>
            {/each}
        </Combobox.Content>
    </Combobox.Portal>
</Combobox.Root>
