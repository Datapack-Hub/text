<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor, type JSONContent } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
    import Underline from "@tiptap/extension-underline"
    import Color from "@tiptap/extension-color"
    import TextStyle from "@tiptap/extension-text-style"
	import { colorMap, Fonts, Obfuscation, type MinecraftText } from "./text";
	import { dev } from "$app/environment";

    import IconBold from '~icons/tabler/bold'
    import IconItalic from '~icons/tabler/italic'
    import IconStrikethrough from '~icons/tabler/strikethrough'
    import IconUnderline from '~icons/tabler/underline'
    import IconObfuscate from '~icons/tabler/password'
    import IconSquare from '~icons/tabler/square-filled'

	let element: HTMLElement;
	let editor: Editor;
    let color = "";
    let fontName = "";

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [StarterKit, Underline, Color, TextStyle, Obfuscation, Fonts],
			content: "<p>Hello World!</p>",
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

    function translate(json: JSONContent): string {

        if(!json.content![0].content) {
            return "waiting for output..."
        }
        
        const content = json.content![0].content!

        let data: MinecraftText[] = []
        
        content.forEach(c => {

            data.push({
                bold: trueMarkOrUndefined(c, "bold"),
                italic: trueMarkOrUndefined(c, "italic"),
                strikethrough: trueMarkOrUndefined(c, "strike"),
                underlined: trueMarkOrUndefined(c, "underline"),
                obfuscated: trueMarkOrUndefined(c, "obfuscated"),
                text: c.text,
                color: c.marks?.at(0)?.attrs?.color || "white",
                font: c.marks?.at(0)?.attrs?.font || undefined
            })
        })


        return JSON.stringify(data)
    }

    function trueMarkOrUndefined(content: JSONContent, mark: string): true | undefined {
        const value = content.marks?.some(e => e.type === mark)
        return value === true ? value : undefined
    }

    function customColorHandler(e: MouseEvent) {
        if (e.button == 2) {
            console.log("using custom color")
            console.log(color)
            e.preventDefault()
            editor.chain().focus().setColor(color).run()
        }
    }
</script>

{#if editor}
	<button
		on:click={() => editor.chain().focus().toggleBold().run()}
        class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive("bold") ? "bg-zinc-800" : ""}">
		<IconBold />
	</button>
	<button
		on:click={() => editor.chain().focus().toggleItalic().run()}
        class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("italic")}>
		<IconItalic />
	</button>
	<button
		on:click={() => editor.chain().focus().toggleStrike().run()}
        class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("strikethrough")}>
		<IconStrikethrough />
	</button>
    <button
		on:click={() => editor.chain().focus().toggleUnderline().run()}
        class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		<IconUnderline />
	</button>
    <button
		on:click={() => editor.chain().focus().toggleObfuscated().run()}
        class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		<IconObfuscate />
	</button>
    <button
		on:click={() => editor.chain().focus().setFont(fontName).run()}
        class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		Font
	</button>
    <button
		on:click={() => editor.chain().focus().unsetFont().run()}
        class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
		class:active={editor.isActive("underline")}>
		Remove Font
	</button>

    <button class="px-2" />

    {#each colorMap as color}
        <button
            on:click={() => editor.chain().focus().setColor(color.value).run()}
            title={color.name}
            class="p-1 text-lg hover:bg-zinc-800"
            class:active={editor.isActive("underline")}
            style="color: {color.value};">
            <IconSquare />
        </button>
    {/each}

    <br>

    <label for="color">Custom Color:</label>
    <input type="color" id="color" bind:value={color} on:contextmenu={e => e.preventDefault()} on:mousedown={customColorHandler} class="size-6 bg-transparent border-0">
    
    <br>

    <label for="font">Custom Font:</label>
    <input class="bg-zinc-800 p-2 rounded-md" type="text" id="font" bind:value={fontName} placeholder="Enter font name">
{/if}

<div class="font-minecraft bg-zinc-800 w-1/2 p-2 rounded-md mt-2 mb-4" bind:this={element} />

<div>
    {#if dev}        
        Debug<br>
        <code>{editor ? JSON.stringify(editor.getJSON()) : "Loading..."}</code>
        <br>
    {/if}
    <code class="inline-block p-3 bg-zinc-950 mt-2 w-1/2 rounded-md">{editor ? translate(editor.getJSON()) : "Loading..."}</code>
</div>
