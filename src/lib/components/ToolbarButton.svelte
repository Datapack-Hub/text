<script lang="ts">
	import type { Component } from "svelte";

	type Props = {
		onClick: () => void;
		styleVar?: boolean;
		ariaLabel: string;
		Icon: Component;
		color?: string;
	};

	const { onClick, styleVar, Icon, ariaLabel, color }: Props = $props();
</script>

<button
	aria-label={ariaLabel}
	onclick={onClick}
	style="color: {color || 'inherit'}"
	class="toolbar-btn hint--bottom hint--rounded hint--no-shadow {styleVar
		? 'bg-zinc-800'
		: ''}">
	<Icon />
</button>
