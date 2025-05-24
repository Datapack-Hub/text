<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor, isMarkActive, type JSONContent } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import Underline from "@tiptap/extension-underline";
	import Color from "@tiptap/extension-color";
	import TextStyle from "@tiptap/extension-text-style";
	import {
		ClickEventMark,
		colorMap,
		Fonts,
		HoverEventMark,
		Obfuscation,
		type MinecraftText,
		type MinecraftTextWithNoEvents,
	} from "$lib/tiptap/text";

	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square";
	import IconColor from "~icons/tabler/palette";

	// TODO: convert to non-legacy mode
	export let value = "";

	let element: HTMLElement;
	let editor: Editor;
	let color = "";

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Underline,
				Color,
				TextStyle,
				Obfuscation,
				Fonts,
				ClickEventMark,
				HoverEventMark,
			],
			content: "<p>Hello World!</p>",
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
			onUpdate: ({ editor }) => {
				value = JSON.stringify(editor.getJSON());
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function translate(json: JSONContent): string {
		if (!json.content![0].content) {
			return "waiting for output...";
		}

		const paragraphs = json.content!;

		let data: (MinecraftText | string)[] = [""];

        paragraphs.forEach((p, i) => {
            const content = p.content!
            content.forEach((c) => {
                data.push({
                    text: c.text,
                    color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
                    bold: trueMarkOrUndefined(c, "bold"),
                    italic: trueMarkOrUndefined(c, "italic"),
                    strikethrough: trueMarkOrUndefined(c, "strike"),
                    underlined: trueMarkOrUndefined(c, "underline"),
                    obfuscated: trueMarkOrUndefined(c, "obfuscated"),
                    font: undefined,
                    click_event: getMarkType(c, "clickEvent")?.attrs as {
                        action: string;
                        value: string;
                    },
                    hover_event: getMarkType(c, "hoverEvent")?.attrs as {
                        action: string;
                        contents: MinecraftTextWithNoEvents;
                    },
                });
            });

            if (i < paragraphs.length - 1) {
                data.push("\n")
            }
        })

		return JSON.stringify(data);
	}

	function trueMarkOrUndefined(
		content: JSONContent,
		mark: string,
	): true | undefined {
		const value = content.marks?.some((e) => e.type === mark);
		return value === true ? value : undefined;
	}

	function defaultColorLUT(color: string): string {
		return colorMap.find((e) => e.value === color)?.name || color;
	}

	function customColorHandler() {
		editor.chain().focus().setColor(color).run();
	}

	function getMarkType(c: JSONContent, type: string) {
		return c.marks?.find((e) => e.type === type);
	}

    export function getValue(){
        return translate(editor.getJSON()).replace(/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, (match) => match.replace(/"/g, ""))
    }
</script>

<div class="flex flex-col">
    <div class="w-full p-2 bg-black/50 flex items-center flex-wrap rounded-t-md">
    {#if editor}
        <button
            onclick={() => editor.chain().focus().toggleBold().run()}
            class="p-0.5 text-sm hover:bg-zinc-800 rounded-md font-medium {editor.isActive('bold') ? 'bg-zinc-800': ''}">
            <IconBold />
        </button>
        <button
            onclick={() => editor.chain().focus().toggleItalic().run()}
            class="p-0.5 text-sm hover:bg-zinc-800 rounded-md font-medium {editor.isActive('italic') ? 'bg-zinc-800': ''}"
            class:active={editor.isActive("italic")}>
            <IconItalic />
        </button>
        <button
            onclick={() => editor.chain().focus().toggleStrike().run()}
            class="p-0.5 text-sm hover:bg-zinc-800 rounded-md font-medium {editor.isActive('strike') ? 'bg-zinc-800': ''}"
            class:active={editor.isActive("strikethrough")}>
            <IconStrikethrough />
        </button>
        <button
            onclick={() => editor.chain().focus().toggleUnderline().run()}
            class="p-0.5 text-sm hover:bg-zinc-800 rounded-md font-medium {editor.isActive('underline') ? 'bg-zinc-800': ''}"
            class:active={editor.isActive("underline")}>
            <IconUnderline />
        </button>
        <!-- <button
            onclick={() => editor.chain().focus().toggleObfuscated().run()}
            class="p-0.5 text-sm hover:bg-zinc-800 rounded-md font-medium"
            class:active={editor.isActive("underline")}>
            <IconObfuscate />
        </button> -->
        
        <div class="w-4" />

        {#each colorMap as color}
            <button
                onclick={() => editor.chain().focus().setColor(color.value).run()}
                title={color.name}
                class="p-0.5 text-sm hover:bg-zinc-800 rounded-md {editor.isActive('textStyle', { color: color.value }) ? 'bg-zinc-800': ''}"
                style="color: {color.value};">
                <IconSquare />
            </button>
        {/each}
        <button
            onclick={() => editor.chain().focus().unsetColor().run()}
            title="Default"
            class="p-0.5 text-sm hover:bg-zinc-800 text-zinc-500 rounded-md"
            class:active={editor.isActive("underline")}>
            <IconHollow />
        </button>

        <label for="color" class="p-0.5 text-sm hover:bg-zinc-800 rounded-md font-medium"><IconColor /></label>
        <input
            type="color"
            id="color"
            bind:value={color}
            onchange={customColorHandler}
            class="invisible w-0" />
    {/if}
    </div>

    <div
        class="font-minecraft bg-black/30 w-full first:focus:outline-none flex-grow rounded-b-md"
        bind:this={element}>
    </div>
</div>