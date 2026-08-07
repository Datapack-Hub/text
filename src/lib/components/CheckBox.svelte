<script lang="ts">
    import IconTick from "~icons/tabler/check";

    let { value = $bindable(), label }: { value: boolean; label: string } = $props();
</script>

<div class="flex items-center gap-2">
    <button
        name={label}
        class="flex aspect-square size-8 flex-col items-center rounded-md bg-zinc-900"
        onclick={() => (value = !value)}>
        {#if value}
            <IconTick class="m-auto text-lg" />
        {/if}
    </button>
</div>
