<script lang="ts">
	import "../app.css";
	import "../fonts.css";
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="font-lexend bg-zinc-900 text-white min-h-screen h-full">
	{@render children()}
</div>
