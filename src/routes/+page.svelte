<script lang="ts">
    import { openDataStore } from "$lib/db";
    import { outputVersion } from "$lib/stores";
    import { convert } from "$lib/text/nbt/export";
    import { tooltip } from "$lib/tooltip";
    import { versions, type Version } from "$lib/types";
    import Modal from "$lib/components/Modal.svelte";
    import { Highlight } from "svelte-highlight";
    import typescript from "svelte-highlight/languages/typescript";
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
    import { Editor, type JSONContent } from "@tiptap/core";
    import Color from "@tiptap/extension-color";
    import Placeholder from "@tiptap/extension-placeholder";
    import StarterKit from "@tiptap/starter-kit";
    import IconTick from "~icons/tabler/check";
    import IconCopy from "~icons/tabler/copy";
    import { page } from "$app/state";
    import ControlBar from "$lib/components/toolbar/Toolbar.svelte";
    import TopUI from "$lib/components/TopUI.svelte";
    import { onDestroy, onMount } from "svelte";
    import { appSettings } from "$lib/settings";

    let tiptapJSON: JSONContent = $state()!;

    let element: HTMLElement = $state()!;
    let editor: Editor | undefined = $state()!;

    let outputDialog: Modal = $state()!;
    let versionPopup: boolean = $state(false);

    let shouldOptimise = $state(true);
    let recentlyCopied = $state(false);

    let finalOutput = $derived(editor ? convert(tiptapJSON, shouldOptimise) : "Loading...");

    async function loadData() {
        if (localStorage.getItem("content")) {
            tiptapJSON = JSON.parse(localStorage.getItem("content")!);
        } else {
            tiptapJSON = [];
            localStorage.setItem("content", "[]");
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

        appSettings.subscribe(() => {
            var el = document.querySelector(".tiptap") as HTMLElement
            if ($appSettings.realisticLineHeight == true) {
                el.style.lineHeight = "1rem"
            } else {
                el.style.lineHeight = "1.75rem "
            }
        })
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });

    const debounce = (callback: (...args: any[]) => void, wait: number) => {
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

    function modifierPressed(event: KeyboardEvent) {
        return navigator.platform.startsWith("Mac") || navigator.platform.includes("iPhone")
            ? event.metaKey
            : event.ctrlKey;
    }

    function clearMarksHandler(event: KeyboardEvent) {
        if (modifierPressed(event) && event.shiftKey && event.key === "X") {
            editor!.commands.unsetAllMarks();
        }
    }

    function removeAllNodes(type: string) {
        if (!editor) {
            return;
        }
        let editorJson = editor.getJSON();
        editorJson.content.forEach((paragraph) => {
            if (paragraph.content) {
                paragraph.content = paragraph.content.filter((node) => node.type !== type);
            }
        });

        editor?.commands.setContent(editorJson);
        tiptapJSON = editorJson;
    }

    let versionPopupConfirmationVisible = $state(false);
    let temporaryVersionConfirmation: Version | undefined = $state();

    function updateOutputVersion(version: Version | undefined, confirm = false) {
        if (!version) {
            return;
        }

        if ($outputVersion.index > version.index && confirm === false) {
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
            removeAllNodes("atlas_object");
            removeAllNodes("player_object");
        }

        tiptapJSON = editor!.getJSON();
    }

</script>

<svelte:window onkeydown={clearMarksHandler} />

<main class="flex h-screen max-h-screen flex-col">
    <TopUI {editor} {outputDialog} />

    <ControlBar {editor} />

    <div
        class="font-minecraft w-full grow overflow-auto bg-zinc-800 first:focus:outline-none"
        spellcheck="false"
        id="wysiwyg-box"
        bind:this={element}>
    </div>

    <div>
        {#if page.url.searchParams.has("dev")}
            <code class="inline-block overflow-x-scroll p-3 text-xs"
                >DEV ONLY: {tiptapJSON ? JSON.stringify(tiptapJSON) : "Loading..."}</code>
            <br />
        {/if}
        <div class="bg-zinc-950 p-3">
            <div class="flex max-h-48 max-w-screen items-start space-x-2 overflow-auto">
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
                    {#if $appSettings.syntaxHighlight}
                    <Highlight language={typescript} code={finalOutput} />
                    {:else}
                    <pre class="inline break-all whitespace-pre-wrap">{editor
                        ? finalOutput
                        : "Loading..."}</pre>
                    {/if}
                </code>
            </div>
            <div class="mt-2 flex items-center space-x-2 select-none">
                <p class="font-lexend text-xs text-white/60 nomob">click to change output settings:</p>

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
                                            >Changing to an earlier version could remove some
                                            elements of your text that are unsupported in this
                                            version.</span>
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

                {#if $appSettings.showCharacterCount}
                <p class="font-lexend nomob text-xs text-white/60">•</p>

                <p class="font-lexend nomob text-xs text-white/60">
                    {finalOutput.length} characters
                </p>
                {/if}
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
                        This is a /tellraw editor and editor for Minecraft text components, for all
                        versions. Create /tellraw commands and text components (JSON text) for
                        Minecraft Java Edition with our easy-to-use, modern online tool!
                    </p>
                    <div class="flex flex-col rounded-md bg-red-500/50 p-3">
                        <b class="text-lg">⚠️ This website requires JavaScript to work.</b>
                        <span class="text-sm"
                            >Please enable JavaScript in your site settings. If JavaScript is
                            enabled, please refresh. If that doesn't work, then try a different
                            browser. If that still doesn't work, then ask for help in <a
                                href="https://discord.datapackhub.net/"
                                class="font-bold underline">our Discord</a
                            ></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</noscript>

{#await import("$lib/components/modals/topbar/ExportModal.svelte") then modal}
    <modal.default bind:outputDialog {editor} {recentlyCopied} />
{/await}
