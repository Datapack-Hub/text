<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor, isMarkActive, type JSONContent } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import Underline from "@tiptap/extension-underline";
	import Color from "@tiptap/extension-color";
	import TextStyle from "@tiptap/extension-text-style";
    import Placeholder from '@tiptap/extension-placeholder'
	import {
		ClickEventMark,
		colorMap,
		Fonts,
		HoverEventMark,
		Obfuscation,
		type MinecraftText,
		type MinecraftTextWithNoEvents,
	} from "$lib/tiptap/text";
	import { dev } from "$app/environment";

	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";
	import IconObfuscate from "~icons/tabler/password";
	import IconClickEvent from "~icons/tabler/click";
	import IconHoverEvent from "~icons/tabler/pointer";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square";
	import IconColor from "~icons/tabler/palette";
	import Modal from "$lib/Modal.svelte";
	import MiniEditor from "$lib/MiniEditor.svelte";
    

	// TODO: convert to non-legacy mode
	export let value = "";

	let element: HTMLElement;
	let editor: Editor;
	let color = "";
	let fontName = "";
	let clickEventType = "";
	let clickEventValue = "";
	let clickEventDialog: Modal;
	let hoverEventType = "";
	let hoverEventValue: object;
	let hoverEventDialog: Modal;

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
                    placeholder: 'Write text here, style it with the options above, and the output text components will appear at the bottom!',
                })
			],
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
            const content = p.content || []
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
</script>

