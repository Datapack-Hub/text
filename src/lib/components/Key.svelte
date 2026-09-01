<script>
    const { children } = $props();
</script>

<kbd
    class="w-fit rounded-sm border not-hover:border-b-4 border-zinc-950 bg-zinc-900 px-2 font-bold text-white/60"
    >{@render children()}</kbd>
