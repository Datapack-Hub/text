<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor, type JSONContent } from "@tiptap/core";
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
	} from "./tiptap/text";
	import { dev } from "$app/environment";

	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";
	import IconObfuscate from "~icons/tabler/password";
	import IconSquare from "~icons/tabler/square-filled";

	// TODO: convert to non-legacy mode
	export let value = "";

	let element: HTMLElement;
	let editor: Editor;
	let color = "";
	let fontName = "";
	let clickEventType = "";
	let clickEventValue = "";
	let clickEventDialog: HTMLDialogElement;
	let hoverEventType = "";
	let hoverEventValue: object;
	let hoverEventDialog: HTMLDialogElement;

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

		const content = json.content![0].content!;

		let data: MinecraftText[] = [];

		content.forEach((c) => {
			data.push({
				bold: trueMarkOrUndefined(c, "bold"),
				italic: trueMarkOrUndefined(c, "italic"),
				strikethrough: trueMarkOrUndefined(c, "strike"),
				underlined: trueMarkOrUndefined(c, "underline"),
				obfuscated: trueMarkOrUndefined(c, "obfuscated"),
				text: c.text,
				color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
				font: getMarkType(c, "textStyle")?.attrs?.font,
				clickEvent: getMarkType(c, "clickEvent")?.attrs as {
					action: string;
					value: string;
				},
				hoverEvent: getMarkType(c, "hoverEvent")?.attrs as {
					action: string;
					contents: MinecraftTextWithNoEvents;
				},
			});
		});

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
</script>

{#if editor}
	<button
		onclick={() => editor.chain().focus().toggleBold().run()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive(
			'bold',
		)
			? 'bg-zinc-800'
			: ''}">
		<IconBold />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleItalic().run()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("italic")}>
		<IconItalic />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleStrike().run()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("strikethrough")}>
		<IconStrikethrough />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleUnderline().run()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		<IconUnderline />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleObfuscated().run()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		<IconObfuscate />
	</button>
	<button
		onclick={() => editor.chain().focus().setFont(fontName).run()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		Font
	</button>
	<button
		onclick={() => editor.chain().focus().unsetFont().run()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		Remove Font
	</button>
	<button
		onclick={() => clickEventDialog.showModal()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		Click Event
	</button>
	<button
		onclick={() => hoverEventDialog.showModal()}
		class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		Hover Event
	</button>

	{#each colorMap as color}
		<button
			onclick={() => editor.chain().focus().setColor(color.value).run()}
			title={color.name}
			class="p-1 text-lg hover:bg-zinc-800"
			class:active={editor.isActive("underline")}
			style="color: {color.value};">
			<IconSquare />
		</button>
	{/each}

	<br />

	<label for="color">Custom Color:</label>
	<input
		type="color"
		id="color"
		bind:value={color}
		onchange={customColorHandler}
		class="size-6 bg-transparent border-0" />

	<br />

	<label for="font">Custom Font:</label>
	<input
		class="bg-zinc-800 p-2 rounded-md"
		type="text"
		id="font"
		bind:value={fontName}
		placeholder="Enter font name" />
{/if}

<div
	class="font-minecraft bg-zinc-800 w-1/2 p-2 rounded-md mt-2 mb-4"
	bind:this={element}>
</div>

<div>
	{#if dev}
		Debug<br />
		<code>{editor ? JSON.stringify(editor.getJSON()) : "Loading..."}</code>
		<br />
	{/if}
	<code class="inline-block p-3 bg-zinc-950 mt-2 w-1/2 rounded-md"
		>{editor ? translate(editor.getJSON()) : "Loading..."}</code>
</div>

<dialog bind:this={clickEventDialog}>
	<div>
		<select bind:value={clickEventType}>
			<option value="open_url">Open URL</option>
			<option value="run_command">Run Command</option>
			<option value="suggest_command">Suggest Command</option>
			<option value="copy_to_clipboard">Copy to Clipboard</option>
		</select>
		<input type="text" placeholder="Enter value" bind:value={clickEventValue} />
		<button
			onclick={() => {
				clickEventDialog.close();
				editor
					.chain()
					.focus()
					.setClickEvent({ action: clickEventType, value: clickEventValue })
					.run();
			}}>Close</button>
	</div>
</dialog>

<dialog bind:this={hoverEventDialog}>
	<div>
		<select bind:value={hoverEventType}>
			<option value="show_text">Show text</option>
			<option value="show_entity">Show Entity</option>
			<option value="show_item">Show item</option>
		</select>
		{#if hoverEventType === "show_text"}
			<svelte:self bind:value={hoverEventValue} />
		{/if}
		<button
			onclick={() => {
				hoverEventDialog.close();
				editor
					.chain()
					.focus()
					.setHoverEvent({ action: hoverEventType, value: hoverEventValue })
					.run();
			}}>Close</button>
	</div>
</dialog>
