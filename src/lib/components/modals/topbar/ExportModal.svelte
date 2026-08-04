<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { outputVersion } from "$lib/stores";
    import { translateMOTD } from "$lib/text/motd";
    import { convert } from "$lib/text/nbt/export";
    import IconDownload from "~icons/tabler/download";
    import IconCopy from "~icons/tabler/copy";
    import CheckBox from "../../CheckBox.svelte";
    import { domToPng, domToJpeg, domToWebp, domToSvg, type Options } from "modern-screenshot";

    let {
        outputDialog = $bindable(),
        editor,
        recentlyCopied = $bindable(),
        shouldOptimise = true,
    } = $props();

    let exportAsJSON = $state(false);
    let extension = $state("png");

    const functionLUT = new Map<
        string,
        (element: HTMLElement, options?: Options) => Promise<string>
    >();

    functionLUT.set("png", domToPng);
    functionLUT.set("jpeg", domToJpeg);
    functionLUT.set("webp", domToWebp);
    functionLUT.set("svg", domToSvg);

    let renderOptions: Options = {
        scale: 4,
    };

    async function exportAsImage() {
        const func = functionLUT.get(extension);
        if (func) {
            await func(document.querySelector(".ProseMirror")!, renderOptions).then(downloadImage);
        }
    }

    async function downloadImage(dataUrl: string) {
        const link = document.createElement("a");
        link.download = `tellraw-output.${extension}`;
        link.href = dataUrl;
        link.click();
    }
</script>

<Modal title="More output formats" bind:this={outputDialog} big key="E">
    <div class="flex w-full flex-col">
        {#if $outputVersion.index > 0}
            <div class="mt-1 flex items-center space-x-2">
                <CheckBox bind:value={exportAsJSON} label="json" />
                <span>Toggle JSON mode (for use in json files)</span>
            </div>
        {/if}

        <p class="mt-4">
            As {$outputVersion.index > 0 ? " " : "JSON "}text components:
        </p>
        <div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
            <button
                class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
                onclick={() => {
                    navigator.clipboard.writeText(
                        convert(editor.getJSON(), shouldOptimise, "standard", exportAsJSON),
                    );
                    recentlyCopied = true;
                    setTimeout(() => (recentlyCopied = false), 2000);
                }}>
                <IconCopy />
            </button>
            <code class="inline-block max-h-56 w-full overflow-auto">
                <pre class="inline break-all whitespace-pre-wrap">{editor
                        ? convert(editor.getJSON(), shouldOptimise, "standard", exportAsJSON)
                        : "Loading..."}</pre>
            </code>
        </div>

        <p class="mt-4">As a lore component:</p>
        <div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
            <button
                class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
                onclick={() => {
                    navigator.clipboard.writeText(
                        `[lore=${convert(editor.getJSON(), shouldOptimise, "item_lore", exportAsJSON)}]`,
                    );
                    recentlyCopied = true;
                    setTimeout(() => (recentlyCopied = false), 2000);
                }}>
                <IconCopy />
            </button>
            <code class="inline-block max-h-56 w-full overflow-auto"
                ><span class="text-white/35">[lore=</span>
                <pre class="inline break-all whitespace-pre-wrap">{editor
                        ? convert(editor.getJSON(), shouldOptimise, "item_lore", exportAsJSON)
                        : "Loading..."}</pre>
                <span class="text-white/35">]</span>
            </code>
        </div>

        <p class="mt-4">As a MOTD:</p>
        <div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
            <button
                class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
                onclick={() => {
                    navigator.clipboard.writeText(
                        editor ? translateMOTD(editor.getJSON()) : "Loading...",
                    );
                    recentlyCopied = true;
                    setTimeout(() => (recentlyCopied = false), 2000);
                }}>
                <IconCopy />
            </button>
            <code class="max-h-56 w-full overflow-auto">
                <pre class="inline break-all whitespace-pre-wrap">{editor
                        ? translateMOTD(editor.getJSON())
                        : "Loading..."}</pre>
            </code>
        </div>
        <p class="mt-4">(BETA) As a image:</p>
        <p class="text-sm text-white/50">Accuracy may not be great! You have been warned!</p>
        <div class="mt-2 flex items-center gap-2">
            <button
                class="text-md flex items-center justify-center space-x-2 rounded-sm bg-zinc-900 p-2 hover:brightness-90 active:brightness-75"
                onclick={exportAsImage}>
                <IconDownload />
                <span>Download image</span>
            </button>
            <div class="flex flex-col">
                <label for="extension" class="ml-2 text-xs text-white/50">Image format:</label>
                <select
                    bind:value={extension}
                    name="extension"
                    class="ml-2 rounded-sm border-r-8 border-zinc-900 bg-zinc-900 p-1 text-white outline-0">
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WEBP</option>
                    <option value="svg">SVG</option>
                </select>
            </div>
        </div>
    </div>
</Modal>
