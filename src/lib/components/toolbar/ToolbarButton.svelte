<script lang="ts">
    import { tooltip } from "#lib/tooltip.js";
    import type { Component } from "svelte";

    type Props = {
        onClick: () => void;
        styleVar?: boolean;
        ariaLabel: string;
        Icon: Component;
        colour?: string;
        desktopOnly?: boolean;
        testid?: string;
    };

    const { onClick, styleVar, Icon, ariaLabel, colour, desktopOnly, testid }: Props = $props();
</script>

<button
    aria-label={ariaLabel}
    onclick={onClick}
    {@attach tooltip}
    data-testid={testid}
    style="color: {colour || 'inherit'}"
    class="toolbar-btn{styleVar ? ' bg-zinc-800' : ''} {desktopOnly ? 'nomob' : ''}">
    <Icon />
</button>
