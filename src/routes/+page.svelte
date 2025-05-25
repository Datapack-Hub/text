<script lang="ts">
	import { dev } from "$app/environment";
	import {
		colorMap,
		type MinecraftText,
		type MinecraftTextWithNoEvents,
		getMarkType,
		defaultColorLUT,
		trueMarkOrUndefined,
		type ExternalSources,
	} from "$lib/tiptap/text";

	import {
		ClickEventMark,
		HoverEventMark,
		Obfuscation,
		ScoreNode,
		TranslateNode,
		BlockNBTNode,
		StorageNBTNode,
		EntityNBTNode,
		KeybindNode,
		SelectorNode,
	} from "$lib/tiptap/extensions";

	// Components
	import Modal from "$lib/Modal.svelte";
	import MiniEditor from "$lib/MiniEditor.svelte";
	import MiniRenderer from "$lib/MiniRenderer.svelte";

	import { Editor, type JSONContent } from "@tiptap/core";
	import Color from "@tiptap/extension-color";
	import Placeholder from "@tiptap/extension-placeholder";
	import { FixedTextStyle } from "$lib/tiptap/FixedTextStyle";
	import Underline from "@tiptap/extension-underline";
	import StarterKit from "@tiptap/starter-kit";
	import { onDestroy, onMount } from "svelte";

	// Icons
	import IconCustom from "~icons/tabler/plus";
	import IconBold from "~icons/tabler/bold";
	import IconItalic from "~icons/tabler/italic";
	import IconColor from "~icons/tabler/palette";
	import IconCopy from "~icons/tabler/copy";
	import IconClickEvent from "~icons/tabler/hand-finger";
	import IconHoverEvent from "~icons/tabler/pointer";
	import IconHollow from "~icons/tabler/square";
	import IconSquare from "~icons/tabler/square-filled";
	import IconStrikethrough from "~icons/tabler/strikethrough";
	import IconUnderline from "~icons/tabler/underline";
	import IconTick from "~icons/tabler/check";
	import IconObfuscate from "~icons/tabler/password";

	// TODO: convert to non-legacy mode
	export let value = "";

	let element: HTMLElement;
	let editor: Editor;
	let color = "";
	let fontName = "";

	let recentlyCopied = false;

	// Snapshots and stuff
	let snapshots: object[] = [];
	let recentlySaved = false;
	let loadDialog: Modal

	// Dialogs
	let clickEventType = "";
	let clickEventValue = "";
	let clickEventDialog: Modal;

	let hoverEventType = "";
	let hoverEventValue: any;
	let hoverEventDialog: Modal;

	let customType = "-- Select one --";
	let customDialog: Modal;
	let customValues: ExternalSources = {
		score: {
			objective: "",
			name: "",
		},
		translate: {
			key: "",
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

	onMount(() => {
		if (localStorage.getItem("content")) {
			value = localStorage.getItem("content")!;
		} else {
            value = "[]"
        }

		if (localStorage.getItem("snapshots")) {
			snapshots = JSON.parse(localStorage.getItem("snapshots")!);
		}

		editor = new Editor({
			element: element,
			content: JSON.parse(value),
			extensions: [
				StarterKit,
				Underline,
				Color,
				FixedTextStyle,
				Obfuscation,
				ClickEventMark,
				HoverEventMark,
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

	function translate(json: JSONContent): string {
		if (!json.content![0].content) {
			return "waiting for input...";
		}

		const paragraphs = json.content!;

		let data: (MinecraftText | string)[] = [""];

		paragraphs.forEach((p, i) => {
			const content = p.content || [];
			let current: MinecraftText
			content.forEach((c) => {
				if (c.type == "text") {
					current = {
						text: c.text,
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						font: undefined
					}
				} else if (c.type == "score") {
					current = {
						score: {
							name: c.attrs?.name,
							objective: c.attrs?.objective,
						},
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						click_event: getMarkType(c, "clickEvent")?.attrs as {
							action: string;
							value: string;
						},
						hover_event: getMarkType(c, "hoverEvent")?.attrs as {
							action: string;
							contents: MinecraftTextWithNoEvents;
						},
					};
				} else if (c.type == "translate") {
					current = {
						translate: c.attrs?.key,
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						font: undefined,
					};
				} else if (c.type == "storage_nbt") {
					current = {
						nbt: c.attrs?.nbt,
						storage: c.attrs?.storage,
						interpret: c.attrs?.interpret || undefined,
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						font: undefined,
					};
				} else if (c.type == "block_nbt") {
					current = {
						nbt: c.attrs?.nbt,
						block: c.attrs?.block,
						interpret: c.attrs?.interpret || undefined,
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						font: undefined,
					};
				} else if (c.type == "entity_nbt") {
					current = {
						nbt: c.attrs?.nbt,
						entity: c.attrs?.entity,
						interpret: c.attrs?.interpret || undefined,
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						font: undefined,
					};
				} else if (c.type == "keybind") {
					current = {
						keybind: c.attrs?.key,
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						font: undefined,
					};
				} else if (c.type == "selector") {
					current = {
						selector: c.attrs?.selector,
						color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
						bold: trueMarkOrUndefined(c, "bold"),
						italic: trueMarkOrUndefined(c, "italic"),
						strikethrough: trueMarkOrUndefined(c, "strike"),
						underlined: trueMarkOrUndefined(c, "underline"),
						obfuscated: trueMarkOrUndefined(c, "obfuscated"),
						font: undefined,
					};
				}

				if(getMarkType(c, "clickEvent")){
					const ce = getMarkType(c, "clickEvent")?.attrs
					current.click_event = {action: ce!.action}
					if(ce!.action == "open_url"){
						current.click_event.url = ce!.value
					} else if (ce!.action == "run_command" || ce!.action == "suggest_command") {
						current.click_event.command = ce!.value
					} else if (ce!.action == "copy_to_clipboard") {
						current.click_event.value = ce!.value
					} else if (ce!.action == "change_page") {
						current.click_event.page = ce!.value
					} else if (ce!.action == "open_dialog") {
						current.click_event.dialog = ce!.value
					}
				}

				if(getMarkType(c, "hoverEvent")){
					const ce = getMarkType(c, "hoverEvent")?.attrs
					current.hover_event = {action: ce!.action, value: ce!.value}
				}

				data.push(current)
			});

			if (i < paragraphs.length - 1) {
				data.push("\n");
			}
		});

		return JSON.stringify(data);
	}

	function customColorHandler() {
		editor.chain().focus().setColor(color).run();
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
		}
		recentlySaved = true
		setTimeout(() => {
			recentlySaved = false
		}, 4000)
	}
</script>

<div class="flex flex-col h-screen">
	<div class="bg-zinc-950 w-full text-zinc-300 flex items-center" style="font-family: Lexend">
		<div class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer">
			<img src="/dph.svg" class="h-5" alt="logo" />
			<span class="ml-3 nomob">Minecraft Text Editor <span class="text-xs">(by <a href="https://datapackhub.net" class="underline">Datapack Hub</a>)</span></span>
		</div>
		<button class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer" onclick={saveSnapshot}>Save{recentlySaved ? "d!" : ""}</button>
		<button class="flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer" onclick={loadDialog.open}>Load</button>
		<div class="flex-grow"></div>
		<a href="https://discord.datapackhub.net/" class="nomob flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer">Discord</a>
		<a href="https://datapack.wiki/" class="nomob flex items-center px-3 py-2 hover:bg-white/2 cursor-pointer">Datapack Wiki</a>
		
	</div>

	<div class="w-full p-3 bg-zinc-900 flex items-center flex-wrap">
		{#if editor}
			<button
				onclick={customDialog.open}
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
				title="Add Custom Source">
				<IconCustom />
			</button>

			<div class="w-4"></div>

			<button
				onclick={() => editor.chain().focus().toggleBold().run()}
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive(
					'bold',
				)
					? 'bg-zinc-800'
					: ''}"
				title="Bold">
				<IconBold />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleItalic().run()}
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive(
					'italic',
				)
					? 'bg-zinc-800'
					: ''}"
				title="Italic">
				<IconItalic />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleStrike().run()}
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive(
					'strike',
				)
					? 'bg-zinc-800'
					: ''}"
				title="Strikethrough">
				<IconStrikethrough />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleUnderline().run()}
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive(
					'underline',
				)
					? 'bg-zinc-800'
					: ''}"
				title="Underline">
				<IconUnderline />
			</button>
			<button
				onclick={() => editor.chain().focus().toggleObfuscated().run()}
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive('obfuscated',) ? 'bg-zinc-800' : ''}">
				<IconObfuscate />
			</button>

			<div class="w-4"></div>

			<label
				for="color"
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium"
				title="Custom Color"><IconColor /></label>
			<input
				type="color"
				id="color"
				bind:value={color}
				onchange={customColorHandler}
				class="invisible w-0" />
			{#each colorMap as color}
				<button
					onclick={() => editor.chain().focus().setColor(color.value).run()}
					title={color.name}
					class="p-1 text-lg hover:bg-zinc-800 rounded-md {editor.isActive(
						'textStyle',
						{ color: color.value },
					)
						? 'bg-zinc-800'
						: ''}"
					style="color: {color.value};">
					<IconSquare />
				</button>
			{/each}
			<button
				onclick={() => editor.chain().focus().unsetColor().run()}
				title="Default"
				class="p-1 text-lg hover:bg-zinc-800 text-zinc-500 rounded-md"
				class:active={editor.isActive("underline")}>
				<IconHollow />
			</button>

			<div class="w-4"></div>

			<button
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive('clickEvent') ? 'bg-zinc-800': ''}"
				title="Click Event"
				onclick={() => {
					if(editor.isActive("clickEvent")) {editor.chain().focus().unsetClickEvent().run();} 
					else {clickEventDialog.open()}
				}}>
				<IconClickEvent />
			</button>
			<button
				onclick={() => {
					if(editor.isActive("hoverEvent")) {editor.chain().focus().unsetHoverEvent().run();} 
					else {hoverEventDialog.open()}
				}}
				class="p-1 text-lg hover:bg-zinc-800 rounded-md font-medium {editor.isActive('hoverEvent') ? 'bg-zinc-800': ''}"
				title="Hover Event">
				<IconHoverEvent />
			</button>

			<!-- <label for="font">Custom Font:</label>
        <input
            class="bg-zinc-800 p-2 rounded-md"
            type="text"
            id="font"
            bind:value={fontName}
            placeholder="Enter font name" /> -->
		{/if}
	</div>

	<div
		class="font-minecraft bg-zinc-800 w-full first:focus:outline-none flex-grow"
		bind:this={element}>
	</div>

	<div>
		{#if dev}
			<code class="inline-block p-3"
				>DEV ONLY: {editor
					? JSON.stringify(editor.getJSON())
					: "Loading..."}</code>
			<br />
		{/if}
		<div class="flex items-start bg-zinc-950 p-3 space-x-3">
			<button 
			class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
			onclick={() => {
				navigator.clipboard.writeText(
					translate(editor.getJSON()).replace(/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, 
					(match) => match.replace(/"/g, ""))
				);
				recentlyCopied = true;
				setTimeout(() => recentlyCopied = false, 2000)
			}}>
			{#if recentlyCopied}
				<IconTick />
			{:else}
				<IconCopy />
			{/if}</button>
			<code class="inline-block w-full">{editor
				? translate(editor.getJSON()).replace(
					/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g,
					(match) => match.replace(/"/g, ""),
				) : "Loading..."}
			</code>
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
	<MiniEditor bind:output={hoverEventValue}/>
	<button
		onclick={() => {
			console.log(hoverEventValue)
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
	<p>Source Type</p>
	<select bind:value={customType} class="bg-zinc-900 p-2 rounded-md">
		<option value="translate">Translate Key</option>
		<option value="score">Score Value</option>
		<option value="nbt">NBT Value</option>
		<option value="selector">Selector</option>
		<option value="keybind">Keybind</option>
	</select>

	{#if customType === "translate"}
		<p class="mt-2">Translate Key</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="item.minecraft.beef"
			bind:value={customValues.translate.key} />

		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertTranslate({ key: customValues.translate.key })
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

			<div>
				<input
					name="interpret"
					type="checkbox"
					class="bg-zinc-900 p-2 rounded-md mt-2"
					placeholder="Items[0].id"
					bind:checked={customValues.nbt.interpret} />
				<label for="interpret" class="mt-2"
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

			<div>
				<input
					name="interpret"
					type="checkbox"
					class="bg-zinc-900 p-2 rounded-md mt-2"
					placeholder="Items[0].id"
					bind:checked={customValues.nbt.interpret} />
				<label for="interpret" class="mt-2"
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

			<div>
				<input
					name="interpret"
					type="checkbox"
					class="bg-zinc-900 p-2 rounded-md mt-2"
					placeholder="Items[0].id"
					bind:checked={customValues.nbt.interpret} />
				<label for="interpret" class="mt-2"
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
					<button class="hover:bg-white/2 py-2 px-3" onclick={() => {
						editor.commands.setContent(snapshot);
						editor.commands.focus();
					}}>Load</button>
					<button class="hover:bg-white/2 py-2 px-3" onclick={() => {
						snapshots = snapshots.filter((_, index) => index !== snapshots.indexOf(snapshot))
						localStorage.setItem("snapshots", JSON.stringify(snapshots));
					}}>Delete</button>
				</div>
			</div>
		{/each}
	</div>
</Modal>