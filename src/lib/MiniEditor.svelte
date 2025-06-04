<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor, isMarkActive, type JSONContent } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import Placeholder from "@tiptap/extension-placeholder";
	import Underline from "@tiptap/extension-underline";
	import Color from "@tiptap/extension-color";
	import TextStyle from "@tiptap/extension-text-style";
	import {
		colorMap,
		type MinecraftText,
		type BaseMinecraftText,
		addTypeSpecificValues,
	} from "$lib/tiptap/text";

	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square-x";
	import IconColor from "~icons/tabler/palette";
	import IconObfuscate from "~icons/tabler/password";
	import {
		ClickEventMark,
		Fonts,
		HoverEventMark,
		Obfuscation,
	} from "$lib/tiptap/extensions";
	import { convertToTextOrEmpty, snbtToDocument } from "./nbt";

	// TODO: convert to non-legacy mode
	export let value = "";

	export let output = "";

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
				Placeholder.configure({
					placeholder: "Write text here, and style it with the options above!",
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

	function translate(
		json: JSONContent
	): string {
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
			return ""
		}


		console.log(
			JSON.stringify(
				snbtToDocument(convertToTextOrEmpty(JSON.stringify(data))),
			),
		);
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
		const jsonContent = snbtToDocument(convertToTextOrEmpty(input))
		console.log(jsonContent)
		editor.commands.setContent(jsonContent);
	}
</script>

<div class="flex flex-col">
	<div class="w-full p-2 bg-black/50 flex items-center flex-wrap rounded-t-md">
		{#if editor}
			<button
				onclick={() => editor.chain().focus().toggleBold().run()}
				class="p-0.5 text-sm hover:bg-white/2 rounded-md font-medium {editor.isActive(
					'bold',
				)
					? 'bg-zinc-800'
					: ''}">
				<IconBold />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleItalic().run()}
				class="p-0.5 text-sm hover:bg-white/2 rounded-md font-medium {editor.isActive(
					'italic',
				)
					? 'bg-zinc-800'
					: ''}"
				class:active={editor.isActive("italic")}>
				<IconItalic />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleStrike().run()}
				class="p-0.5 text-sm hover:bg-white/2 rounded-md font-medium {editor.isActive(
					'strike',
				)
					? 'bg-zinc-800'
					: ''}"
				class:active={editor.isActive("strikethrough")}>
				<IconStrikethrough />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleUnderline().run()}
				class="p-0.5 text-sm hover:bg-white/2 rounded-md font-medium {editor.isActive(
					'underline',
				)
					? 'bg-zinc-800'
					: ''}">
				<IconUnderline />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleObfuscated().run()}
				class="p-0.5 text-sm hover:bg-white/2 rounded-md font-medium {editor.isActive(
					'obfuscated',
				)
					? 'bg-zinc-800'
					: ''}">
				<IconObfuscate />
			</button>

			<div class="w-4"></div>

			{#each colorMap as color}
				<button
					onclick={() => editor.chain().focus().setColor(color.value).run()}
					title={color.name}
					class="p-0.5 text-sm hover:bg-white/2 rounded-md {editor.isActive(
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
					onclick={() => editor.chain().focus().unsetColor().run()}
					class="p-1 text-lg hover:bg-white/2 text-zinc-500 rounded-md">
					<IconHollow />
				</button>
			{/if}

			<label
				for="color"
				class="p-0.5 text-sm hover:bg-white/2 rounded-md font-medium"
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
