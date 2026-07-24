<script lang="ts">
	import { convert } from "$lib/text/nbt/export";
	import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt/import";
	import { colorMap, getNodeAtSelection, sourceKeys } from "$lib/text/utils";
	import { openDataStore } from "$lib/db";
	import { outputVersion } from "$lib/stores";
	import { tooltip } from "$lib/tooltip";
	import { versions, type Version } from "$lib/types";

	// Local components
	import Modal from "$lib/components/Modal.svelte";
	import MiniEditor from "$lib/components/text/MiniEditor.svelte";
	import MiniRenderer from "$lib/components/text/MiniRenderer.svelte";
	import TextStyleButtons from "$lib/components/text/TextStyleButtons.svelte";
	import ToolbarButton from "$lib/components/text/ToolbarButton.svelte";

	// External components
	import ColorPicker from "svelte-awesome-color-picker";
	import { Highlight } from "svelte-highlight";
	import typescript from "svelte-highlight/languages/typescript";

	// Tiptap
	import { Editor, type JSONContent } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import Placeholder from "@tiptap/extension-placeholder";
	import StarterKit from "@tiptap/starter-kit";
	import { fontLUT } from "$lib/tiptap/extensions/fonts";
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
	import IconDelete from "~icons/tabler/trash";
	import IconLoad from "~icons/tabler/upload";

	// Svelte
	import { onDestroy, onMount } from "svelte";
	import { page } from "$app/state";

	let tiptapJSON: JSONContent = $state()!;

	let element: HTMLElement = $state()!;
	let editor: Editor | undefined = $state()!;
	let color = $state("#ffffff");
	let colorDialog: Modal = $state()!;

	let outputDialog: Modal = $state()!;
	let versionPopup: boolean = $state(false);

	let doesContentExist: boolean = $derived(editor ? !editor.isEmpty : false);
	let shouldOptimise = $state(true);

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

	let hoverEventEditor: MiniEditor = $state()!;
	let hoverEventDialog: Modal = $state()!;
	let hoverEventValue = $state("");

	let fontDialog: Modal = $state()!;
	let fontUploadModal: Modal = $state()!;
	let fontName = $state("");

	let customType: string | undefined = $state();
	let customDialog: Modal = $state()!;

	let unicodeSelectorDialog: Modal = $state()!;

	let finalOutput = $derived(
		editor ? convert(tiptapJSON, "standard", shouldOptimise) : "Loading...",
	);

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
			localStorage.setItem("content", "[]");
		}

		if (localStorage.getItem("snapshots")) {
			snapshots = JSON.parse(localStorage.getItem("snapshots")!);
		} else {
			snapshots = [];
			localStorage.setItem("snapshots", "[]");
		}

		const db = await openDataStore();
		const fontStore = await db.getAll("fonts");

		type FontStoreSchema = {
			identifier: string;
			alias: string;
			data: File;
		};

		await Promise.all(
			fontStore.map(async ({ identifier, alias, data }: FontStoreSchema) => {
				fontLUT.set(identifier, alias);
				document.fonts.add(new FontFace(alias, await data.arrayBuffer()));
			}),
		);
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
					link: false,
				}),
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
				AtlasObjectNode,
				PlayerObjectNode,
				FontsExtension,
				Placeholder.configure({
					placeholder:
						"Write text here, style it with the options above, and the output text components will appear at the bottom. You can also import text components with the Import button above!",
				}),
			],
			onTransaction: ({ editor: newEditor }) => {
				editor = undefined;
				editor = newEditor;
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
		hoverEventDialog!.open().then(() => {
			if (!value) return;
			hoverEventEditor.importText(JSON.stringify(value));
		});
	}

	function clickEditButtonHandler() {
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

	function modifierPressed(event: KeyboardEvent) {
		return navigator.platform.startsWith("Mac") ||
			navigator.platform.includes("iPhone")
			? event.metaKey
			: event.ctrlKey;
	}

	function clearMarksHandler(event: KeyboardEvent) {
		if (modifierPressed(event) && event.shiftKey && event.key === "X") {
			editor!.commands.unsetAllMarks();
		}
	}

	function removeAllNodes(editor: Editor | undefined, type: string) {
		if (!editor) {
			return;
		}
		let editor_json = editor.getJSON();
		editor_json.content.forEach((paragraph) => {
			if (paragraph.content) {
				paragraph.content = paragraph.content.filter(
					(node) => node.type !== type,
				);
			}
		});

		editor?.commands.setContent(editor_json);
		tiptapJSON = editor_json;
	}

	let versionPopupConfirmationVisible = $state(false);
	let temporaryVersionConfirmation: Version | undefined = $state();

	function updateOutputVersion(version: Version | undefined, confirm = false) {
		if (!version) {
			return;
		}

		if ($outputVersion.index > version.index && confirm == false) {
			versionPopupConfirmationVisible = true;
			temporaryVersionConfirmation = version;
			return;
		}

		outputVersion.set(version);
		versionPopup = false;
		versionPopupConfirmationVisible = false;
		temporaryVersionConfirmation = undefined;

		if (version.index < 2) {
			// remove object keys
			removeAllNodes(editor, "atlas_object");
			removeAllNodes(editor, "player_object");
		}

		tiptapJSON = editor!.getJSON();
	}
</script>

<svelte:window onkeydown={clearMarksHandler} />

<main class="flex h-screen max-h-screen flex-col">
	<div
		class="flex w-full items-center bg-zinc-950 text-zinc-300"
		style="font-family: Lexend">
		<div class="flex items-center px-3 py-2 hover:bg-white/3">
			<img src="/dph.svg" class="size-5" alt="logo" height="20" width="20" />
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
		<div class="grow"></div>
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
			{#if sourceKeys.some((key) => editor!.isActive(key))}
				<ToolbarButton
					onClick={async () => {
						customType = getNodeAtSelection(editor!)?.type.name;
						if (customType === "player_object" || customType === "selector") {
							customType = "object";
						}
						await customDialog.open();
					}}
					ariaLabel="Edit Source"
					Icon={IconEdit} />
			{/if}

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
				onClick={() => editor?.commands.undo()}
				ariaLabel="Undo"
				Icon={IconUndo} />
			<ToolbarButton
				onClick={() => editor?.commands.redo()}
				ariaLabel="Redo"
				Icon={IconRedo} />

			<div class="grow"></div>

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
		class="font-minecraft w-full grow overflow-auto bg-zinc-800 first:focus:outline-none"
		spellcheck="false"
		id="wysiwyg-box"
		bind:this={element}>
	</div>

	<div>
		{#if page.url.searchParams.has("dev")}
			<code class="inline-block overflow-x-scroll p-3 text-xs"
				><pre>
					DEV ONLY: {editor ? JSON.stringify(editor.getJSON()) : "Loading..."}
				</pre></code>
			<br />
		{/if}
		<div class="bg-zinc-950 p-3">
			<div
				class="flex max-h-48 max-w-screen items-start space-x-2 overflow-auto">
				<button
					{@attach tooltip}
					class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
					onclick={() => {
						navigator.clipboard.writeText(finalOutput);
						recentlyCopied = true;
						setTimeout(() => (recentlyCopied = false), 2000);
					}}
					aria-label="Copy">
					{#if recentlyCopied}
						<IconTick />
					{:else}
						<IconCopy />
					{/if}</button>
				<code id="outputbox">
					<!-- {editor ? translateMOTD(tiptapJSON) : "Loading..."} -->
					<!-- <pre class="inline break-all whitespace-pre-wrap">{editor
							? finalOutput
							: "Loading..."}</pre> -->
					<Highlight language={typescript} code={finalOutput} />
				</code>
			</div>
			<div class="mt-2 flex items-center space-x-2 select-none">
				<p class="font-lexend text-xs text-white/60">
					click to change output settings:
				</p>

				<div class="relative inline-block">
					{#if versionPopup}
						<div
							class="absolute bottom-full left-1/2 z-10 mb-2 flex w-100 -translate-x-1/2 flex-col space-y-1 rounded-md bg-zinc-900 shadow-md shadow-zinc-950">
							{#if versionPopupConfirmationVisible}
								<div
									class="absolute flex h-full w-full flex-col items-center rounded-md bg-zinc-900 px-4 py-4 backdrop-blur-md">
									<div class="m-auto flex flex-col">
										<b>Warning:</b>
										<span
											>Changing to an earlier version could remove some elements
											of your text that are unsupported in this version.</span>
										<div class="mt-2 flex space-x-2">
											<button
												class="rounded-md bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
												onclick={() =>
													updateOutputVersion(
														temporaryVersionConfirmation,
														true,
													)}>Change version</button>
											<button
												class="rounded-md bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
												onclick={() => {
													versionPopupConfirmationVisible = false;
													temporaryVersionConfirmation = undefined;
												}}>Cancel</button>
										</div>
									</div>
								</div>
							{/if}
							<div class="space-y-1 px-2 py-2">
								<div class="ml-[0.3rem] flex items-center">
									<span class="w-1/4 text-sm">version</span>
									<span class="w-3/4 text-sm">description</span>
								</div>
								{#each versions as v}
									<button
										class="flex w-full items-center rounded-md bg-zinc-800 p-2 text-left select-none hover:bg-zinc-700"
										onclick={() => updateOutputVersion(v)}>
										<b class="w-1/4">{v.friendly}</b>
										<span class="w-3/4 text-xs">{v.description}</span>
									</button>
								{/each}
								<span class="ml-[0.3rem] text-xs text-zinc-400"
									>* unreleased minecraft version</span>
							</div>
						</div>
					{/if}

					<button
						{@attach tooltip}
						class="ml-1 rounded-md bg-zinc-800 px-1 font-mono select-none hover:bg-zinc-700"
						aria-label="Click to change the output version."
						onclick={() => {
							versionPopup = !versionPopup;
						}}>{$outputVersion.friendly}</button>
				</div>

				<button
					{@attach tooltip}
					class="ml-1 rounded-md bg-zinc-800 px-1 font-mono select-none hover:bg-zinc-700"
					aria-label="Click to toggle whether the output should be optimised (shortest output, may have bugs), or expanded (easier to edit, more reliable)."
					onclick={() => (shouldOptimise = !shouldOptimise)}
					>{shouldOptimise ? "optimised" : "expanded"}</button>

				<p class="font-lexend nomob text-xs text-white/60">•</p>

				<button
					class="font-lexend text-xs text-white/60 underline"
					onclick={outputDialog?.open}>
					other output formats
				</button>

				<p class="font-lexend nomob text-xs text-white/60">•</p>

				<p class="font-lexend nomob text-xs text-white/60">
					{finalOutput.length} characters
				</p>
			</div>
		</div>
	</div>
</main>

<noscript>
	<div class="absolute">
		<div
			class="fixed top-0 left-0 flex h-screen w-screen flex-col items-center overflow-auto bg-black/65 text-zinc-100"
			style="font-family: Lexend">
			<div class="z-50 m-auto w-[95%] py-4 md:w-[70%] 2xl:w-[50%]">
				<div class="flex items-center space-x-2 rounded-t-lg bg-zinc-900 p-4">
					<img src="/dph.svg" class="h-5" alt="logo" />
					<span class="grow text-lg font-bold">Datapack Hub Text Editor</span>
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
		<modal.default bind:customDialog bind:customType {editor} />
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
				<div class="flex flex-col">
					<div class="rounded-t-md rounded-br-md bg-zinc-900">
						<MiniRenderer value={snapshot} />
					</div>
					<div class="flex w-fit rounded-b-md bg-zinc-950">
						<button
							{@attach tooltip}
							aria-label="Load snapshot"
							class="border-r border-zinc-800 px-3 py-2 hover:bg-white/3"
							onclick={() => {
								editor?.commands.setContent(snapshot);
								editor?.commands.focus();
							}}><IconLoad /></button>
						<button
							{@attach tooltip}
							aria-label="Delete snapshot"
							class="px-3 py-2 hover:bg-white/3"
							onclick={() => {
								snapshots = snapshots.filter(
									(_, index) => index !== snapshots.indexOf(snapshot),
								);
								localStorage.setItem("snapshots", JSON.stringify(snapshots));
							}}><IconDelete /></button>
					</div>
				</div>
			{/each}
		</div>
	</Modal>

	{#await import("$lib/components/modals/ExportModal.svelte") then modal}
		<modal.default bind:outputDialog {editor} {recentlyCopied} />
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
