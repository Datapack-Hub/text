<script lang="ts">
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
	import { convertToTextOrEmpty, snbtToDocument } from "../text/nbt";

	import {
		ClickEventMark,
		FontsExtension,
		HoverEventMark,
		Obfuscation,
		ShadowColorMark,
	} from "$lib/tiptap/extensions/index";
	import TextStyleButtons from "./TextStyleButtons.svelte";
	import {
		colorMap,
		defaultColorLUT,
		trueMarkOrUndefined,
	} from "$lib/text/general";
	import { addTypeSpecificValues } from "$lib/text/nbt_or_json";

	let {
		value = $bindable(),
		output = $bindable(),
		placeholder = "Write text here, and style it with the options above!",
	} = $props();

	let element: HTMLElement;
	let editor: Editor | undefined = $state();
	let color = $state("");

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
			onTransaction: ({ editor: newEditor }) => {
				// force re-render so `editor.isActive` works as expected
				editor = undefined;
				editor = newEditor;
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

	function customColorHandler() {
		editor?.chain().focus().setColor(color).run();
	}

	export function getValue() {
		return translate(editor!.getJSON()).replace(
			/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g,
			(match) => match.replace(/"/g, ""),
		);
	}

	export function importText(input: string) {
		const jsonContent = snbtToDocument(convertToTextOrEmpty(input));
		editor?.commands.setContent(jsonContent);
	}
</script>

<div class="flex w-full flex-col">
	<div class="flex w-full flex-wrap items-center rounded-t-md bg-black/50 p-2">
		{#if editor}
			<TextStyleButtons {editor} small />

			<div class="w-4"></div>

			{#each colorMap as color}
				<button
					onclick={() => editor?.chain().focus().setColor(color.value).run()}
					title={color.name}
					class="rounded-md p-0.5 text-sm hover:bg-white/3 {editor.isActive(
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
					onclick={() => editor?.chain().focus().unsetColor().run()}
					class="rounded-md p-1 text-lg text-zinc-500 hover:bg-white/3">
					<IconHollow />
				</button>
			{/if}

			<label
				for="color"
				class="rounded-md p-0.5 text-sm font-medium hover:bg-white/3"
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
		class="font-minecraft w-full flex-grow rounded-b-md bg-black/30 first:focus:outline-none"
		bind:this={element}>
	</div>
</div>
