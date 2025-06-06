<script>
	const { children } = $props();
</script>

<kbd
	class="bg-zinc-900 w-fit px-2 py-0.5 rounded-sm border-b-4 border-zinc-950 font-bold text-white/60"
	>{@render children()}</kbd>
