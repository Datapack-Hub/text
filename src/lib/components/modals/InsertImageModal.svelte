<script lang="ts">
    import type { Editor, JSONContent } from "@tiptap/core";
    import Modal from "../Modal.svelte";
    import IconUploadImage from "~icons/tabler/file-upload";

    interface Props {
        insertImageDialog?: Modal;
        editor: Editor | undefined;
    }

    let { insertImageDialog = $bindable(), editor }: Props = $props();

    let files: FileList | null = $state(null);
    let dropZone: HTMLLabelElement | null = $state(null);
    let sizeWarning = $state(false);

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        if ([...event.dataTransfer!.items].some((item) => item.kind === "file")) {
            files = event.dataTransfer!.files;
            event.dataTransfer!.clearData();
        }
    }

    function insertImage() {
        if (files && editor) {
            const image = new Image();
            const reader = new FileReader();

            reader.addEventListener("load", () => {
                const imageDataUrl = reader.result as string;

                image.src = imageDataUrl;
                image.onload = () => {
                    processImage(image);
                    image.remove();
                };
            });
            
            reader.readAsDataURL(files[0]);
        }
    }

    function checkFileSize(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            const image = new Image();
            image.src = reader.result as string;
            image.onload = () => {
                sizeWarning = image.width > 24 || image.height > 24
                image.remove();
            };
        };
        reader.readAsDataURL(file);
    }

    function handleDragOver(e: DragEvent) {
        const fileItems = [...e.dataTransfer!.items].filter((item) => item.kind === "file");
        if (fileItems.length > 0) {
            e.preventDefault();
            if (fileItems.some((item) => item.type.startsWith("image/"))) {
                e.dataTransfer!.dropEffect = "copy";
            } else {
                e.dataTransfer!.dropEffect = "none";
            }
        }
    }
    
    function processImage(image: HTMLImageElement): JSONContent[] {
        if (!files || !editor) return [];
        let completeContent: JSONContent[] = [];
        
        const canvas = new OffscreenCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx?.reset();
        ctx?.drawImage(image, 0, 0);

        if (!ctx) return [];

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const pixel = ctx.getImageData(x, y, 1, 1);
                const data = pixel.data;
                if (data[3] !== 0) {
                    const hexColor = `#${data[0].toString(16).padStart(2, "0")}${data[1]
                        .toString(16)
                        .padStart(2, "0")}${data[2].toString(16).padStart(2, "0")}`;

                    completeContent.push({
                        type: "text",
                        marks: [{ type: "textStyle", attrs: { color: hexColor } }],
                        text: "█",
                    });
                } else {
                    completeContent.push({ type: "text", text: "  " });
                }
            }
            completeContent.push({ type: "text", text: "\n" });
        }

        editor?.commands.insertContent(completeContent);

        insertImageDialog?.close();
        files = null;
        return completeContent;
    }

    function handleWindowDrag(e: DragEvent) {
        const fileItems = [...e.dataTransfer!.items].filter((item) => item.kind === "file");
        if (fileItems.length > 0) {
            e.preventDefault();
            if (!dropZone?.contains(e.target as Node)) {
                e.dataTransfer!.dropEffect = "none";
            }
        }
    }

    $effect(() => {
        if(files && files.length > 0) {
            checkFileSize(files[0]);
        } else {
            sizeWarning = false;
        }
    })
</script>

<svelte:window ondragover={handleWindowDrag} ondrop={(e) => e.preventDefault()} />

<Modal title="Insert Image" bind:this={insertImageDialog} key="M">
    <div class="flex w-full flex-col space-y-2">
        <p class="mb-2">A few things to note:</p>
        <ul class="mb-4 list-inside list-disc text-sm text-zinc-400">
            <li>Total transparency will become empty spaces</li>
            <li>Non-zero alpha pixels will be converted to full alpha.</li>
            <li>Large or complex images will produce a very long output</li>
            <li>This tool makes no attempt to resize images</li>
        </ul>
        {#if !files}
            <label
                bind:this={dropZone}
                for="image-upload"
                class="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-600"
                ondragover={(e) => handleDragOver(e)}
                ondrop={(e) => handleDrop(e)}>
                <label for="image-upload" class="btn flex items-center gap-2">
                    <IconUploadImage /> Upload Image
                </label>
                <input type="file" accept="image/*" class="hidden" id="image-upload" bind:files />
                <p class="my-2 text-sm text-zinc-400">OR</p>
                <p>Drag and drop an image here</p>
            </label>
        {:else}
            <p>Selected file: <span class="font-mono bg-zinc-900 p-1 rounded-md text-orange-300">{files[0].name}</span></p>
            {#if sizeWarning}
                <div class="border-red-500 border-2 bg-stone-900 p-2 rounded-md">
                    <p>This image may be too large to display properly, and may also cause performance issues to process, you have been warned!</p>
                </div>
            {/if}
            <div class="flex gap-2">
                <button class="btn" onclick={() => (files = null)}>Remove</button>
                <button class="btn" onclick={insertImage}>Insert</button>
            </div>
        {/if}
    </div>
</Modal>
