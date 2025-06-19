<script lang="ts">
	import type { Component } from "svelte";
	import tippy from "svelte-tippy";

	type Props = {
		onClick: () => void;
		styleVar?: boolean;
		tipContent: string;
		Icon: Component;
		ariaLabel: string;
		color?: string;
	};

	const { onClick, styleVar, tipContent, Icon, ariaLabel, color }: Props =
		$props();
</script>

<button
	aria-label={ariaLabel}
	onclick={onClick}
	style="color: {color || 'inherit'}"
	class="toolbar-btn {styleVar ? 'bg-zinc-800' : ''}"
	use:tippy={{ content: tipContent, placement: "bottom" }}>
	<Icon />
</button>
