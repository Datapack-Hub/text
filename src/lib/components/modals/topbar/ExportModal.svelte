<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { translateMOTD } from "$lib/text/motd";
    import { convert } from "$lib/text/nbt/export";
    import CheckBox from "../../CheckBox.svelte";
    import { domToPng,  type Options } from "modern-screenshot";
    import { Highlight } from "svelte-highlight";
    import typescript from "svelte-highlight/languages/typescript";
    import { appSettings } from "$lib/settings";

    // Icons
    import IconItem from "~icons/tabler/swords";
    import IconJSON from "~icons/tabler/braces";
    import IconMOTD from "~icons/tabler/speakerphone";
    import IconImage from "~icons/tabler/photo";
    import IconBack from "~icons/tabler/arrow-back-up";
    import IconCopy from "~icons/tabler/copy";
    import IconCheck from "~icons/tabler/check";
    import IconDownload from "~icons/tabler/download";
    import { json } from "svelte-highlight/languages";

    // UI
    let showOutput: string | null = $state(null);

    let {
        outputDialog = $bindable(),
        editor,
        recentlyCopied = $bindable(),
        shouldOptimise = true,
    } = $props();


    // Image output
    let imgPreview: HTMLImageElement | undefined = $state();

    let renderOptions: Options = {
        scale: 4,
    };

    // output variables
    var transparent: boolean = $state(true);
    var indent: boolean = $state(true);
    var jsonLore: boolean = $state(false);

    async function exportImage() {
        const textContainer: HTMLElement = document.querySelector(".ProseMirror")!;

        // Briefly resize so that the image bounding box is correct
        textContainer.style.height = "fit-content";
        textContainer.style.width = "fit-content";
        const rect = textContainer.getBoundingClientRect();
        textContainer.style.height = "100%";
        textContainer.style.width = "100%";

        // Get output
        return await domToPng(textContainer, {
            ...renderOptions,
            width: rect.width,
            height: rect.height,
            backgroundColor: !transparent ? "black" : "transparent",
        });
    }

    async function downloadImage(dataUrl: string) {
        const link = document.createElement("a");
        link.download = `tellraw-output.png`;
        link.href = dataUrl;
        link.click();
    }

    async function copyImage(dataUrl: string) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    }

    async function showImageOutput() {
        showOutput = "image";
        exportImage().then((imgUrl) => {
            imgPreview!.src = imgUrl;
        });
    }
</script>

