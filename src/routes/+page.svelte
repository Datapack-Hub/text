<script lang="ts">
	import { dev } from "$app/environment";
	import {
		addTypeSpecificValues,
		colorMap,
		defaultColorLUT,
		optimise,
		trueMarkOrUndefined,
		type MinecraftText,
		type StringyMCText,
	} from "$lib/tiptap/text";

	import {
		BlockNBTNode,
		ClickEventMark,
		EntityNBTNode,
		FixedTextStyle,
		HoverEventMark,
		KeybindNode,
		Obfuscation,
		ScoreNode,
		SelectorNode,
		ShadowColorMark,
		StorageNBTNode,
		TranslateNode,
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
	import IconKeybinds from "~icons/tabler/keyboard";

	import ClickEventModal from "$lib/components/modals/ClickEventModal.svelte";
	import ColorGradientModal from "$lib/components/modals/ColorGradientModal.svelte";
	import CustomSourceModal from "$lib/components/modals/CustomSourceModal.svelte";
	import ExportModal from "$lib/components/modals/ExportModal.svelte";
	import TextStyleButtons from "$lib/components/TextStyleButtons.svelte";
	import Key from "$lib/components/Key.svelte";
	import KeybindModal from "$lib/components/modals/KeybindModal.svelte";

	// TODO: convert to non-legacy mode
	export let value = "";

	let element: HTMLElement;
	let editor: Editor;
	let color = "#ffffff";
	let colorDialog: Modal;

	let outputDialog: Modal;
	let outputVersion: "new" | "old";

	let doesContentExist: boolean = false;

	let indent = false;
	let indentSize = 2;

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

	let keybindDialog: Modal;

	let clickEventType = "";
	let clickEventValue = "";
	let clickEventDialog: Modal;

	let hoverEventType = "";
	let hoverEventValue: any;
	let hoverEventEditor: MiniEditor;
	let hoverEventDialog: Modal;

	let customType: string | undefined;
	let customDialog: Modal;

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
				editor.getText() === ""
					? (doesContentExist = false)
					: (doesContentExist = true);
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
		exportVersion: "new" | "old" = "new",
	): string {
		if (exportVersion == "new") {
			// nbt doesnt need indenting
			return translate(jsonContent, exportType, false, indentSize).replace(
				/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g,
				(match) => match.replace(/"/g, ""),
			);
		} else {
			return translate(
				jsonContent,
				exportType,
				false,
				indentSize,
				"old",
			).replace(/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, (match) =>
				match.replace(/"/g, ""),
			);
		}
	}

	function translate(
		json: JSONContent,
		exportType: string = "standard",
		indent: boolean,
		indentSize: number,
		exportVersion: "new" | "old" = "new",
	): string {
		const paragraphs = json.content!;

		if (exportType == "standard") {
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

					const shadowColorMark = c.marks?.find(
						(m) => m.type === "shadowColor",
					);
					if (shadowColorMark) {
						current.shadow_color = parseInt(
							shadowColorMark.attrs?.shadowColor.replace(/^#/, ""),
							16,
						);
					}

					current = addTypeSpecificValues(current, c, true, exportVersion);

					data.push(current);
				});

				if (i < paragraphs.length - 1) {
					data.push("\n");
				}
			});

			if (data.length === 1 && data[0] === "") {
				if (Math.random() < 0.002) {
					return "🤓 <- james is waiting for you to type something";
				}
				return "waiting for input...";
			}

			if (data.length == 2) {
				return indent
					? JSON.stringify(data[1], null, indentSize)
					: JSON.stringify(data[1]);
			}

			data = optimise(data);

			return indent
				? JSON.stringify(data[1], null, indentSize)
				: JSON.stringify(data[1]);
		} else if (exportType == "item_lore") {
			let data: (StringyMCText[] | StringyMCText)[] = [];

			paragraphs.forEach((p) => {
				const content = p.content || [];
				let currentLine: StringyMCText[] = [];
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

			if (Array.isArray(data)) {
				data = data.map((d) => {
					if (Array.isArray(d)) {
						return optimise(d);
					} else {
						return d;
					}
				});
			}

			return indent
				? JSON.stringify(data, null, indentSize)
				: JSON.stringify(data);
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

	function clearMarksHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.shiftKey && event.key === "X") {
			editor.commands.unsetAllMarks();
		}
	}
</script>

<svelte:window onkeydown={clearMarksHandler} />

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
		<button
			class="bg-zinc-800 hover:bg-zinc-700 font-mono px-1 rounded-md ml-3 select-none"
			use:tippy={{ content: "Click to toggle", placement: "top" }}
			onclick={() => {
				const ov = outputVersion;
				if (ov == "new") {
					outputVersion = "old";
				} else {
					outputVersion = "new";
				}
			}}>{outputVersion == "new" ? "1.21.5+" : "pre 1.21.5"}</button>
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

			<div class="flex-grow"></div>
			<button
				onclick={keybindDialog.open}
				use:tippy={{
					content: "Keybinds",
					placement: "bottom",
				}}
				aria-label="Keybinds"><IconKeybinds /></button>
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
						navigator.clipboard.writeText(
							translateToNBT(editor.getJSON(), "standard", outputVersion),
						);
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
					>{editor
						? translateToNBT(editor.getJSON(), "standard", outputVersion)
						: "Loading..."}
				</code>
				<button
					class="bg-zinc-800 hover:bg-zinc-700 font-mono px-1 rounded-md ml-1 select-none"
					use:tippy={{ content: "Click to toggle", placement: "top" }}
					onclick={() => {
						const ov = outputVersion;
						if (ov == "new") {
							outputVersion = "old";
						} else {
							outputVersion = "new";
						}
					}}>{outputVersion == "new" ? "1.21.5+" : "pre 1.21.5"}</button>
			</p>
		</div>
	</div>
</div>

<ClickEventModal
	bind:clickEventDialog
	bind:clickEventType
	bind:clickEventValue
	{editor} />

<Modal title="Hover Event" bind:this={hoverEventDialog} key="H">
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

<CustomSourceModal bind:customDialog bind:customType {editor} {outputVersion} />

<Modal title="Custom Color" bind:this={colorDialog} small nopad key="C">
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

<Modal title="Load a snapshot" bind:this={loadDialog} key="L">
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

<ExportModal
	bind:outputDialog
	bind:outputVersion
	{editor}
	{indent}
	{indentSize}
	{recentlyCopied}
	{translateToNBT}
	{translate} />

<Modal title="Import from NBT" bind:this={importDialog} big key="I">
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

<KeybindModal bind:keybindDialog />

<ColorGradientModal {editor} bind:gradientSteps bind:gradientDialog />
