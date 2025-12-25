<script lang="ts">
	import {
		AtlasObjectNode,
		BlockNBTNode,
		ClickEventMark,
		EntityNBTNode,
		FixedTextStyle,
		FontsExtension,
		HoverEventMark,
		KeybindNode,
		Obfuscation,
		PlayerObjectNode,
		ScoreNode,
		SelectorNode,
		ShadowColorMark,
		StorageNBTNode,
		TranslateNode,
	} from "$lib/tiptap/extensions/index";
	import { Editor } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import StarterKit from "@tiptap/starter-kit";
	import { onMount } from "svelte";

	let { value } = $props();

	let element: HTMLElement = $state()!;

	onMount(() => {
		new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					blockquote: false,
					bulletList: false,
					codeBlock: false,
					hardBreak: false,
					heading: false,
					horizontalRule: false,
					listItem: false,
					orderedList: false,
					link: false,
				}),
				Color,
				FixedTextStyle,
				Obfuscation,
				ClickEventMark,
				HoverEventMark,
				ShadowColorMark,
				BlockNBTNode,
				EntityNBTNode,
				KeybindNode,
				ScoreNode,
				SelectorNode,
				AtlasObjectNode,
				PlayerObjectNode,
				StorageNBTNode,
				TranslateNode,
				FontsExtension,
			],
			content: value,
		}).setEditable(false);
	});
</script>

<div
	bind:this={element}
	onkeypress={(e) => e.stopImmediatePropagation()}
	role="textbox"
	tabindex="0">
</div>
