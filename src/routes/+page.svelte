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
	import { Editor, type JSONContent } from "@tiptap/core";
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
	import IconClickEvent from "~icons/tabler/hand-finger";
	import IconKeybinds from "~icons/tabler/keyboard";
	import IconColor from "~icons/tabler/palette";
	import IconEdit from "~icons/tabler/pencil";
	import IconCustom from "~icons/tabler/plus";
	import IconHoverEvent from "~icons/tabler/pointer";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square-x";
	import IconEmoji from "~icons/tabler/mood-smile-beam";

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

	import UnicodeSelectorModal from "$lib/components/modals/UnicodeSelectorModal.svelte";
	import ToolbarButton from "$lib/components/ToolbarButton.svelte";

	let tiptapJSON: JSONContent = $state()!;

	let element: HTMLElement = $state()!;
	let editor: Editor | undefined = $state()!;
	let color = $state("#ffffff");
	let colorDialog: Modal = $state()!;

	let outputDialog: Modal = $state()!;
	let outputVersion: "new" | "old" = $state("new");

	let doesContentExist: boolean = $state(false);
	let shouldOptimise = $state(true);

	let indent = $state(false);
	let indentSize = $state(2);

	// Import
	let importDialog: Modal = $state()!;
	let importText: string = $state("");

	let recentlyCopied = $state(false);

	// Snapshots and stuff
	let snapshots: object[] = $state([]);
	let recentlySaved = $state(false);
	let loadDialog: Modal = $state()!;

	// Dialogs
	let gradientDialog: Modal = $state()!;
	let gradientSteps: string[] = $state(["#ffffff"]);

	let keybindDialog: Modal = $state()!;

	let clickEventType = $state("");
	let clickEventValue = $state("");
	let clickEventDialog: Modal = $state()!;

	let hoverEventType = "";
	let hoverEventValue: any = $state();
	let hoverEventEditor: MiniEditor = $state()!;
	let hoverEventDialog: Modal = $state()!;

	let fontDialog: Modal = $state()!;
	let fontUploadModal: Modal = $state()!;
	let fontName = $state("");

	let customType: string | undefined = $state();
	let customDialog: Modal = $state()!;

	let unicodeSelectorDialog: Modal = $state()!;

	function importToEditor() {
		const jsonContent = snbtToDocument(convertToTextOrEmpty(importText));
		editor?.commands.setContent(jsonContent);
		tiptapJSON = jsonContent;
		importDialog?.close();
	}

	onMount(() => {
		if (localStorage.getItem("content")) {
			tiptapJSON = JSON.parse(localStorage.getItem("content")!);
		} else {
			tiptapJSON = [];
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
			content: tiptapJSON,
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
			onTransaction: ({ editor: newEditor }) => {
				editor = undefined;
				editor = newEditor;
				editor!.getText() === ""
					? (doesContentExist = false)
					: (doesContentExist = true);
			},
			onUpdate: ({ editor }) => {
				tiptapJSON = editor.getJSON();
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
			<TextStyleButtons {editor} />

			<ToolbarButton
				ariaLabel="set font"
				Icon={IconFont}
				onClick={() =>
					editor!.getAttributes("textStyle").font
						? editor!.chain().focus().unsetFont().run()
						: fontDialog.open()}
				styleVar={editor.getAttributes("textStyle").font}
				tipContent="Font" />

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<ToolbarButton
				ariaLabel="open custom color picker"
				{color}
				Icon={IconColor}
				onClick={colorDialog.open}
				tipContent="Custom Color" />

			<ToolbarButton
				ariaLabel="open gradient modal"
				Icon={IconGradient}
				onClick={gradientDialog.open}
				tipContent="Color Gradient" />
			{#each colorMap as color}
				<ToolbarButton
					ariaLabel="set color to {color.name}"
					Icon={IconSquare}
					onClick={() => editor!.chain().focus().setColor(color.value).run()}
					styleVar={editor.isActive("textStyle", { color: color.value })}
					color={color.value}
					tipContent={toTitleCase(color.name.replace("_", " "))} />
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
				onclick={() => {
					customDialog?.open();
					customType = undefined;
				}}
				class="toolbar-btn"
				use:tippy={{ content: "Add Custom Source", placement: "bottom" }}>
				<IconCustom />
			</button>

			<ToolbarButton
				ariaLabel="open special character selector"
				Icon={IconEmoji}
				onClick={unicodeSelectorDialog.open}
				tipContent="Special Characters" />

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<ToolbarButton
				onClick={() => {
					if (editor?.isActive("clickEvent")) {
						editor?.chain().focus().unsetClickEvent().run();
					} else {
						clickEventDialog?.open();
					}
				}}
				tipContent="Click Event"
				styleVar={editor.isActive("clickEvent")}
				ariaLabel="Add click event"
				Icon={IconClickEvent} />
			{#if editor.isActive("clickEvent")}
				<ToolbarButton
					onClick={clickEditButtonHandler}
					tipContent="Edit Click Event"
					ariaLabel="Edit click event"
					Icon={IconEdit} />
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
				<ToolbarButton
					onClick={hoverEditButtonHandler}
					tipContent="Edit Hover Event"
					ariaLabel="Edit hover event"
					Icon={IconEdit} />
			{/if}

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<ToolbarButton
				onClick={() => editor?.chain().undo().run()}
				tipContent="Undo"
				ariaLabel="Undo"
				Icon={IconUndo} />
			<ToolbarButton
				onClick={() => editor?.chain().redo().run()}
				tipContent="Redo"
				ariaLabel="Redo"
				Icon={IconRedo} />

			<div class="flex-grow"></div>

			<button
				class="toolbar-btn nomob"
				onclick={fontUploadModal?.open}
				use:tippy={{
					content: "Upload Font",
					placement: "bottom",
				}}
				aria-label="Upload Font"><IconUploadFont /></button>
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
							? convert(tiptapJSON!, "standard", outputVersion, shouldOptimise)
							: "Loading..."}
					</code>
				</p>
			</div>
			{#if doesContentExist}
				<div class="mt-2 flex items-center space-x-2 select-none">
					<p class="font-lexend nomob text-xs text-white/60">
						{editor
							? convert(tiptapJSON!, "standard", outputVersion, shouldOptimise)
									.length
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

<noscript>
	<div class="absolute">
		<div
			class="fixed top-0 left-0 flex h-screen w-screen flex-col items-center overflow-auto bg-black/65 text-zinc-100"
			style="font-family: Lexend">
			<div
				class="z-50 w-[95%] md:w-[70%] 2xl:w-[50%] m-auto py-4">
				<div class="flex items-center rounded-t-lg bg-zinc-900 p-4 space-x-2">
					<img src="/dph.svg" class="h-5" alt="logo" />
					<span class="flex-grow text-lg font-bold">Datapack Hub Text Editor</span>
				</div>
				<div class="rounded-b-lg flex flex-col space-y-2 bg-zinc-800 p-4">
					<p>This is a /tellraw editor and editor for Minecraft text components, for all versions. Create /tellraw commands and text components (JSON text) for Minecraft Java Edition with our easy-to-use, modern online tool!</p>
					<div class="bg-red-500/50 p-3 rounded-md flex flex-col">
						<b class="text-lg">⚠️ This website requires JavaScript to work.</b> 
						<span class="text-sm">Please enable JavaScript in your site settings. If JavaScript is enabled, please refresh. If that doesn't work, then try a different browser. If that still doesn't work, then ask for help in <a href="https://discord.datapackhub.net/" class="font-bold underline">our Discord</a></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</noscript>

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
			--cp-bg-color="transparent"
			--cp-border-color="transparent"
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
		<p>Select one of the default Minecraft fonts below:</p>
		<div class="flex flex-col space-y-1">
			<button
				onclick={() => {
					editor?.chain().focus().unsetFont().run();
					fontDialog?.close();
				}}
				class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				<IconFont />
				<span>Default</span>
			</button>
			<button
				onclick={() => {
					editor?.chain().focus().setFont("minecraft:illageralt").run();
					fontDialog?.close();
				}}
				class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				<IconFont />
				<span>Illager Alt</span>
				<span class="font-mono text-white/60">(minecraft:illageralt)</span>
			</button>
			<button
				onclick={() => {
					editor?.chain().focus().setFont("minecraft:alt").run();
					fontDialog?.close();
				}}
				class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				<IconFont />
				<span>Standard Galactic Alphabet (enchant table)</span>
				<span class="font-mono text-white/60">(minecraft:alt)</span>
			</button>
		</div>

		<p class="my-2">
			To use a custom font in the editor, upload or select one below.
		</p>
		<div class="flex flex-col space-y-1">
			{#key fontLUT}
				{#each fontLUT as [identifier, alias]}
					<button
						onclick={() => {
							editor?.chain().focus().setFont(alias).run();
							fontDialog?.close();
						}}
						class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
						<IconUploadFont />
						<span class="font-mono text-white">{identifier}</span>
					</button>
				{/each}
			{/key}
			<button
				onclick={() => {
					fontDialog!.close();
					fontUploadModal!.open();
				}}
				class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				<IconCustom />
				<span>Upload a custom font...</span>
				<span class="font-mono text-white/60">(.ttf, .otf, .woff2)</span>
			</button>
		</div>

		<p class="my-2">
			Or, if you want to use a custom font without importing it, enter the ID:
		</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="namespace:id"
			bind:value={fontName} />
		<p class="text-sm text-white/60">
			<b>Note:</b> in order for a custom font to show up ingame, you will need to
			add it with a resource pack. Also, if you don't import a font into the editor,
			it will show up here as your browser's default font.
		</p>

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
<UnicodeSelectorModal editor={editor!} bind:unicodeSelectorDialog />
