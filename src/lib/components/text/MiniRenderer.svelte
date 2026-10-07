<script lang="ts">
    import { generateHTML, type JSONContent } from "@tiptap/core";
    import { onMount } from "svelte";

    import { browser } from "$app/environment";
    import { appSettings } from "$lib/settings";
    import { defaultExtensions } from "$lib/text/utils";

    let { value }: { value: JSONContent } = $props();

    let html: string = $state(")");

    onMount(() => {
        html = browser
            ? generateHTML(value, [
                  ...defaultExtensions
              ])
            : ""
        
        appSettings.subscribe(() => {
            const el = document.querySelectorAll(".tiptap") as NodeListOf<HTMLElement>;

            if ($appSettings.realisticLineHeight == true) {
                const lineHeight = 0.8 + 0.2 * $appSettings.fontSize;
                el.forEach((e) => {
                    e.style.lineHeight = lineHeight.toString() + "rem";
                });
            } else {
                const lineHeight = 1.25 + 0.25 * $appSettings.fontSize;
                el.forEach((e) => {
                    e.style.lineHeight = lineHeight.toString() + "rem";
                });
            }

            const fontSize = 1 + 0.25 * $appSettings.fontSize;
            el.forEach((e) => {
                e.style.fontSize = fontSize.toString() + "rem";
            });
        });
    });
</script>

{#if html}
<div class="tiptap tiptap-minirenderer">{@html html}</div>
{/if}