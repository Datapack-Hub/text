<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";
	import { openDataStore } from "$lib/db";
	import { fontLUT } from "$lib/tiptap/extensions/fonts";
	import { fileTypeFromBlob } from "file-type";
	import IconUpload from "~icons/tabler/file-upload";

	let { fontUploadModal = $bindable() } = $props();
	let step = $state(1);
	let identifier = $state("");
	let fontAlias = $state("");
	let fontData: Blob

	async function dropHandler(
		e: DragEvent & {
			currentTarget: EventTarget & HTMLLabelElement;
		},
	) {
		e.preventDefault();

		const files = e.dataTransfer?.files;

		await addFontsFromFiles(files);
	}

	async function selectHandler(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
	) {
		e.preventDefault();

		const files = e.currentTarget.files;

		await addFontsFromFiles(files);
	}

	async function addFontsFromFiles(files: FileList | null | undefined) {
		if (!files || files.length > 1) {
			return;
		}

		for (const file of files) {
			const type = await fileTypeFromBlob(file);

			if (
				!type ||
				!["font/ttf", "font/otf", "font/woff", "font/woff2"].includes(type.mime)
			) {
				continue;
			}

			const fileName = crypto.randomUUID();
			const font = new FontFace(fileName, await file.arrayBuffer());
			document.fonts.add(font);
			fontAlias = fileName;
			await font.load();
			fontData = file
		}
		step = 2;
	}

	async function addToFontLUT() {
		fontLUT.set(identifier, fontAlias);
		fontUploadModal.close();
		step = 1;
		
		const db = await openDataStore()
		await db.put("fonts", {
			alias: fontAlias,
			identifier,
			data: fontData
		})

		identifier = "";
		fontAlias = "";
	}
</script>

<Modal title="Upload a font" bind:this={fontUploadModal}>
	{#if step === 1}
		<label
			for="fontFileUpload"
			class="rounded-md bg-zinc-900 p-6"
			ondrop={dropHandler}
			ondragover={(e) => e.preventDefault()}>
			<div class="flex items-center justify-center gap-3 text-xl">
				<IconUpload />
				<p>Upload a font file</p>
			</div>
			<p class="mx-auto mt-3 w-fit text-sm text-white/70">
				(.ttf, .otf, .woff2 recommended)
			</p>
			<input
				class="hidden"
				type="file"
				id="fontFileUpload"
				onchange={selectHandler} />
		</label>
	{:else if step === 2}
		<p>
			Enter font identifier <span class="font-mono text-white/60"
				>(namespace:font_name)</span>
		</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			bind:value={identifier} />
		<button
			onclick={addToFontLUT}
			class="w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Add font
		</button>
	{/if}
</Modal>
