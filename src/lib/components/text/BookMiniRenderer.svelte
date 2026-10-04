<script lang="ts">
    import { browser } from "$app/environment";
    import { defaultExtensions } from "$lib/text/defaultExtensions";
    import { generateHTML, type JSONContent } from "@tiptap/core";

    let { value }: { value: JSONContent } = $props();

    let html = $derived(browser ? generateHTML(value, defaultExtensions) : "");
</script>

{@html html}
