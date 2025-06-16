<script lang="ts">
	import { convert, translate } from "$lib/text/nbt_or_json";

	import {
		BlockNBTNode,
		ClickEventMark,
		EntityNBTNode,
		FixedTextStyle,
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
	// Components
	import MiniEditor from "$lib/components/MiniEditor.svelte";
	import MiniRenderer from "$lib/components/MiniRenderer.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import ColorPicker from "svelte-awesome-color-picker";

	import tippy from "tippy.js";
	import "tippy.js/dist/tippy.css";
	// optional

	import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt";
	import { Editor } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import Placeholder from "@tiptap/extension-placeholder";
	import Underline from "@tiptap/extension-underline";
	import StarterKit from "@tiptap/starter-kit";
	import { onDestroy, onMount } from "svelte";
	// Icons
	import IconUndo from "~icons/tabler/arrow-back-up";
	import IconRedo from "~icons/tabler/arrow-forward-up";
	import IconTick from "~icons/tabler/check";
	import IconGradient from "~icons/tabler/contrast-2";
	import IconCopy from "~icons/tabler/copy";
	import IconFont from "~icons/tabler/function";
	import IconUploadFont from "~icons/tabler/function-filled";
	import IconNoFont from "~icons/tabler/function-off";
	import IconClickEvent from "~icons/tabler/hand-finger";
	import IconKeybinds from "~icons/tabler/keyboard";
	import IconColor from "~icons/tabler/palette";
	import IconEdit from "~icons/tabler/pencil";
	import IconCustom from "~icons/tabler/plus";
	import IconHoverEvent from "~icons/tabler/pointer";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square-x";

	import { page } from "$app/stores";
	import ClickEventModal from "$lib/components/modals/ClickEventModal.svelte";
	import ColorGradientModal from "$lib/components/modals/ColorGradientModal.svelte";
	import CustomSourceModal from "$lib/components/modals/CustomSourceModal.svelte";
	import ExportModal from "$lib/components/modals/ExportModal.svelte";
	import FontUploadModal from "$lib/components/modals/FontUploadModal.svelte";
	import KeybindModal from "$lib/components/modals/KeybindModal.svelte";
	import TextStyleButtons from "$lib/components/TextStyleButtons.svelte";
	import { fontLUT } from "$lib/tiptap/extensions/fonts";
	import { colorMap } from "$lib/text/general";

	let value: string = $state("");

	let element: HTMLElement | undefined = $state();
	let editor: Editor | undefined = $state();
	let color = $state("#ffffff");
	let colorDialog: Modal | undefined = $state();

	let outputDialog: Modal | undefined = $state();
	let outputVersion: "new" | "old" = $state("new");

	let doesContentExist: boolean = $state(false);
	let shouldOptimise = $state(true);

	let indent = false;
	let indentSize = 2;

	// Import
	let importDialog: Modal | undefined = $state();
	let importText: string = $state("");

	let recentlyCopied = $state(false);

	// Snapshots and stuff
	let snapshots: object[] = $state([]);
	let recentlySaved = $state(false);
	let loadDialog: Modal | undefined = $state();

	// Dialogs
	let gradientDialog: Modal | undefined = $state();
	let gradientSteps: string[] = $state(["#ffffff"]);

	let keybindDialog: Modal | undefined = $state();

	let clickEventType = $state("");
	let clickEventValue = $state("");
	let clickEventDialog: Modal | undefined = $state();

	let hoverEventType = "";
	let hoverEventValue: any = $state();
	let hoverEventEditor: MiniEditor | undefined = $state();
	let hoverEventDialog: Modal | undefined = $state();

	let fontDialog: Modal | undefined = $state();
	let fontUploadModal: Modal | undefined = $state();
	let fontName = $state("");

	let customType: string | undefined = $state();
	let customDialog: Modal | undefined = $state();

	function importToEditor() {
		const jsonContent = snbtToDocument(convertToTextOrEmpty(importText));
		editor?.commands.setContent(jsonContent);
		importDialog?.close();
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
				FontsExtension,
				Placeholder.configure({
					placeholder:
						"Write text here, style it with the options above, and the output text components will appear at the bottom!",
				}),
			],
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
				editor!.getText() === ""
					? (doesContentExist = false)
					: (doesContentExist = true);
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

	function customColorHandler() {
		editor?.chain().focus().setColor(color).run();
		colorDialog?.close();
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
		localStorage.setItem("content", JSON.stringify(editor!.getJSON()));
	}

	function saveSnapshot() {
		const snapshotsTemp = localStorage.getItem("snapshots");
		if (snapshotsTemp) {
			snapshots = JSON.parse(snapshotsTemp);
			snapshots.push(editor!.getJSON());
			localStorage.setItem("snapshots", JSON.stringify(snapshots));
		} else {
			localStorage.setItem("snapshots", JSON.stringify([editor!.getJSON()]));
			snapshots = [editor!.getJSON()];
		}
		recentlySaved = true;
		setTimeout(() => {
			recentlySaved = false;
		}, 4000);
	}

	function hoverEditButtonHandler() {
		const { from, to } = editor!.state.selection;
		let start = from,
			end = to;
		const doc = editor!.state.doc;

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

		editor!.chain().focus().setTextSelection({ from: start, to: end }).run();
		const { action, value } = mark.attrs;
		hoverEventType = action;
		hoverEventDialog!.open();
		if (hoverEventEditor) {
			hoverEventEditor.importText(JSON.stringify(value));
		}
	}

	function clickEditButtonHandler() {
		// cobble if you want to move this elsewhere then please do
		// what the heck -cbble_
		const { from, to } = editor!.state.selection;
		let start = from,
			end = to;
		const doc = editor!.state.doc;

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

		editor!.chain().focus().setTextSelection({ from: start, to: end }).run();
		const { action, value } = mark.attrs;
		clickEventType = action;
		clickEventValue = value;
		clickEventDialog!.open();
	}

	function clearMarksHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.shiftKey && event.key === "X") {
			editor!.commands.unsetAllMarks();
		}
	}

	function getTextComponentCount() {
		const components = JSON.parse(
			translate(editor!.getJSON(), {
				exportType: "standard",
				indent: false,
				exportVersion: outputVersion,
				optimise: shouldOptimise,
			}),
		);
		if (Array.isArray(components)) {
			return components.length;
		}
		return 1;
	}
