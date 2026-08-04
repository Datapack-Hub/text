<script>
    const { children } = $props();
</script>

<kbd
    class="w-fit rounded-sm border border-b-4 border-zinc-950 bg-zinc-900 px-2 py-0.5 font-bold text-white/60"
    >{@render children()}</kbd>
