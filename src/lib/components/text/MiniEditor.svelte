<script lang="ts">
	import { type MinecraftText, type StringyMCText } from "$lib/types";
	import { Editor, type JSONContent } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import Placeholder from "@tiptap/extension-placeholder";
	import { TextStyle } from "@tiptap/extension-text-style";
	import StarterKit from "@tiptap/starter-kit";
	import { onDestroy, onMount } from "svelte";

	import IconColor from "~icons/tabler/palette";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square-x";
	import { convertToTextOrEmpty, snbtToDocument } from "../../text/nbt/import";

	import {
		colorMap,
		defaultColorLUT,
		trueMarkOrUndefined,
	} from "$lib/text/utils";
	import { addTypeSpecificValues } from "$lib/text/nbt/export";
	import {
		FontsExtension,
		Obfuscation,
		ShadowColorMark,
	} from "$lib/tiptap/extensions/index";
	import TextStyleButtons from "./TextStyleButtons.svelte";

	let {
		value = $bindable(),
		output = $bindable(),
		placeholder = "Write text here, and style it with the options above!",
	} = $props();

	let element: HTMLElement = $state()!;
	let editor: Editor | undefined = $state();
	let color = $state("");

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Color,
				TextStyle,
				Obfuscation,
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
				// TODO: fix the JSON parsing errors that can happen here
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

		let data: StringyMCText[] = [""];

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
		class="font-minecraft w-full grow rounded-b-md bg-black/30 first:focus:outline-none"
		bind:this={element}>
	</div>
</div>