<div class="flex flex-col h-screen">
    <div class="bg-zinc-950 w-full p-2 px-3 text-zinc-300 flex items-center space-x-1" style="font-family: Lexend">
        <img src="/dph.svg" class="h-5 mr-2"/>
        <span class="mr-6">Minecraft Text Editor <span class="text-xs">(by <a href="https://datapackhub.net/" class="underline">Datapack Hub</a>)</span></span>
        <a href="https://discord.datapackhub.net/" class="underline mr-6 hidden md:inline">Discord</a>
        <a href="https://datapack.wiki/" class="underline mr-6 hidden md:inline">DP Wiki</a>
    </div>
    <div class="w-full p-3 bg-zinc-900 flex items-center flex-wrap">
    {#if editor}
        <button
            onclick={() => editor.chain().focus().toggleBold().run()}
            class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive('bold') ? 'bg-zinc-800': ''}">
            <IconBold />
        </button>
        <button
            onclick={() => editor.chain().focus().toggleItalic().run()}
            class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive('italic') ? 'bg-zinc-800': ''}"
            class:active={editor.isActive("italic")}>
            <IconItalic />
        </button>
        <button
            onclick={() => editor.chain().focus().toggleStrike().run()}
            class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive('strike') ? 'bg-zinc-800': ''}"
            class:active={editor.isActive("strikethrough")}>
            <IconStrikethrough />
        </button>
        <button
            onclick={() => editor.chain().focus().toggleUnderline().run()}
            class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive('underline') ? 'bg-zinc-800': ''}"
            class:active={editor.isActive("underline")}>
            <IconUnderline />
        </button>
        <!-- <button
            onclick={() => editor.chain().focus().toggleObfuscated().run()}
            class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
            class:active={editor.isActive("underline")}>
            <IconObfuscate />
        </button> -->

        <!-- <button
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
        </button> -->
        
        <div class="w-4" />

        {#each colorMap as color}
            <button
                onclick={() => editor.chain().focus().setColor(color.value).run()}
                title={color.name}
                class="p-1 text-lg hover:bg-zinc-800 rounded-md {editor.isActive('textStyle', { color: color.value }) ? 'bg-zinc-800': ''}"
                style="color: {color.value};">
                <IconSquare />
            </button>
        {/each}
        <button
            onclick={() => editor.chain().focus().unsetColor().run()}
            title="Default"
            class="p-1 text-lg hover:bg-zinc-800 text-zinc-500 rounded-md"
            class:active={editor.isActive("underline")}>
            <IconHollow />
        </button>

        <label for="color" class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"><IconColor /></label>
        <input
            type="color"
            id="color"
            bind:value={color}
            onchange={customColorHandler}
            class="invisible w-0" />

        <div class="w-4" />

        <button
            onclick={() => clickEventDialog.open()}
            class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
            class:active={editor.isActive("underline")}>
            <IconClickEvent />
        </button>
        <button
            onclick={() => hoverEventDialog.open()}
            class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
            class:active={editor.isActive("underline")}>
            <IconHoverEvent />
        </button>

        <!-- <label for="font">Custom Font:</label>
        <input
            class="bg-zinc-800 p-2 rounded-md"
            type="text"
            id="font"
            bind:value={fontName}
            placeholder="Enter font name" /> -->
    {/if}
    </div>

    <div
        class="font-minecraft bg-zinc-800 w-full first:focus:outline-none flex-grow"
        bind:this={element}>
    </div>

    <div>
        {#if dev}
            <code class="inline-block p-3">DEV ONLY: {editor ? JSON.stringify(editor.getJSON()) : "Loading..."}</code>
            <br />
        {/if}
        <code class="inline-block p-3 bg-zinc-950 w-full">{editor ? translate(editor.getJSON()).replace(/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, (match) => match.replace(/"/g, "")) : "Loading..."}</code>
    </div>
</div>

<Modal title="Click Event" bind:this={clickEventDialog}>
    <p>Event Type</p>
    <select bind:value={clickEventType} class="bg-zinc-900 p-2 rounded-md">
        <option value="open_url">Open URL</option>
        <option value="run_command">Run Command</option>
        <option value="suggest_command">Suggest Command</option>
        <option value="copy_to_clipboard">Copy to Clipboard</option>
        <option value="change_page">Change Page (in books only)</option>
        <option value="open_dialog">Open Dialog</option>
    </select>

    {#if clickEventType == "open_url"}
        <p class="mt-2">URL:</p>
        <input type="text" class="bg-zinc-900 p-2 rounded-md" placeholder="https://example.com" bind:value={clickEventValue} />
    {:else if clickEventType == "run_command"}
        <p class="mt-2">Command:</p>
        <input type="text" class="bg-zinc-900 p-2 rounded-md" placeholder="/give @s apple" bind:value={clickEventValue} />
        <p class="text-zinc-400">Note: the player must have permission to run the command!</p>
    {:else if clickEventType == "suggest_command"}
        <p class="mt-2">Command:</p>
        <input type="text" class="bg-zinc-900 p-2 rounded-md" placeholder="/give @s apple" bind:value={clickEventValue} />
        <p class="text-zinc-400">Note: the player must have permission to run the command!</p>
    {:else if clickEventType == "copy_to_clipboard"}
        <p class="mt-2">Text to copy:</p>
        <input type="text" class="bg-zinc-900 p-2 rounded-md" placeholder="I love the Wuppertal Suspension Railway" bind:value={clickEventValue} />
    {:else if clickEventType == "change_page"}
        <p class="mt-2">Page to go to:</p>
        <input type="number" class="bg-zinc-900 p-2 rounded-md" placeholder="32" bind:value={clickEventValue} />
    {:else if clickEventType == "open_dialog"}
        <p class="mt-2">Dialog ID:</p>
        <input type="text" class="bg-zinc-900 p-2 rounded-md" placeholder="namespace:example_dialog" bind:value={clickEventValue} />
    {/if}

    <div class="flex items-center space-x-2">
        {#if clickEventType}
        <button onclick={() => {
            clickEventDialog.close();
            editor.chain().focus().setClickEvent({ action: clickEventType, value: clickEventValue }).run();
        }} class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
            Add Click Event
        </button>
        {/if}
    </div>
</Modal>

<Modal title="Hover Event" bind:this={hoverEventDialog}>
    <p>Event Type</p>
    <select bind:value={hoverEventType} class="bg-zinc-900 p-2 rounded-md">
        <option value="show_text">Show Text</option>
			<option value="show_entity">Show Entity</option>
			<option value="show_item">Show Item</option>
    </select>

    {#if hoverEventType === "show_text"}
        <p class="my-2">Text to show</p>
        <MiniEditor />
    {/if}

    <div class="flex items-center space-x-2">
        {#if clickEventType}
        <button onclick={() => {
            clickEventDialog.close();
            editor.chain().focus().setClickEvent({ action: clickEventType, value: clickEventValue }).run();
        }} class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
            Add Click Event
        </button>
        {/if}
    </div>
</Modal>

<dialog>
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

