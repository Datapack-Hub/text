<script lang="ts">
	import { addTypeSpecificValues, colorMap } from "$lib/tiptap/text";
	import { type MinecraftText } from "$lib/types";
	import { Editor, type JSONContent } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import Placeholder from "@tiptap/extension-placeholder";
	import TextStyle from "@tiptap/extension-text-style";
	import Underline from "@tiptap/extension-underline";
	import StarterKit from "@tiptap/starter-kit";
	import { onDestroy, onMount } from "svelte";

	import IconColor from "~icons/tabler/palette";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square-x";
	import { convertToTextOrEmpty, snbtToDocument } from "../nbt";

	import {
		ClickEventMark,
		FontsExtension,
		HoverEventMark,
		Obfuscation,
		ShadowColorMark,
	} from "$lib/tiptap/extensions/index";
	import TextStyleButtons from "./TextStyleButtons.svelte";

	// TODO: convert to non-legacy mode
	export let value = "";
	export let output = "";
	export let placeholder =
		"Write text here, and style it with the options above!";

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
				ClickEventMark,
				HoverEventMark,
				ShadowColorMark,
				FontsExtension,
				Placeholder.configure({
					placeholder: placeholder,
				}),
			],
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
			onUpdate: ({ editor }) => {
				value = JSON.stringify(editor.getJSON());
				output = JSON.parse(translate(editor.getJSON()));
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function translate(json: JSONContent): string {
		const paragraphs = json.content!;

		let data: (MinecraftText | string)[] = [""];

		paragraphs.forEach((p, i) => {
			const content = p.content || [];
			let current: MinecraftText;

			content.forEach((c) => {
				current = {
					color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
					bold: trueMarkOrUndefined(c, "bold"),
					italic: trueMarkOrUndefined(c, "italic"),
					strikethrough: trueMarkOrUndefined(c, "strike"),
					underlined: trueMarkOrUndefined(c, "underline"),
					obfuscated: trueMarkOrUndefined(c, "obfuscated"),
				};

				current = addTypeSpecificValues(current, c);

				data.push(current);
			});

			if (i < paragraphs.length - 1) {
				data.push("\n");
			}
		});

		if (data.length === 1 && data[0] === "") {
			return "";
		}

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

	export function getValue() {
		return translate(editor.getJSON()).replace(
			/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g,
			(match) => match.replace(/"/g, ""),
		);
	}

	export function importText(input: string) {
		const jsonContent = snbtToDocument(convertToTextOrEmpty(input));
		editor.commands.setContent(jsonContent);
	}
</script>

<div class="flex flex-col w-full">
	<div class="w-full p-2 bg-black/50 flex items-center flex-wrap rounded-t-md">
		{#if editor}
			<TextStyleButtons {editor} small />

			<div class="w-4"></div>

			{#each colorMap as color}
				<button
					onclick={() => editor.chain().focus().setColor(color.value).run()}
					title={color.name}
					class="p-0.5 text-sm hover:bg-white/3 rounded-md {editor.isActive(
						'textStyle',
						{ color: color.value },
					)
						? 'bg-zinc-800'
						: ''}"
					style="color: {color.value};">
					<IconSquare />
				</button>
			{/each}
			{#if editor.isActive("textStyle")}
				<button
					aria-label="unset color"
					onclick={() => editor.chain().focus().unsetColor().run()}
					class="p-1 text-lg hover:bg-white/3 text-zinc-500 rounded-md">
					<IconHollow />
				</button>
			{/if}

			<label
				for="color"
				class="p-0.5 text-sm hover:bg-white/3 rounded-md font-medium"
				><IconColor /></label>
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
