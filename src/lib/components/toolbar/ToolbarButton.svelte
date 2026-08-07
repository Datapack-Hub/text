<script lang="ts">
    import { tooltip } from "$lib/tooltip";
    import type { Component } from "svelte";

    type Props = {
        onClick: () => void;
        styleVar?: boolean;
        ariaLabel: string;
        Icon: Component;
        colour?: string;
    };

    const { onClick, styleVar, Icon, ariaLabel, colour }: Props = $props();
</script>

<button
    aria-label={ariaLabel}
    onclick={onClick}
    {@attach tooltip}
    style="color: {colour || 'inherit'}"
    class="toolbar-btn{styleVar ? ' bg-zinc-800' : ''}">
    <Icon />
</button>
