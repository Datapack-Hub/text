<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor, type JSONContent } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
    import Underline from "@tiptap/extension-underline"
    import Color from "@tiptap/extension-color"
    import TextStyle from "@tiptap/extension-text-style"
	import { colorMap, Fonts, Obfuscation, type MinecraftText } from "./text";

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
                font: c.marks?.at(0)?.attrs?.font
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
		class:active={editor.isActive("bold")}>
		Bold
	</button>
	<button
		on:click={() => editor.chain().focus().toggleItalic().run()}
		class:active={editor.isActive("italic")}>
		Italic
	</button>
	<button
		on:click={() => editor.chain().focus().toggleStrike().run()}
		class:active={editor.isActive("strikethrough")}>
		Strikethrough
	</button>
    <button
		on:click={() => editor.chain().focus().toggleUnderline().run()}
		class:active={editor.isActive("underline")}>
		Underline
	</button>
    <button
		on:click={() => editor.chain().focus().toggleObfuscated().run()}
		class:active={editor.isActive("underline")}>
		Obfuscate
	</button>
    <button
		on:click={() => editor.chain().focus().setFont(fontName).run()}
		class:active={editor.isActive("underline")}>
		Font
	</button>
    <button
		on:click={() => editor.chain().focus().unsetFont().run()}
		class:active={editor.isActive("underline")}>
		Remove Font
	</button>

    {#each colorMap as color}
        <button
            on:click={() => editor.chain().focus().setColor(color.value).run()}
            title={color.name}
            class="ml-2"
            class:active={editor.isActive("underline")}>
            <div class="size-4" style="background-color: {color.value};"></div>
        </button>
    {/each}
    <input type="color" bind:value={color} on:contextmenu={e => e.preventDefault()} on:mousedown={customColorHandler}>
    <input type="text" bind:value={fontName} placeholder="Enter font name">
{/if}

<div class="font-minecraft" bind:this={element} />

<div>
    Debug<br>
    <code>{editor ? JSON.stringify(editor.getJSON()) : "Loading..."}</code>
    <br>Final<br>
    <code>{editor ? translate(editor.getJSON()) : "Loading..."}</code>
</div>
