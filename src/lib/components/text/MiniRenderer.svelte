<script lang="ts">
    import { appSettings } from "$lib/settings";
    import {
        AtlasObjectNode,
        BlockNBTNode,
        ClickEventMark,
        EntityNBTNode,
        FixedTextStyle,
        FontsExtension,
        HoverEventMark,
        KeybindNode,
        Obfuscation,
        PlayerObjectNode,
        ScoreNode,
        SelectorNode,
        ShadowColorMark,
        StorageNBTNode,
        TranslateNode,
    } from "$lib/tiptap/extensions/index";
    import { Editor } from "@tiptap/core";
    import Color from "@tiptap/extension-color";
    import StarterKit from "@tiptap/starter-kit";
    import { onMount } from "svelte";

    let { value } = $props();

    let element: HTMLElement = $state()!;

    onMount(() => {
        new Editor({
            element: element,
            extensions: [
                StarterKit.configure({
                    blockquote: false,
                    bulletList: false,
                    codeBlock: false,
                    hardBreak: false,
                    heading: false,
                    horizontalRule: false,
                    listItem: false,
                    orderedList: false,
                    link: false,
                }),
                Color,
                FixedTextStyle,
                Obfuscation,
                ClickEventMark,
                HoverEventMark,
                ShadowColorMark,
                ScoreNode,
                TranslateNode,
                BlockNBTNode,
                StorageNBTNode,
                EntityNBTNode,
                KeybindNode,
                SelectorNode,
                AtlasObjectNode,
                PlayerObjectNode,
                FontsExtension,
            ],
            content: value,
            editorProps: {
                attributes: {
                    class: 'tiptap-minirenderer',
                },
            },
        }).setEditable(false);

        appSettings.subscribe(() => {
            var el = document.querySelectorAll(".tiptap") as NodeListOf<HTMLElement>;

            if ($appSettings.realisticLineHeight == true) {
                var lineHeight = 0.8 + 0.2 * $appSettings.fontSize;
                el.forEach((e) => {
                    e.style.lineHeight = lineHeight.toString() + "rem";
                });
            } else {
                var lineHeight = 1.25 + 0.25 * $appSettings.fontSize;
                el.forEach((e) => {
                    e.style.lineHeight = lineHeight.toString() + "rem";
                });
            }

            var fontSize = 1 + 0.25 * $appSettings.fontSize;
            el.forEach((e) => {
                e.style.fontSize = fontSize.toString() + "rem";
            });
        });
    });
</script>

<div bind:this={element} role="textbox" tabindex="0"></div>
