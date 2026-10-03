<!-- <script lang="ts">
    import { browser } from "$app/environment";
    import { appSettings } from "$lib/settings";
    import { defaultExtensions } from "$lib/text/defaultExtensions";
    import { generateHTML, type JSONContent } from "@tiptap/core";
    import { onMount } from "svelte";

    let { value }: { value: JSONContent } = $props();

    let html: string = $derived.by(() => {
        if (!browser) return "";

        const doc: JSONContent = {
            ...value,
            content: value.content?.map((paragraph) =>
                paragraph.content === undefined
                    ? { ...paragraph, content: [{ type: "text", text: " " }] }
                    : paragraph,
            ),
        }

        const a =  generateHTML(doc, defaultExtensions);
        console.log(a);
        return a;
    });

    let lineHeight = $derived(
        $appSettings.realisticLineHeight
            ? 0.8 + 0.2 * $appSettings.fontSize
            : 1.25 + 0.25 * $appSettings.fontSize,
    );

    // onMount(() => {
    //     appSettings.subscribe(() => {
    //         const el = document.querySelectorAll(".tiptap") as NodeListOf<HTMLElement>;

    //         if ($appSettings.realisticLineHeight == true) {
    //             const lineHeight = 0.8 + 0.2 * $appSettings.fontSize;
    //             el.forEach((e) => {
    //                 e.style.lineHeight = lineHeight.toString() + "rem";
    //             });
    //         } else {
    //             const lineHeight = 1.25 + 0.25 * $appSettings.fontSize;
    //             el.forEach((e) => {
    //                 e.style.lineHeight = lineHeight.toString() + "rem";
    //             });
    //         }

    //         const fontSize = 1 + 0.25 * $appSettings.fontSize;
    //         el.forEach((e) => {
    //             e.style.fontSize = fontSize.toString() + "rem";
    //         });
    //     });
    // });
</script>

<!-- <style>
    .text-book :global(p) {
        min-height: 1lh;
    }
</style> -->

<!-- {@html html} -->

<script lang="ts">
    import { browser } from "$app/environment";
    import { defaultExtensions } from "$lib/text/defaultExtensions";
    import { generateHTML, type JSONContent } from "@tiptap/core";

    let { value }: { value: JSONContent } = $props();

    let html = $derived(browser ? generateHTML(value, defaultExtensions) : "");
</script>

{@html html}
