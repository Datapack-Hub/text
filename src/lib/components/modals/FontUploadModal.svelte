<script lang="ts">
	import Modal from "$lib/Modal.svelte";
	import { fontLUT } from "$lib/tiptap/extensions/fonts";
	import { fileTypeFromBlob } from "file-type";
	import IconUpload from "~icons/tabler/file-upload";

	type Props = {
		fontUploadModal: Modal;
	};

	let { fontUploadModal = $bindable() }: Props = $props();
	let step = $state(1);
	let identifier = $state("");
	let fontAlias = $state("");

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
				console.log("not a font file");
				continue;
			}

			const fileName = crypto.randomUUID();
			const font = new FontFace(fileName, await file.arrayBuffer());
			document.fonts.add(font);
			fontAlias = fileName;
			await font.load();
		}
		step = 2;
	}

	function addToFontLUT() {
		fontLUT.set(identifier, fontAlias);
		fontUploadModal.close();
		step = 1;
	}
</script>

<Modal title="Upload a font" bind:this={fontUploadModal} key="U">
	{#if step === 1}
		<label
			for="fontFileUpload"
			class="bg-zinc-900 p-6 rounded-md"
			ondrop={dropHandler}
			ondragover={(e) => e.preventDefault()}>
			<div class="flex items-center justify-center gap-3 text-xl">
				<IconUpload />
				<p>Upload a font file</p>
			</div>
			<p class="text-white/70 mx-auto w-fit mt-3 text-sm">
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
			class="bg-zinc-900 p-2 rounded-md"
			bind:value={identifier} />
		<button
			onclick={addToFontLUT}
			class="bg-zinc-900 p-2 rounded-md w-fit cursor-pointer hover:bg-black/50">
			Add font
		</button>
	{/if}
</Modal>
