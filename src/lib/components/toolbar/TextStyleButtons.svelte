<script lang="ts">
    import { colourMap } from "$lib/text/utils";
    import { tooltip } from "$lib/tooltip";
    import type { Editor } from "@tiptap/core";
    import ColorPicker from "svelte-awesome-color-picker";
    import IconBold from "~icons/tabler/bold";
    import IconItalic from "~icons/tabler/italic";
    import IconObfuscate from "~icons/tabler/password";
    import IconShadow from "~icons/tabler/shadow";
    import IconStrikethrough from "~icons/tabler/strikethrough";
    import IconUnderline from "~icons/tabler/underline";
    import ShadowColorButton from "./ShadowColorButton.svelte";

    const { editor, small = false }: { editor: Editor; small?: boolean } = $props();
    let shadowColorValue = $state("#ffffff");
    let shouldIgnoreInitInput = true;
    let isColorPickerOpen = $state(false);
</script>

<button
    aria-label="Bold"
    data-testid="bold-button"
    onclick={() => editor.chain().focus().toggleBold().run()}
    {@attach tooltip}
    class="p-1 {small
        ? 'text-sm'
        : 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive('bold')
        ? 'bg-zinc-800'
        : ''}">
    <IconBold />
</button>
<button
    aria-label="Italic"
    data-testid="italic-button"
    onclick={() => editor.chain().focus().toggleItalic().run()}
    {@attach tooltip}
    class="p-1 {small
        ? 'text-sm'
        : 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive('italic')
        ? 'bg-zinc-800'
        : ''}">
    <IconItalic />
</button>
<button
    aria-label="Strikethrough"
    data-testid="strikethrough-button"
    onclick={() => editor.chain().focus().toggleStrike().run()}
    {@attach tooltip}
    class="p-1 {small
        ? 'text-sm'
        : 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive('strike')
        ? 'bg-zinc-800'
        : ''}">
    <IconStrikethrough />
</button>
<button
    aria-label="Underline"
    data-testid="underline-button"
    onclick={() => editor.chain().focus().toggleUnderline().run()}
    {@attach tooltip}
    class="p-1 {small
        ? 'text-sm'
        : 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive('underline')
        ? 'bg-zinc-800'
        : ''}">
    <IconUnderline />
</button>
<button
    aria-label="Obfuscated"
    data-testid="obfuscation-button"
    onclick={() => editor.chain().focus().toggleObfuscated().run()}
    {@attach tooltip}
    class="p-1 {small
        ? 'text-sm'
        : 'text-lg'} rounded-md font-medium hover:bg-white/3 {editor.isActive('obfuscated')
        ? 'bg-zinc-800'
        : ''}">
    <IconObfuscate />
</button>

{#if !editor.isActive("shadowColor") || isColorPickerOpen}
    <ColorPicker
        bind:hex={shadowColorValue}
        bind:isOpen={isColorPickerOpen}
        --cp-bg-color="#18181b"
        --cp-text-color="white"
        --cp-input-color="#0C0C0E"
        --cp-button-hover-color="#18181b"
        textInputModes={["hex"]}
        onInput={(c) => {
            if (isColorPickerOpen) {
                c.hex && editor.chain().focus().setShadowColor(c.hex).run();
            }
        }}
        swatches={Object.values(colourMap).map((c) => c.value)}
        components={{ input: ShadowColorButton }} />
{:else}
    <button
        aria-label="Unset Shadow Color"
        {@attach tooltip}
        onclick={() => {
            shouldIgnoreInitInput = true;
            shadowColorValue = "#ffffff";
            editor.chain().focus().unsetShadowColor().run();
        }}
        class="p-1 {small
            ? 'text-sm'
            : 'text-lg'} rounded-md bg-zinc-800 font-medium hover:bg-white/3">
        <IconShadow />
    </button>
{/if}
