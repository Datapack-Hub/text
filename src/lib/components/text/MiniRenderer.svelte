<script lang="ts">
	import {
		BlockNBTNode,
		ClickEventMark,
		EntityNBTNode,
		FontsExtension,
		HoverEventMark,
		KeybindNode,
		Obfuscation,
		ScoreNode,
		SelectorNode,
		ShadowColorMark,
		StorageNBTNode,
		TranslateNode,
	} from "$lib/tiptap/extensions/index";
	import { Editor } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import { TextStyle } from "@tiptap/extension-text-style";
	import StarterKit from "@tiptap/starter-kit";
	import { onMount } from "svelte";

	let { value } = $props();

	let element: HTMLElement;

	onMount(() => {
		new Editor({
			element: element,
			extensions: [
				StarterKit,
				Color,
				TextStyle,
				Obfuscation,
				ClickEventMark,
				HoverEventMark,
				BlockNBTNode,
				EntityNBTNode,
				KeybindNode,
				ScoreNode,
				SelectorNode,
				StorageNBTNode,
				TranslateNode,
				ShadowColorMark,
				FontsExtension,
			],
			content: value,
		}).setEditable(false);
	});
</script>

<div bind:this={element}></div>