</script>

<svelte:window onkeydown={clearMarksHandler} />

<div class="flex h-screen max-h-screen flex-col">
	<div
		class="flex w-full items-center bg-zinc-950 text-zinc-300"
		style="font-family: Lexend">
		<div class="flex items-center px-3 py-2 hover:bg-white/3">
			<img src="/dph.svg" class="h-5" alt="logo" />
			<span class="nomob ml-3">Minecraft Text Editor</span>
		</div>
		<button
			class="flex items-center px-3 py-2 hover:bg-white/3"
			onclick={importDialog?.open}>Import</button>
		{#if doesContentExist}
			<button
				class="flex items-center px-3 py-2 hover:bg-white/3"
				onclick={outputDialog?.open}>Export</button>
			<button
				class="flex items-center px-3 py-2 hover:bg-white/3"
				onclick={saveSnapshot}>Save{recentlySaved ? "d!" : ""}</button>
		{/if}
		<button
			class="flex items-center px-3 py-2 hover:bg-white/3"
			onclick={loadDialog?.open}>Load</button>
		<div class="flex-grow"></div>
		<a
			href="https://discord.datapackhub.net/"
			class="nomob flex items-center px-3 py-2 hover:bg-white/3">Discord</a>
		<a
			href="https://datapack.wiki/"
			class="nomob flex items-center px-3 py-2 hover:bg-white/3"
			>Datapack Wiki</a>
	</div>

	<div class="flex w-full flex-wrap items-center bg-zinc-900 p-3">
		{#if editor}
			<button
				onclick={() => {
					customDialog?.open();
					customType = undefined;
				}}
				class="toolbar-btn"
				use:tippy={{ content: "Add Custom Source", placement: "bottom" }}>
				<IconCustom />
			</button>

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<TextStyleButtons {editor} />

			<button
				aria-label="set font"
				onclick={() => fontDialog?.open()}
				class="rounded-md p-1 text-lg font-medium hover:bg-white/3 {editor.getAttributes(
					'textStyle',
				).font
					? 'bg-zinc-800'
					: ''}"
				use:tippy={{ content: "Set Font", placement: "bottom" }}>
				<IconFont />
			</button>
			{#if editor.getAttributes("textStyle").font}
				<button
					aria-label="unset font"
					onclick={() => editor?.chain().focus().unsetFont().run()}
					class="rounded-md p-1 text-lg font-medium hover:bg-white/3 {editor.isActive(
						'textStyle',
					)
						? 'bg-zinc-800'
						: ''}"
					use:tippy={{ content: "Unset Font", placement: "bottom" }}>
					<IconNoFont />
				</button>
			{/if}
			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<button
				class="toolbar-btn"
				style="color: {color}"
				onclick={colorDialog?.open}
				use:tippy={{ content: "Custom Color", placement: "bottom" }}
				><IconColor /></button>
			<button
				class="toolbar-btn"
				onclick={gradientDialog?.open}
				use:tippy={{ content: "Color Gradient", placement: "bottom" }}
				><IconGradient /></button>
			{#each colorMap as color}
				<button
					aria-label="set color to {color.name}"
					onclick={() => editor?.chain().focus().setColor(color.value).run()}
					use:tippy={{
						content: toTitleCase(color.name.replace("_", " ")),
						placement: "bottom",
					}}
					class="rounded-md p-1 text-lg hover:bg-white/3 {editor.isActive(
						'textStyle',
						{ color: color.value },
					)
						? 'bg-zinc-800'
						: ''}"
					style="color: {color.value};">
					<IconSquare />
				</button>
			{/each}
			{#if editor.getAttributes("textStyle").color}
				<button
					onclick={() => editor?.chain().focus().unsetColor().run()}
					use:tippy={{ content: "Unset color", placement: "bottom" }}
					class="rounded-md p-1 text-lg text-zinc-500 hover:bg-white/3"
					class:active={editor.isActive("underline")}>
					<IconHollow />
				</button>
			{/if}

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<button
				class="toolbar-btn {editor.isActive('clickEvent') ? 'bg-zinc-800' : ''}"
				use:tippy={{
					content: "Click Event",
					placement: "bottom",
				}}
				onclick={() => {
					if (editor?.isActive("clickEvent")) {
						editor?.chain().focus().unsetClickEvent().run();
					} else {
						clickEventDialog?.open();
					}
				}}>
				<IconClickEvent />
			</button>
			{#if editor.isActive("clickEvent")}
				<button
					class="toolbar-btn"
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
					if (editor?.isActive("hoverEvent")) {
						editor?.chain().focus().unsetHoverEvent().run();
					} else {
						hoverEventDialog?.open();
					}
				}}
				class="{editor.isActive('clickEvent') || editor.isActive('hoverEvent')
					? 'ml-2'
					: ''} toolbar-btn {editor.isActive('hoverEvent')
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
					class="toolbar-btn"
					use:tippy={{
						content: "Edit Hover Event",
						placement: "bottom",
					}}
					onclick={hoverEditButtonHandler}>
					<IconEdit />
				</button>
			{/if}

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<button
				class="toolbar-btn"
				onclick={() => editor?.chain().undo().run()}
				use:tippy={{
					content: "Undo",
					placement: "bottom",
				}}
				aria-label="Undo"><IconUndo /></button>
			<button
				class="toolbar-btn"
				onclick={() => editor?.chain().undo().run()}
				use:tippy={{
					content: "Redo",
					placement: "bottom",
				}}
				aria-label="Redo"><IconRedo /></button>

			<div class="flex-grow"></div>

			<button
				class="toolbar-btn nomob"
				onclick={fontUploadModal?.open}
				use:tippy={{
					content: "Upload Font",
					placement: "bottom",
				}}
				aria-label="Keybinds"><IconUploadFont /></button>
			<button
				class="toolbar-btn nomob"
				onclick={keybindDialog?.open}
				use:tippy={{
					content: "Keybinds",
					placement: "bottom",
				}}
				aria-label="Keybinds"><IconKeybinds /></button>
		{/if}
	</div>

	<div
		class="font-minecraft w-full flex-grow overflow-auto bg-zinc-800 first:focus:outline-none"
		spellcheck="false"
		bind:this={element}>
	</div>

	<div>
		{#if $page.url.searchParams.has("dev")}
			<code class="inline-block overflow-x-scroll p-3"
				>DEV ONLY: {editor
					? JSON.stringify(editor.getJSON())
					: "Loading..."}</code>
			<br />
		{/if}
		<div class="bg-zinc-950 p-3">
			<div
				class="flex max-h-48 max-w-screen items-start space-x-2 overflow-auto">
				<button
					class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
					onclick={() => {
						navigator.clipboard.writeText(
							convert(
								editor!.getJSON(),
								"standard",
								outputVersion,
								shouldOptimise,
							),
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
				<p>
					<code class="inline break-all"
						>{editor
							? convert(
									editor.getJSON(),
									"standard",
									outputVersion,
									shouldOptimise,
								)
							: "Loading..."}
					</code>
				</p>
			</div>
			{#if doesContentExist}
				<div class="mt-2 flex items-center space-x-2 select-none">
					<p class="font-lexend nomob text-xs text-white/60">
						{editor
							? convert(
									editor.getJSON(),
									"standard",
									outputVersion,
									shouldOptimise,
								).length
							: 0} characters
					</p>
					<p class="font-lexend nomob text-xs text-white/60">
						{getTextComponentCount()} components
					</p>
					<p class="font-lexend nomob text-xs text-white/60">•</p>
					<p class="font-lexend text-xs text-white/60">
						Click to change output settings:
					</p>
					<button
						class="ml-1 rounded-md bg-zinc-800 px-1 font-mono select-none hover:bg-zinc-700"
						use:tippy={{
							content:
								"Click to toggle the output version. 1.21.5 drastically changed the format of text components, so make sure you select the correct version.",
							placement: "top",
						}}
						onclick={() => {
							const ov = outputVersion;
							if (ov == "new") {
								outputVersion = "old";
							} else {
								outputVersion = "new";
							}
						}}>{outputVersion == "new" ? "1.21.5+" : "pre 1.21.5"}</button>
					<button
						class="ml-1 rounded-md bg-zinc-800 px-1 font-mono select-none hover:bg-zinc-700"
						use:tippy={{
							content:
								"Click to toggle whether the output should be optimised (shortest possible output), or expanded (easier to edit manually).",
							placement: "top",
						}}
						onclick={() => (shouldOptimise = !shouldOptimise)}
						>{shouldOptimise ? "optimised" : "expanded"}</button>
				</div>
			{/if}
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
				?.chain()
				.focus()
				.setHoverEvent({ action: "show_text", value: hoverEventValue })
				.run();
			hoverEventDialog?.close();
		}}
		class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
		Add Hover Event
	</button>
</Modal>

<CustomSourceModal bind:customDialog bind:customType {editor} {outputVersion} />

<Modal title="Custom Color" bind:this={colorDialog} small nopad key="C">
	<div class="flex w-full flex-col py-4">
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
			class="mx-4 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Done
		</button>
	</div>
</Modal>

<Modal title="Load a snapshot" bind:this={loadDialog} key="L">
	<div class="flex w-full flex-col space-y-2">
		{#if snapshots.length == 0}
			<p>You have not saved anything yet!</p>
		{/if}
		{#each snapshots as snapshot (snapshot)}
			<div class="flex flex-col space-y-0">
				<div class="rounded-t-md rounded-br-md bg-zinc-900">
					<MiniRenderer value={snapshot} />
				</div>
				<div class="flex w-fit rounded-b-md bg-zinc-950">
					<button
						class="px-3 py-2 hover:bg-white/3"
						onclick={() => {
							editor?.commands.setContent(snapshot);
							editor?.commands.focus();
						}}>Load</button>
					<button
						class="px-3 py-2 hover:bg-white/3"
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
	{recentlyCopied} />

<Modal title="Import from NBT" bind:this={importDialog} key="I">
	<div class="flex w-full flex-col space-y-2">
		<p>
			Paste your text components below to import them into the editor. This will
			clear the current contents of the editor!
		</p>
		<textarea
			class="font-minecraft flex h-32 items-start rounded-lg bg-zinc-950 p-3"
			placeholder="Paste NBT text components here"
			bind:value={importText}></textarea>

		<button
			onclick={importToEditor}
			class="w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Import
		</button>
	</div>
</Modal>

<Modal title="Set font" bind:this={fontDialog} key="F">
	<div class="flex w-full flex-col space-y-2">
		<p>Press to apply a font or type below to use a custom font</p>
		<div class="grid grid-cols-2 gap-2">
			<button
				onclick={() => {
					editor?.chain().focus().unsetFont().run();
					fontDialog?.close();
				}}
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50">
				Default <span class="font-mono text-white/60">(unsets fonts)</span>
			</button>
			<button
				onclick={() => {
					editor?.chain().focus().setFont("minecraft:illageralt").run();
					fontDialog?.close();
				}}
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50">
				Illager Alt <span class="font-mono text-white/60"
					>(minecraft:illageralt)</span>
			</button>
			<button
				onclick={() => {
					editor?.chain().focus().setFont("minecraft:alt").run();
					fontDialog?.close();
				}}
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50">
				Enchant Table <span class="font-mono text-white/60"
					>(minecraft:alt)</span>
			</button>
			{#each fontLUT as [identifier, alias]}
				<button
					onclick={() => {
						editor?.chain().focus().setFont(alias).run();
						fontDialog?.close();
					}}
					class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50">
					Custom Font <span class="font-mono text-white/60"
						>({identifier})</span>
				</button>
			{/each}
		</div>
		<input
			type="text"
			class="font-minecraft flex items-start rounded-lg bg-zinc-950 p-3"
			placeholder="Put your font and identifier"
			bind:value={fontName} />

		<button
			onclick={() => {
				editor?.chain().focus().setFont(fontName).run();
				fontDialog?.close();
			}}
			class="w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Set Font
		</button>
	</div>
</Modal>

<KeybindModal bind:keybindDialog />
<FontUploadModal bind:fontUploadModal />

<ColorGradientModal {editor} bind:gradientSteps bind:gradientDialog />