<Modal
    title="Other output formats"
    bind:this={outputDialog}
    key="E"
    onOpen={() => (showOutput = null)}>
    <div class="flex w-full flex-col space-y-2">
        {#if showOutput == null}
            <p>You can also export the text in one of these formats too:</p>
            <div class="grid grid-cols-1 gap-2 xl:grid-cols-2">
                <button
                    onclick={() => (showOutput = "json")}
                    class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconJSON />
                    <span>JSON format</span>
                </button>

                <button
                    onclick={() => (showOutput = "lore")}
                    class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconItem />
                    <span>Lore item component</span>
                </button>

                <button
                    onclick={() => (showOutput = "motd")}
                    class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconMOTD />
                    <span>Server MOTD</span>
                </button>

                <button
                    onclick={showImageOutput}
                    class="flex h-full w-full cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconImage />
                    <span>Image</span>
                    <span class="font-mono text-white/60">(.png)</span>
                </button>

                <div class="h-full w-full p-2">
                    <span class="text-zinc-600">More coming soon</span>
                </div>
            </div>
        {:else if showOutput == "json"}
            <div class="flex items-center space-x-2">
                <div class="flex h-full w-full cursor-pointer items-center space-x-2 p-2 font-bold">
                    <IconJSON />
                    <span>JSON format</span>
                </div>
                <button
                    onclick={() => (showOutput = null)}
                    class="flex h-full w-fit cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconBack />
                    <span>Back</span>
                </button>
            </div>
            <code class="max-h-56 w-full space-x-3 overflow-auto rounded-lg bg-zinc-950 p-3">
                {#if $appSettings.syntaxHighlight}
                <Highlight
                    language={json}
                    code={
                        JSON.stringify(
                            JSON.parse(
                                convert(
                                    editor.getJSON(),
                                    shouldOptimise,
                                    "standard",
                                    true,
                                )
                            ),
                            null,
                            indent ? 4 : undefined
                        )
                    } />
                {:else}
                    <pre class="inline break-all whitespace-pre-wrap">{editor
                        ? JSON.stringify(
                            JSON.parse(
                                convert(
                                    editor.getJSON(),
                                    shouldOptimise,
                                    "standard",
                                    true,
                                )
                            ),
                            null,
                            indent ? 4 : undefined
                        )
                        : "Loading..."}</pre>
                {/if}
            </code>

            <div class="flex items-center space-x-2">
                <CheckBox label="bg" bind:value={indent} />
                <label for="bg">Indent output</label>
            </div>

            <button
                class="btn flex items-center space-x-2"
                onclick={() => {
                    navigator.clipboard.writeText(
                        JSON.stringify(
                            JSON.parse(
                                convert(
                                    editor.getJSON(),
                                    shouldOptimise,
                                    "standard",
                                    true,
                                )
                            ),
                            null,
                            indent ? 4 : undefined
                        )
                    );
                    recentlyCopied = true;
                    setTimeout(() => (recentlyCopied = false), 2000);
                }}>
                {#if !recentlyCopied}
                    <IconCopy />
                    <span>Copy</span>
                {:else}
                    <IconCheck />
                    <span>Copied!</span>
                {/if}
            </button>
        {:else if showOutput == "lore"}
            <div class="flex items-center space-x-2">
                <div class="flex h-full w-full cursor-pointer items-center space-x-2 p-2 font-bold">
                    <IconItem />
                    <span>Lore item component</span>
                </div>
                <button
                    onclick={() => (showOutput = null)}
                    class="flex h-full w-fit cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconBack />
                    <span>Back</span>
                </button>
            </div>
            <code class="max-h-56 w-full space-x-3 overflow-auto rounded-lg bg-zinc-950 p-3">
                <span class="text-white/35 select-none">[lore=</span>
                {#if $appSettings.syntaxHighlight}
                    <div class="ml-0 lg:ml-4">
                        <Highlight
                            language={jsonLore ? json : typescript}
                            code={convert(
                                editor.getJSON(),
                                shouldOptimise,
                                "item_lore",
                                jsonLore,
                            )} />
                    </div>
                {:else}
                    <pre class="inline break-all whitespace-pre-wrap">{editor
                            ? convert(editor.getJSON(), shouldOptimise, "item_lore", jsonLore)
                            : "Loading..."}</pre>
                {/if}
                <span class="text-white/35 select-none">]</span>
            </code>

            <div class="flex items-center space-x-2">
                <CheckBox label="bg" bind:value={jsonLore} />
                <label for="bg">JSON output</label>
            </div>

            <button
                class="btn flex items-center space-x-2"
                onclick={() => {
                    navigator.clipboard.writeText(
                        `[lore=${convert(editor.getJSON(), shouldOptimise, "item_lore", jsonLore)}]`,
                    );
                    recentlyCopied = true;
                    setTimeout(() => (recentlyCopied = false), 2000);
                }}>
                {#if !recentlyCopied}
                    <IconCopy />
                    <span>Copy</span>
                {:else}
                    <IconCheck />
                    <span>Copied!</span>
                {/if}
            </button>
        {:else if showOutput == "motd"}
            <div class="flex items-center space-x-2">
                <div class="flex h-full w-full cursor-pointer items-center space-x-2 p-2 font-bold">
                    <IconMOTD />
                    <span>Server MOTD</span>
                </div>
                <button
                    onclick={() => (showOutput = null)}
                    class="flex h-full w-fit cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconBack />
                    <span>Back</span>
                </button>
            </div>
            <code class="max-h-56 w-full space-x-3 overflow-auto rounded-lg bg-zinc-950 p-3">
                <pre class="inline break-all whitespace-pre-wrap">{editor
                        ? translateMOTD(editor.getJSON())
                        : "Loading..."}</pre>
            </code>

            <button
                class="btn flex items-center space-x-2"
                onclick={() => {
                    navigator.clipboard.writeText(translateMOTD(editor.getJSON()));
                    recentlyCopied = true;
                    setTimeout(() => (recentlyCopied = false), 2000);
                }}>
                {#if !recentlyCopied}
                    <IconCopy />
                    <span>Copy</span>
                {:else}
                    <IconCheck />
                    <span>Copied!</span>
                {/if}
            </button>
        {:else if showOutput == "image"}
            <div class="flex items-center space-x-2">
                <div class="flex h-full w-full cursor-pointer items-center space-x-2 p-2 font-bold">
                    <IconImage />
                    <span>Image</span>
                </div>
                <button
                    onclick={() => (showOutput = null)}
                    class="flex h-full w-fit cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                    <IconBack />
                    <span>Back</span>
                </button>
            </div>
            <div class="max-h-56 w-full overflow-auto rounded-lg bg-zinc-950">
                <img src="#" bind:this={imgPreview} alt="" />
            </div>
            <div class="flex items-center space-x-2">
                <CheckBox label="bg" bind:value={transparent} />
                <label for="bg">Transparent background</label>
            </div>
            <div class="flex items-center space-x-2">
                <button
                    class="btn flex items-center space-x-2"
                    onclick={() => {
                        exportImage().then(copyImage);
                        recentlyCopied = true;
                        setTimeout(() => (recentlyCopied = false), 2000);
                    }}>
                    {#if !recentlyCopied}
                        <IconCopy />
                        <span>Copy</span>
                    {:else}
                        <IconCheck />
                        <span>Copied!</span>
                    {/if}
                </button>

                <button
                    class="btn flex items-center space-x-2"
                    onclick={() => {
                        exportImage().then(downloadImage);
                    }}>
                    <IconDownload />
                    <span>Download</span>
                    <span class="font-mono text-white/60">(.png)</span>
                </button>
            </div>
        {/if}
    </div>
</Modal>