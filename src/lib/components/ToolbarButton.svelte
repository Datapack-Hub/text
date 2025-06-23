<script lang="ts">
	import { tooltip } from "$lib/tooltip";
	import type { Component } from "svelte";
	import tippy from "tippy.js";

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
	{@attach tooltip}
	style="color: {color || 'inherit'}"
	class="toolbar-btn {styleVar ? 'bg-zinc-800' : ''}">
	<Icon />
</button>
