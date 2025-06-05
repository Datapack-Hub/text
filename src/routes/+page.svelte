<script lang="ts">
	import { dev } from "$app/environment";
	import {
		addTypeSpecificValues,
		applyGradient,
		colorMap,
		defaultColorLUT,
		trueMarkOrUndefined,
		type ExternalSources,
		type MinecraftText,
	} from "$lib/tiptap/text";

	import {
		BlockNBTNode,
		ClickEventMark,
		EntityNBTNode,
		HoverEventMark,
		KeybindNode,
		Obfuscation,
		ScoreNode,
		SelectorNode,
		StorageNBTNode,
		TranslateNode,
		FixedTextStyle,
	} from "$lib/tiptap/extensions/index";
	// Components
	import MiniEditor from "$lib/components/MiniEditor.svelte";
	import MiniRenderer from "$lib/components/MiniRenderer.svelte";
	import Modal from "$lib/Modal.svelte";
	import ColorPicker from "svelte-awesome-color-picker";

	import tippy from "tippy.js";
	import "tippy.js/dist/tippy.css";
	// optional

	import { convertToTextOrEmpty, snbtToDocument } from "$lib/nbt";
	import { Editor, type JSONContent } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import Placeholder from "@tiptap/extension-placeholder";
	import Underline from "@tiptap/extension-underline";
	import StarterKit from "@tiptap/starter-kit";
	import { onDestroy, onMount } from "svelte";
	// Icons
	import IconTick from "~icons/tabler/check";
	import IconGradient from "~icons/tabler/contrast-2";
	import IconCopy from "~icons/tabler/copy";
	import IconClickEvent from "~icons/tabler/hand-finger";
	import IconColor from "~icons/tabler/palette";
	import IconEdit from "~icons/tabler/pencil";
	import IconCustom from "~icons/tabler/plus";
	import IconHoverEvent from "~icons/tabler/pointer";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square-x";
	import IconDelete from "~icons/tabler/trash";

	import TextStyleButtons from "$lib/components/TextStyleButtons.svelte";
	import IconScore from "~icons/tabler/123";
	import IconSelector from "~icons/tabler/at";
	import IconNBT from "~icons/tabler/braces";
	import IconKeybind from "~icons/tabler/keyboard";
	import IconTranslate from "~icons/tabler/language";
	import { ShadowColorMark } from "$lib/tiptap/extensions/marks/ShadowColorMark";

	// TODO: convert to non-legacy mode
	export let value = "";

	let element: HTMLElement;
	let editor: Editor;
	let color = "#ffffff";
	let colorDialog: Modal;

	let outputDialog: Modal;
	let outputVersion: "new" | "old";

	let doesContentExist: boolean = false;

	// Import
	let importDialog: Modal;
	let importText: string;

	let recentlyCopied = false;

	// Snapshots and stuff
	let snapshots: object[] = [];
	let recentlySaved = false;
	let loadDialog: Modal;

	// Dialogs
	let gradientDialog: Modal;
	let gradientSteps: string[] = ["#ffffff"];

	let clickEventType = "";
	let clickEventValue = "";
	let clickEventDialog: Modal;

	let hoverEventType = "";
	let hoverEventValue: any;
	let hoverEventEditor: MiniEditor;
	let hoverEventDialog: Modal;

	let customType: string | undefined;
	let customDialog: Modal;
	let customValues: ExternalSources = {
		score: {
			objective: "",
			name: "",
		},
		translate: {
			key: "",
			params: [],
			fallback: undefined,
		},
		nbt: {
			sourceType: "",
			storage: "",
			entity: "",
			block: "",
			path: "",
			interpret: false,
		},
		keybind: {
			key: "",
		},
		selector: {
			selector: "",
		},
	};

	function importToEditor() {
		const jsonContent = snbtToDocument(convertToTextOrEmpty(importText));
		editor.commands.setContent(jsonContent);
		importDialog.close();
	}

	onMount(() => {
		if (localStorage.getItem("content")) {
			value = localStorage.getItem("content")!;
		} else {
			value = "[]";
			localStorage.setItem("content", "");
		}

		if (localStorage.getItem("snapshots")) {
			snapshots = JSON.parse(localStorage.getItem("snapshots")!);
		} else {
			snapshots = [];
			localStorage.setItem("snapshots", "");
		}

		editor = new Editor({
			element: element,
			content: JSON.parse(value),
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
				}),
				Underline,
				Color,
				FixedTextStyle,
				Obfuscation,
				ClickEventMark,
				HoverEventMark,
				ShadowColorMark,
				ScoreNode,
				TranslateNode,
				BlockNBTNode,
				StorageNBTNode,
				EntityNBTNode,
				KeybindNode,
				SelectorNode,
				Placeholder.configure({
					placeholder:
						"Write text here, style it with the options above, and the output text components will appear at the bottom!",
				}),
			],
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
			onUpdate: ({ editor }) => {
				value = JSON.stringify(editor.getJSON());
				debounce(saveContent, 1000)();
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function toTitleCase(str: string) {
		return str.replace(
			/\w\S*/g,
			(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
		);
	}

	function translateToNBT(
		jsonContent: JSONContent,
		exportType: string = "standard",
		exportVersion: "new" | "old" = "new"
	): string {
		if(exportVersion == "new") {
			return translate(jsonContent, exportType).replace(
				/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g,
				(match) => match.replace(/"/g, ""),
			);
		} else {
			return translate(jsonContent, exportType, "old")
		}
	}

	function translate(
		json: JSONContent,
		exportType: string = "standard",
		exportVersion: "new" | "old" = "new"
	): string {
		const paragraphs = json.content!;

		if (exportType == "standard") {
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

					const shadowColorMark = c.marks?.find((m) => m.type === "shadowColor");
					if (shadowColorMark) {
						current.shadow_color = parseInt(shadowColorMark.attrs?.shadowColor.replace(/^#/, ""), 16);
					}

					current = addTypeSpecificValues(current, c, true, exportVersion);

					data.push(current);
				});

				if (i < paragraphs.length - 1) {
					data.push("\n");
				}
			});

			if (data.length === 1 && data[0] === "") {
				doesContentExist = false;
				if (Math.random() < 0.002) {
					return "🤓 <- james is waiting for you to type something";
				}
				return "waiting for input...";
			}

			doesContentExist = true;

			if(data.length == 2) {
				return JSON.stringify(data[1])
			}

			return JSON.stringify(data);
		} else if (exportType == "item_lore") {
			let data: ((MinecraftText | string)[] | (MinecraftText | string))[] = [];

			paragraphs.forEach((p) => {
				const content = p.content || [];
				let currentLine: (MinecraftText | string)[] = [];
				let currentComponent: MinecraftText;

				content.forEach((c, i) => {
					currentComponent = {
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
					};

					// For lore: default behaviour is to be purple and italic
					// If the first element in the line has colour or italic on, then create an element before it to override the default of the rest of the array
					// If the first element of the array doesn't have colour/italic, then set it to white/false, to override the default of the rest of the array
					if (i === 0) {
						if (currentComponent.color || currentComponent.italic) {
							currentLine.push({
								italic: false,
								color: "white",
							});
						} else {
							if (!currentComponent.color) {
								currentComponent.color = "white";
							}

							if (!currentComponent.italic) {
								currentComponent.italic = false;
							}
						}
					}

					currentComponent = addTypeSpecificValues(currentComponent, c, false);
					currentLine.push(currentComponent);
				});

				if (currentLine.length == 2) {
					data.push(currentLine[1]);
				} else {
					data.push(currentLine);
				}
			});

			return JSON.stringify(data);
		} else {
			return "[]";
		}
	}

	function customColorHandler() {
		editor.chain().focus().setColor(color).run();
		colorDialog.close();
	}

	const debounce = (callback: Function, wait: number) => {
		let timeoutId: number;
		return (...args: any[]) => {
			window.clearTimeout(timeoutId);
			timeoutId = window.setTimeout(() => {
				callback(...args);
			}, wait);
		};
	};

	function saveContent() {
		localStorage.setItem("content", JSON.stringify(editor.getJSON()));
	}

	function saveSnapshot() {
		const snapshotsTemp = localStorage.getItem("snapshots");
		if (snapshotsTemp) {
			snapshots = JSON.parse(snapshotsTemp);
			snapshots.push(editor.getJSON());
			localStorage.setItem("snapshots", JSON.stringify(snapshots));
		} else {
			localStorage.setItem("snapshots", JSON.stringify([editor.getJSON()]));
			snapshots = [editor.getJSON()];
		}
		recentlySaved = true;
		setTimeout(() => {
			recentlySaved = false;
		}, 4000);
	}

	function hoverEditButtonHandler() {
		const { from, to } = editor.state.selection;
		let start = from,
			end = to;
		const doc = editor.state.doc;

		function sameHoverEventMark(pos: number) {
			const node = doc.nodeAt(pos);
			return node?.marks?.find((m) => m.type.name === "hoverEvent");
		}
		const mark = sameHoverEventMark(from);
		if (!mark) return;

		// Expand left
		while (
			start > 0 &&
			JSON.stringify(sameHoverEventMark(start - 1)?.attrs) ===
				JSON.stringify(mark.attrs)
		) {
			start--;
		}
		// Expand right
		while (
			end < doc.content.size &&
			JSON.stringify(sameHoverEventMark(end)?.attrs) ===
				JSON.stringify(mark.attrs)
		) {
			end++;
		}

		editor.chain().focus().setTextSelection({ from: start, to: end }).run();
		const { action, value } = mark.attrs;
		hoverEventType = action;
		hoverEventDialog.open();
		if (hoverEventEditor) {
			hoverEventEditor.importText(JSON.stringify(value));
		}
	}

	function clickEditButtonHandler() {
		// cobble if you want to move this elsewhere then please do
		// what the heck -cbble_
		const { from, to } = editor.state.selection;
		let start = from,
			end = to;
		const doc = editor.state.doc;

		function sameClickEventMark(pos: number) {
			const node = doc.nodeAt(pos);
			return node?.marks?.find((m) => m.type.name === "clickEvent");
		}
		const mark = sameClickEventMark(from);
		if (!mark) return;

		// Expand left
		while (
			start > 0 &&
			JSON.stringify(sameClickEventMark(start - 1)?.attrs) ===
				JSON.stringify(mark.attrs)
		) {
			start--;
		}
		// Expand right
		while (
			end < doc.content.size &&
			JSON.stringify(sameClickEventMark(end)?.attrs) ===
				JSON.stringify(mark.attrs)
		) {
			end++;
		}

		editor.chain().focus().setTextSelection({ from: start, to: end }).run();
		const { action, value } = mark.attrs;
		clickEventType = action;
		clickEventValue = value;
		clickEventDialog.open();
	}
</script>

<div class="flex flex-col h-screen">
	<div
		class="bg-zinc-950 w-full text-zinc-300 flex items-center"
		style="font-family: Lexend">
		<div class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer">
			<img src="/dph.svg" class="h-5" alt="logo" />
			<span class="ml-3 nomob">Minecraft Text Editor</span>
		</div>
		<button
			class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer"
			onclick={importDialog.open}>Import</button>
		{#if doesContentExist}
			<button
				class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer"
				onclick={outputDialog.open}>Export</button>
			<button
				class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer"
				onclick={saveSnapshot}>Save{recentlySaved ? "d!" : ""}</button>
		{/if}
		<button
			class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer"
			onclick={loadDialog.open}>Load</button>
		<div class="flex-grow"></div>
		<a
			href="https://discord.datapackhub.net/"
			class="nomob flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer"
			>Discord</a>
		<a
			href="https://datapack.wiki/"
			class="nomob flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer"
			>Datapack Wiki</a>
	</div>

	<div class="w-full p-3 bg-zinc-900 flex items-center flex-wrap">
		{#if editor}
			<button
				onclick={() => {
					customDialog.open();
					customType = undefined;
				}}
				class="p-1 text-lg hover:bg-white/2 rounded-md font-medium"
				use:tippy={{ content: "Add Custom Source", placement: "bottom" }}>
				<IconCustom />
			</button>

			<div class="w-4"></div>

			<TextStyleButtons {editor} />

			<div class="w-4"></div>

			<button
				class="p-1 text-lg hover:bg-white/2 rounded-md font-medium"
				style="color: {color}"
				onclick={colorDialog.open}
				use:tippy={{ content: "Custom Color", placement: "bottom" }}
				><IconColor /></button>
			<button
				class="p-1 text-lg hover:bg-white/2 rounded-md font-medium"
				onclick={gradientDialog.open}
				use:tippy={{ content: "Color Gradient", placement: "bottom" }}
				><IconGradient /></button>
			{#each colorMap as color}
				<button
					aria-label="set color to {color.name}"
					onclick={() => editor.chain().focus().setColor(color.value).run()}
					use:tippy={{
						content: toTitleCase(color.name.replace("_", " ")),
						placement: "bottom",
					}}
					class="p-1 text-lg hover:bg-white/2 rounded-md {editor.isActive(
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
					use:tippy={{ content: "Unset color", placement: "bottom" }}
					class="p-1 text-lg hover:bg-white/2 text-zinc-500 rounded-md"
					class:active={editor.isActive("underline")}>
					<IconHollow />
				</button>
			{/if}

			<div class="w-4"></div>

			<button
				class="p-1 text-lg hover:bg-white/2 rounded-md font-medium {editor.isActive(
					'clickEvent',
				)
					? 'bg-zinc-800'
					: ''}"
				use:tippy={{
					content: "Click Event",
					placement: "bottom",
				}}
				onclick={() => {
					if (editor.isActive("clickEvent")) {
						editor.chain().focus().unsetClickEvent().run();
					} else {
						clickEventDialog.open();
					}
				}}>
				<IconClickEvent />
			</button>
			{#if editor.isActive("clickEvent")}
				<button
					class="p-1 text-lg hover:bg-white/2 rounded-md font-medium"
					use:tippy={{
						content: "Edit Click Event",
						placement: "bottom",
					}}
					onclick={clickEditButtonHandler}>
					<IconEdit />
				</button>
			{/if}

			<button
				onclick={() => {
					if (editor.isActive("hoverEvent")) {
						editor.chain().focus().unsetHoverEvent().run();
					} else {
						hoverEventDialog.open();
					}
				}}
				class="{editor.isActive('clickEvent') || editor.isActive('hoverEvent')
					? 'ml-2'
					: ''} p-1 text-lg hover:bg-white/2 rounded-md font-medium {editor.isActive(
					'hoverEvent',
				)
					? 'bg-zinc-800'
					: ''}"
				use:tippy={{
					content: "Hover Event",
					placement: "bottom",
				}}>
				<IconHoverEvent />
			</button>
			{#if editor.isActive("hoverEvent")}
				<button
					class="p-1 text-lg hover:bg-white/2 rounded-md font-medium"
					use:tippy={{
						content: "Edit Hover Event",
						placement: "bottom",
					}}
					onclick={hoverEditButtonHandler}>
					<IconEdit />
				</button>
			{/if}
		{/if}
	</div>

	<div
		class="font-minecraft bg-zinc-800 w-full first:focus:outline-none flex-grow"
		spellcheck="false"
		bind:this={element}>
	</div>

	<div>
		{#if dev}
			<code class="inline-block p-3 overflow-x-scroll"
				>DEV ONLY: {editor
					? JSON.stringify(editor.getJSON())
					: "Loading..."}</code>
			<br />
		{/if}
		<div class="flex items-start bg-zinc-950 p-3 space-x-3">
			{#if doesContentExist}
				<button
					class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
					onclick={() => {
						navigator.clipboard.writeText(translateToNBT(editor.getJSON(), "standard", outputVersion));
						recentlyCopied = true;
						setTimeout(() => (recentlyCopied = false), 2000);
					}}
					use:tippy={{ content: "Copy" }}>
					{#if recentlyCopied}
						<IconTick />
					{:else}
						<IconCopy />
					{/if}</button>
			{/if}
			<p>
				<code class="inline w-full overflow-auto max-h-56"
					>{editor ? translateToNBT(editor.getJSON(), "standard", outputVersion) : "Loading..."}
				</code>
				<button 
				class="bg-zinc-800 hover:bg-zinc-700 font-mono px-1 rounded-md ml-1 select-none"
				use:tippy={{content:"Click to toggle",placement:"top"}}
				onclick={() => {
					const ov = outputVersion;
					if (ov == "new") {outputVersion = "old"}
					else {outputVersion = "new"}
				}}>{outputVersion == "new" ? "1.21.5+" : "pre 1.21.5"}</button>
			</p>
		</div>
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
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="https://example.com"
			bind:value={clickEventValue} />
	{:else if clickEventType == "run_command"}
		<p class="mt-2">Command:</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="/give @s apple"
			bind:value={clickEventValue} />
		<p class="text-zinc-400">
			Note: the player must have permission to run the command!
		</p>
	{:else if clickEventType == "suggest_command"}
		<p class="mt-2">Command:</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="/give @s apple"
			bind:value={clickEventValue} />
		<p class="text-zinc-400">
			Note: the player must have permission to run the command!
		</p>
	{:else if clickEventType == "copy_to_clipboard"}
		<p class="mt-2">Text to copy:</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="I love the Wuppertal Suspension Railway"
			bind:value={clickEventValue} />
	{:else if clickEventType == "change_page"}
		<p class="mt-2">Page to go to:</p>
		<input
			type="number"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="32"
			bind:value={clickEventValue} />
	{:else if clickEventType == "open_dialog"}
		<p class="mt-2">Dialog ID:</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="namespace:example_dialog"
			bind:value={clickEventValue} />
	{/if}

	<div class="flex items-center space-x-2">
		{#if clickEventType}
			<button
				onclick={() => {
					clickEventDialog.close();
					editor
						.chain()
						.focus()
						.setClickEvent({ action: clickEventType, value: clickEventValue })
						.run();
				}}
				class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
				Add Click Event
			</button>
		{/if}
	</div>
</Modal>

<Modal title="Hover Event" bind:this={hoverEventDialog}>
	<p>Text to show</p>
	<MiniEditor bind:this={hoverEventEditor} bind:output={hoverEventValue} />
	<button
		onclick={() => {
			editor
				.chain()
				.focus()
				.setHoverEvent({ action: "show_text", value: hoverEventValue })
				.run();
			hoverEventDialog.close();
		}}
		class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
		Add Hover Event
	</button>
</Modal>

<Modal title="Add Custom Source" bind:this={customDialog}>
	<p>Select a source type to add</p>
	{#if !customType}
		<div class="grid grid-cols-3 gap-2">
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "translate";
				}}>
				<IconTranslate class="text-2xl" />
				<span>Translate Key</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "nbt";
				}}>
				<IconNBT class="text-2xl" />
				<span>NBT Value</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "score";
				}}>
				<IconScore class="text-2xl" />
				<span>Score Value</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "selector";
				}}>
				<IconSelector class="text-2xl" />
				<span>Selector</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "keybind";
				}}>
				<IconKeybind class="text-2xl" />
				<span>Keybind</span>
			</button>
		</div>
	{:else}
		<select bind:value={customType} class="bg-zinc-900 p-2 rounded-md">
			<option value="translate">Translate Key</option>
			<option value="score">Score Value</option>
			<option value="nbt">NBT Value</option>
			<option value="selector">Selector</option>
			<option value="keybind">Keybind</option>
		</select>
	{/if}

	{#if customType === "translate"}
		<p class="mt-2">Translate Key</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="item.minecraft.beef"
			bind:value={customValues.translate.key} />

		<p class="mt-2">Fallback</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="This text is shown if the key does not exist"
			bind:value={customValues.translate.fallback} />

		<p class="mt-2">Parameters</p>
		<div class="w-full flex flex-col space-y-1">
		{#each customValues.translate.params ?? [] as p, i}
			<div class="flex items-center space-x-1 w-full">
				<MiniEditor placeholder="Parameter #{i+1}" bind:output={p} />
			</div>
		{/each}
		</div>
		<div class="flex items-center space-x-1">
			<button
				onclick={() => {
					customValues.translate.params.push("");
					customValues.translate.params = customValues.translate.params;
				}}
				class="bg-zinc-900 p-1 px-2 text-sm rounded-md w-fit cursor-pointer hover:bg-black/50">
				Add Parameter
			</button>
			{#if customValues.translate.params.length != 0}
			<button
				onclick={() => {
					customValues.translate.params.pop();
					customValues.translate.params = customValues.translate.params;
				}}
				class="bg-zinc-900 p-1 px-2 text-sm rounded-md w-fit cursor-pointer hover:bg-black/50">
				Remove Last Parameter
			</button>
			{/if}
		</div>

		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertTranslate({
						key: customValues.translate.key,
						params: customValues.translate.params,
						fallback: customValues.translate.fallback,
					})
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Translate Key
		</button>
	{:else if customType === "score"}
		<p class="mt-2">Objective</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="money"
			bind:value={customValues.score.objective} />
		<p class="mt-2">Player, Fake Player, or Entity</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="@s"
			bind:value={customValues.score.name} />

		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertScore({
						name: customValues.score.name,
						objective: customValues.score.objective,
					})
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Score Value
		</button>
	{:else if customType === "nbt"}
		<p class="mt-2">NBT Source type</p>
		<select
			bind:value={customValues.nbt.sourceType}
			class="bg-zinc-900 p-2 rounded-md">
			<option value="storage">Storage</option>
			<option value="block">Block</option>
			<option value="entity">Entity</option>
		</select>
		{#if customValues.nbt.sourceType === "storage"}
			<p class="mt-2">Storage ID</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="example:storage"
				bind:value={customValues.nbt.storage} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="flex items-center space-x-2 mt-2">
				<button
					class="size-8 aspect-square bg-zinc-900 rounded-md flex flex-col items-center"
					onclick={() =>
						(customValues.nbt.interpret = !customValues.nbt.interpret)}>
					{#if customValues.nbt.interpret}
						<IconTick class="m-auto text-lg" />
					{/if}
				</button>
				<label for="interpret"
					>Interpret (parse nbt value as a text component)</label>
			</div>

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertStorageNBT({
							storage: customValues.nbt.storage,
							nbt: customValues.nbt.path,
							interpret: customValues.nbt.interpret,
						})
						.run();
				}}
				class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
				Add NBT Value
			</button>
		{:else if customValues.nbt.sourceType === "entity"}
			<p class="mt-2">Entity</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="@e[type=villager,limit=1,sort=nearest]"
				bind:value={customValues.nbt.entity} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="flex items-center space-x-2 mt-2">
				<button
					class="size-8 aspect-square bg-zinc-900 rounded-md flex flex-col items-center"
					onclick={() =>
						(customValues.nbt.interpret = !customValues.nbt.interpret)}>
					{#if customValues.nbt.interpret}
						<IconTick class="m-auto text-lg" />
					{/if}
				</button>
				<label for="interpret"
					>Interpret (parse nbt value as a text component)</label>
			</div>

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertEntityNBT({
							entity: customValues.nbt.entity,
							nbt: customValues.nbt.path,
							interpret: customValues.nbt.interpret,
						})
						.run();
				}}
				class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
				Add NBT Value
			</button>
		{:else if customValues.nbt.sourceType === "block"}
			<p class="mt-2">Entity</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="~ ~ ~"
				bind:value={customValues.nbt.block} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="flex items-center space-x-2 mt-2">
				<button
					class="size-8 aspect-square bg-zinc-900 rounded-md flex flex-col items-center"
					onclick={() =>
						(customValues.nbt.interpret = !customValues.nbt.interpret)}>
					{#if customValues.nbt.interpret}
						<IconTick class="m-auto text-lg" />
					{/if}
				</button>
				<label for="interpret"
					>Interpret (parse nbt value as a text component)</label>
			</div>

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertBlockNBT({
							block: customValues.nbt.block,
							nbt: customValues.nbt.path,
							interpret: customValues.nbt.interpret,
						})
						.run();
				}}
				class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
				Add NBT Value
			</button>
		{/if}
	{:else if customType === "keybind"}
		<p class="mt-2">Keybind</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="key.jump"
			bind:value={customValues.keybind.key} />
		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertKeybind({ key: customValues.keybind.key })
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Keybind
		</button>
	{:else if customType === "selector"}
		<p class="mt-2">Selector</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="@p[tag=something]"
			bind:value={customValues.selector.selector} />
		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertSelector({ selector: customValues.selector.selector })
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Selector
		</button>
	{/if}
</Modal>

<Modal title="Custom Color" bind:this={colorDialog} small nopad>
	<div class="flex flex-col w-full py-4">
		<ColorPicker
			bind:hex={color}
			position="responsive"
			--cp-bg-color="none"
			--cp-border-color="none"
			--cp-text-color="white"
			--cp-input-color="#18181b"
			--cp-button-hover-color="#18181b"
			isDialog={false}
			isAlpha={false} />

		<button
			onclick={customColorHandler}
			class="bg-zinc-900 p-2 rounded-md w-fit cursor-pointer hover:bg-black/50 mx-4">
			Done
		</button>
	</div>
</Modal>

<Modal title="Load a snapshot" bind:this={loadDialog}>
	<div class="flex flex-col space-y-2 w-full">
		{#if snapshots.length == 0}
			<p>You have not saved anything yet!</p>
		{/if}
		{#each snapshots as snapshot (snapshot)}
			<div class="flex flex-col space-y-0">
				<div class="bg-zinc-900 rounded-t-md rounded-br-md">
					<MiniRenderer value={snapshot} />
				</div>
				<div class="flex bg-zinc-950 rounded-b-md w-fit">
					<button
						class="hover:bg-white/2 py-2 px-3"
						onclick={() => {
							editor.commands.setContent(snapshot);
							editor.commands.focus();
						}}>Load</button>
					<button
						class="hover:bg-white/2 py-2 px-3"
						onclick={() => {
							snapshots = snapshots.filter(
								(_, index) => index !== snapshots.indexOf(snapshot),
							);
							localStorage.setItem("snapshots", JSON.stringify(snapshots));
						}}>Delete</button>
				</div>
			</div>
		{/each}
	</div>
</Modal>

<Modal title="More output formats" bind:this={outputDialog} big>
	<p>Select a Minecraft version:</p>
	<select bind:value={outputVersion} class="bg-zinc-900 p-2 rounded-md w-fit">
		<option value="new">1.21.5+</option>
		<option value="old">Before 1.21.5</option>
	</select>
	<div class="flex flex-col w-full mt-2">
		<p>For tellraw commands (send to chat):</p>
		<div class="flex items-start bg-zinc-950 p-3 space-x-3 rounded-lg">
			<button
				class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
				onclick={() => {
					navigator.clipboard.writeText(
						"/tellraw @s " + translateToNBT(editor.getJSON(), "standard", outputVersion),
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block w-full overflow-auto max-h-56"
				>/tellraw @s {editor ? translateToNBT(editor.getJSON(), "standard", outputVersion): "Loading..."}
			</code>
		</div>

		<p class="mt-2">As a lore component:</p>
		<div class="flex items-start bg-zinc-950 p-3 space-x-3 rounded-lg">
			<button
				class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
				onclick={() => {
					navigator.clipboard.writeText(
						`[lore=${translateToNBT(editor.getJSON(), "item_lore", outputVersion)}]`,
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			{#if outputVersion == "new"}
			<code class="inline-block w-full overflow-auto max-h-56"
				>[lore={editor
					? translateToNBT(editor.getJSON(), "item_lore", outputVersion)
					: "Loading..."}]
			</code>
			{:else}
			<code class="inline-block w-full overflow-auto max-h-56"
				>[lore={editor
					? (() => {
						try {
							const arr = JSON.parse(translateToNBT(editor.getJSON(), "item_lore", outputVersion));
							return `[${arr.map(obj => `'${JSON.stringify(obj)}'`).join(", ")}]`;
						} catch (e) {
							return "[]";
						}
					})()
					: "Loading..."}]
			</code>
			{/if}
		</div>

		<p class="mt-2">As JSON:</p>
		<div class="flex items-start bg-zinc-950 p-3 space-x-3 rounded-lg">
			<button
				class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
				onclick={() => {
					navigator.clipboard.writeText(translate(editor.getJSON(), "standard", outputVersion));
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block w-full overflow-auto max-h-56"
				>{editor ? translate(editor.getJSON(), "standard", outputVersion) : "Loading..."}
			</code>
		</div>
	</div>
</Modal>

<Modal title="Import from NBT" bind:this={importDialog} big>
	<div class="flex flex-col w-full space-y-2">
		<p>
			Paste your text components below to import them into the editor. This will
			clear the current contents of the editor!
		</p>
		<input
			class="flex items-start bg-zinc-950 p-3 rounded-lg mc"
			placeholder="Paste NBT text components here"
			bind:value={importText} />

		<button
			onclick={importToEditor}
			class="bg-zinc-900 p-2 rounded-md w-fit cursor-pointer hover:bg-black/50">
			Import
		</button>
	</div>
</Modal>

<Modal title="Color Gradient" bind:this={gradientDialog}>
	<div class="flex flex-col w-full space-y-2">
		<p>Add colours to the gradient below:</p>
		<div class="flex flex-col space-y-1">
			{#each gradientSteps ?? [] as step, i}
				<div class="bg-zinc-900 w-full rounded-md p-2 flex items-center">
					<div class="flex-grow">
						<ColorPicker
							bind:hex={step}
							position="responsive"
							--cp-bg-color="#18181b"
							--cp-text-color="white"
							--cp-input-color="#0C0C0E"
							--cp-button-hover-color="#18181b"
							textInputModes={["hex"]}
							isAlpha={false} />
					</div>
					<button
						onclick={() => {
							gradientSteps.splice(i, 1);
							gradientSteps = gradientSteps;
						}}
						class="bg-zinc-900 p-2 rounded-md w-fit cursor-pointer hover:bg-black/20 h-9 aspect-square flex items-center justify-center">
						<IconDelete />
					</button>
				</div>
			{/each}
			<button
				onclick={() => {
					gradientSteps.push("#ffffff");
					gradientSteps = gradientSteps;
				}}
				class="bg-zinc-900 p-2 rounded-md cursor-pointer hover:bg-black/50 aspect-square h-9 w-9">
				<IconCustom class="m-auto" />
			</button>
		</div>
		<button
			onclick={() => {
				applyGradient(editor, gradientSteps);
				gradientDialog.close();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit cursor-pointer hover:bg-black/50">
			Apply Gradient
		</button>
	</div>
</Modal>
