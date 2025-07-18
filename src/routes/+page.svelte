<script lang="ts">
	import { convert, translateJSON } from "$lib/text/nbt_or_json";

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
	import IconEmoji from "~icons/tabler/mood-smile-beam";
	import IconColor from "~icons/tabler/palette";
	import IconEdit from "~icons/tabler/pencil";
	import IconCustom from "~icons/tabler/plus";
	import IconHoverEvent from "~icons/tabler/pointer";
	import IconSquare from "~icons/tabler/square-filled";
	import IconHollow from "~icons/tabler/square-x";

	import { page } from "$app/state";

	import TextStyleButtons from "$lib/components/TextStyleButtons.svelte";
	import { colorMap } from "$lib/text/general";

	import ToolbarButton from "$lib/components/ToolbarButton.svelte";
	import { openDataStore } from "$lib/db";
	import { fontLUT } from "$lib/tiptap/extensions/fonts";
	import { tooltip } from "$lib/tooltip";
	import { translateMOTD } from "$lib/text/motd";
	import ExportModal from "$lib/components/modals/ExportModal.svelte";

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

	async function loadData() {
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

		const db = await openDataStore();
		const fontStore = await db.getAll("fonts");

		type FontStoreSchema = {
			identifier: string;
			alias: string;
			data: File;
		};

		fontStore.forEach(async ({ identifier, alias, data }: FontStoreSchema) => {
			fontLUT.set(identifier, alias);
			document.fonts.add(new FontFace(alias, await data.arrayBuffer()));
		});
	}

	onMount(async () => {
		await loadData();

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
						"Write text here, style it with the options above, and the output text components will appear at the bottom. You can also import text components with the Import button above!",
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
		const { value } = mark.attrs;
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
			translateJSON(editor!.getJSON(), {
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
				Icon={IconFont}
				onClick={() =>
					editor!.getAttributes("textStyle").font
						? editor!.chain().focus().unsetFont().run()
						: fontDialog.open()}
				styleVar={editor.getAttributes("textStyle").font}
				ariaLabel="Font" />

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<ToolbarButton
				{color}
				Icon={IconColor}
				onClick={colorDialog.open}
				ariaLabel="Custom Color" />

			<ToolbarButton
				Icon={IconGradient}
				onClick={gradientDialog.open}
				ariaLabel="Color Gradient" />
			<div id="colorBtns">
				{#each colorMap as color}
					<ToolbarButton
						Icon={IconSquare}
						onClick={() => editor!.chain().focus().setColor(color.value).run()}
						styleVar={editor.isActive("textStyle", { color: color.value })}
						color={color.value}
						ariaLabel={toTitleCase(color.name.replace("_", " "))} />
				{/each}
			</div>
			{#if editor.getAttributes("textStyle").color}
				<button
					onclick={() => editor?.chain().focus().unsetColor().run()}
					aria-label="Unset color"
					{@attach tooltip}
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
				{@attach tooltip}
				class="toolbar-btn"
				aria-label="Add Custom Source">
				<IconCustom />
			</button>

			<ToolbarButton
				Icon={IconEmoji}
				onClick={unicodeSelectorDialog.open}
				ariaLabel="Special Characters" />

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<ToolbarButton
				onClick={() => {
					if (editor?.isActive("clickEvent")) {
						editor?.chain().focus().unsetClickEvent().run();
					} else {
						clickEventDialog?.open();
					}
				}}
				ariaLabel="Click Event"
				styleVar={editor.isActive("clickEvent")}
				Icon={IconClickEvent} />
			{#if editor.isActive("clickEvent")}
				<ToolbarButton
					onClick={clickEditButtonHandler}
					ariaLabel="Edit Click Event"
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
				{@attach tooltip}
				class="{editor.isActive('clickEvent') || editor.isActive('hoverEvent')
					? 'ml-2'
					: ''} toolbar-btn {editor.isActive('hoverEvent')
					? 'bg-zinc-800'
					: ''}"
				aria-label="Hover Event">
				<IconHoverEvent />
			</button>
			{#if editor.isActive("hoverEvent")}
				<ToolbarButton
					onClick={hoverEditButtonHandler}
					ariaLabel="Edit Hover Event"
					Icon={IconEdit} />
			{/if}

			<div class="mx-2 h-5 w-px bg-zinc-600"></div>

			<ToolbarButton
				onClick={() => editor?.chain().undo().run()}
				ariaLabel="Undo"
				Icon={IconUndo} />
			<ToolbarButton
				onClick={() => editor?.chain().redo().run()}
				ariaLabel="Redo"
				Icon={IconRedo} />

			<div class="flex-grow"></div>

			<button
				{@attach tooltip}
				class="toolbar-btn nomob"
				onclick={fontUploadModal?.open}
				aria-label="Upload Font"><IconUploadFont /></button>
			<button
				{@attach tooltip}
				class="toolbar-btn nomob"
				onclick={keybindDialog?.open}
				aria-label="Keybinds"><IconKeybinds /></button>
		{/if}
	</div>

	<div
		class="font-minecraft w-full flex-grow overflow-auto bg-zinc-800 first:focus:outline-none"
		spellcheck="false"
		bind:this={element}>
	</div>

	<div>
		{#if page.url.searchParams.has("dev")}
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
					{@attach tooltip}
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
					aria-label="Copy">
					{#if recentlyCopied}
						<IconTick />
					{:else}
						<IconCopy />
					{/if}</button>
				<p>
					<code id="outputbox" class="inline break-all">
						<!-- {editor ? translateMOTD(tiptapJSON) : "Loading..."} -->
						{editor
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
						click to change output settings:
					</p>
					<button
						{@attach tooltip}
						class="ml-1 rounded-md bg-zinc-800 px-1 font-mono select-none hover:bg-zinc-700"
						aria-label="Click to toggle the output version. 1.21.5 drastically changed the format of text components, so make sure you select the correct version."
						onclick={() => {
							const ov = outputVersion;
							if (ov == "new") {
								outputVersion = "old";
							} else {
								outputVersion = "new";
							}
						}}>{outputVersion == "new" ? "1.21.5+" : "pre 1.21.5"}</button>
					<button
						{@attach tooltip}
						class="ml-1 rounded-md bg-zinc-800 px-1 font-mono select-none hover:bg-zinc-700"
						aria-label="Click to toggle whether the output should be optimised (shortest possible output), or expanded (easier to edit manually)."
						onclick={() => (shouldOptimise = !shouldOptimise)}
						>{shouldOptimise ? "optimised" : "expanded"}</button>

					<p class="font-lexend nomob text-xs text-white/60">•</p>

					<button class="font-lexend text-xs text-white/60 underline" onclick={outputDialog?.open}>
					    other output formats
					</button>
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
			<div class="z-50 m-auto w-[95%] py-4 md:w-[70%] 2xl:w-[50%]">
				<div class="flex items-center space-x-2 rounded-t-lg bg-zinc-900 p-4">
					<img src="/dph.svg" class="h-5" alt="logo" />
					<span class="flex-grow text-lg font-bold"
						>Datapack Hub Text Editor</span>
				</div>
				<div class="flex flex-col space-y-2 rounded-b-lg bg-zinc-800 p-4">
					<p>
						This is a /tellraw editor and editor for Minecraft text components,
						for all versions. Create /tellraw commands and text components (JSON
						text) for Minecraft Java Edition with our easy-to-use, modern online
						tool!
					</p>
					<div class="flex flex-col rounded-md bg-red-500/50 p-3">
						<b class="text-lg">⚠️ This website requires JavaScript to work.</b>
						<span class="text-sm"
							>Please enable JavaScript in your site settings. If JavaScript is
							enabled, please refresh. If that doesn't work, then try a
							different browser. If that still doesn't work, then ask for help
							in <a
								href="https://discord.datapackhub.net/"
								class="font-bold underline">our Discord</a
							></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</noscript>

<div>
	<!-- code splitted to reduce bundle size -->
	{#await import("$lib/components/modals/ClickEventModal.svelte") then modal}
		<modal.default
			bind:clickEventDialog
			bind:clickEventType
			bind:clickEventValue
			{editor} />
	{/await}

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

	{#await import("$lib/components/modals/CustomSourceModal.svelte") then modal}
		<modal.default bind:customDialog bind:customType {editor} {outputVersion} />
	{/await}

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

	{#await import("$lib/components/modals/ExportModal.svelte") then modal}
		<modal.default
			bind:outputDialog
			bind:outputVersion
			{editor}
			{recentlyCopied} />
	{/await}

	<Modal title="Import from NBT" bind:this={importDialog} key="I">
		<div class="flex w-full flex-col space-y-2">
			<p>
				Paste your text components below to import them into the editor. This
				will clear the current contents of the editor!
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

	{#await import("$lib/components/modals/FontPickerModal.svelte") then modal}
		<modal.default
			bind:fontDialog
			{fontUploadModal}
			editor={editor!}
			bind:fontName />
	{/await}

	{#await import("$lib/components/modals/KeybindModal.svelte") then modal}
		<modal.default bind:keybindDialog />
	{/await}
	{#await import("$lib/components/modals/FontUploadModal.svelte") then modal}
		<modal.default bind:fontUploadModal />
	{/await}

	{#await import("$lib/components/modals/ColorGradientModal.svelte") then modal}
		<modal.default {editor} bind:gradientSteps bind:gradientDialog />
	{/await}
	{#await import("$lib/components/modals/UnicodeSelectorModal.svelte") then modal}
		<modal.default editor={editor!} bind:unicodeSelectorDialog />
	{/await}
</div>
