<script>
    const { children } = $props();
</script>

<kbd
    class="w-fit rounded-sm border border-zinc-950 bg-zinc-900 px-2 font-bold text-white/60 not-hover:border-b-4"
    >{@render children()}</kbd>
