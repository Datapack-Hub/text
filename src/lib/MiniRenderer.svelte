<script lang="ts">
	import { Editor } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import TextStyle from "@tiptap/extension-text-style";
	import Underline from "@tiptap/extension-underline";
	import StarterKit from "@tiptap/starter-kit";
	import { onMount } from "svelte";
	import {
		Obfuscation,
		Fonts,
		BlockNBTNode,
		EntityNBTNode,
		KeybindNode,
		ScoreNode,
		SelectorNode,
		StorageNBTNode,
		TranslateNode,
		ClickEventMark,
		HoverEventMark
	} from "$lib/tiptap/extensions";

	let { value } = $props();

	let element: HTMLElement;

	onMount(() => {
		new Editor({
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
				BlockNBTNode,
				EntityNBTNode,
				KeybindNode,
				ScoreNode,
				SelectorNode,
				StorageNBTNode,
				TranslateNode
			],
			content: value,
		}).setEditable(false);
	});
</script>

<div bind:this={element}></div>
