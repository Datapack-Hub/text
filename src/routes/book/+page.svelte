<script lang="ts">
    import { page } from "$app/state";
    import Modal from "$lib/components/Modal.svelte";
    import BookMiniRenderer from "$lib/components/text/BookMiniRenderer.svelte";
    import ControlBar from "$lib/components/toolbar/Toolbar.svelte";
    import TopUI from "$lib/components/TopUI.svelte";
    import WelcomeScreen from "$lib/components/WelcomeScreen.svelte";
    import { openDataStore } from "$lib/db";
    import { appSettings } from "$lib/settings";
    import { outputVersion } from "$lib/settings";
    import { convert } from "$lib/text/nbt/export";
    import { ExportButtonExtension } from "$lib/tiptap/extensions/ExportButton";
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
    import { tooltip } from "$lib/tooltip";
    import { versions, type Version } from "$lib/types";
    import { Editor, type JSONContent } from "@tiptap/core";
    import Color from "@tiptap/extension-color";
    import Placeholder from "@tiptap/extension-placeholder";
    import StarterKit from "@tiptap/starter-kit";
    import { onDestroy, onMount } from "svelte";
    import { Highlight } from "svelte-highlight";
    import typescript from "svelte-highlight/languages/typescript";

    import IconTick from "~icons/tabler/check";
    import IconCopy from "~icons/tabler/copy";
    import IconAdd from "~icons/tabler/plus";
    import IconDelete from "~icons/tabler/trash";
    import IconSettings from "~icons/tabler/settings";
    import IconUp from "~icons/tabler/chevron-up";
    import IconDown from "~icons/tabler/chevron-down";

    let currentTiptapJSON: JSONContent = $state()!;
    let pageJSONs: JSONContent[] = $state([{ type: "doc", content: [] }]);
    let currentPageIndex: number = $state(0);

    let element: HTMLElement = $state()!;
    let editor: Editor | undefined = $state()!;

    let versionPopup: boolean = $state(false);

    let shouldOptimise = $state(true);
    let recentlyCopied = $state(false);

    let exportSelectionDialog: Modal = $state()!;
    let bookDetailsDialog: Modal = $state()!;

    let versionPopupConfirmationVisible = $state(false);
    let temporaryVersionConfirmation: Version | undefined = $state();

    let welcomeScreenVisible = $state(false);

    let title = $state("Title");
    let author = $state("Author");

    async function loadData() {
        if (localStorage.getItem("book_content")) {
            pageJSONs = JSON.parse(localStorage.getItem("book_content")!);
            currentTiptapJSON = pageJSONs[0];
        } else {
            pageJSONs = [
                {
                    type: "doc",
                    content: [],
                },
            ];
            currentTiptapJSON = [];
            localStorage.setItem("book_content", "[]");
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
            content: currentTiptapJSON,
            editorProps: {
                attributes: {
                    class: "tiptap-book",
                },
            },
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
                ExportButtonExtension.configure({
                    onClick: () => {
                        exportSelectionDialog.open();
                    },
                }),
            ],
            onTransaction: ({ editor: newEditor }) => {
                editor = undefined;
                editor = newEditor;
            },
            onUpdate: ({ editor }) => {
                currentTiptapJSON = editor.getJSON();
                pageJSONs[currentPageIndex] = currentTiptapJSON;
                debounce(saveContent, 1000)();
            },
        });
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
        localStorage.setItem("book_content", JSON.stringify(pageJSONs));
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
        currentTiptapJSON = editorJson;
    }

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

        currentTiptapJSON = editor!.getJSON();
    }

    function pageKeyDownHandler(event: KeyboardEvent, index: number) {
        if (event.key === "Enter" || event.key === " ") {
            currentPageIndex = index;
            editor?.commands.setContent(pageJSONs[index]);
        }
    }
</script>

<svelte:window onkeydown={clearMarksHandler} />

<main class="flex h-screen max-h-screen flex-col items-center">
    <TopUI
        bind:pages={pageJSONs}
        bind:pageIndex={currentPageIndex}
        {editor}
        {welcomeScreenVisible} />

    <!-- <div class="w-full bg-red-700 p-2 text-sm font-bold">
        (BETA) The book editor is in active development. Report bugs and expect incomplete/broken
        features (also keep backups!).
    </div> -->
    <ControlBar {editor} />

    <!-- input box(es) -->
    <div class="flex h-0 w-full grow">
        <div
            id="page-box"
            class="flex h-[calc(100vh-11rem )] w-80 flex-col items-center overflow-y-scroll p-2">
            <div class="flex w-full pl-2 items-center space-x-2">
                <span class="font-bold grow">Book Pages</span>
                <button
                    {@attach tooltip}
                    aria-label="Book Details"
                    onclick={() => bookDetailsDialog?.open()}
                    class="btn"><IconSettings /></button>
            </div>
            {#key pageJSONs}
            {#each pageJSONs as page, index}
                <div class="w-55 p-2">
                    <div
                        role="button"
                        tabindex="0"
                        onkeydown={(event) => pageKeyDownHandler(event, index)}
                        onclick={() => {
                            currentPageIndex = index;
                            editor?.commands.setContent(pageJSONs[index]);
                        }}
                        class="page-preview {currentPageIndex != index ? 'opacity-60' : ''}">
                        <div
                            class="font-minecraft text-book h-61 overflow-clip px-6 pt-11 leading-3.5 wrap-break-word">
                            <BookMiniRenderer value={page} />
                        </div>
                    </div>
                    <div class="mt-1 px-2 flex w-full items-center gap-2">
                        <p class="text-left grow">{index + 1} of {pageJSONs.length}</p>
                        {#if index > 0}
                        <button
                            onclick={() => {
                                if(index == currentPageIndex) currentPageIndex -= 1;
                                else if(index - 1 == currentPageIndex) currentPageIndex += 1;
                                pageJSONs.splice(index - 1, 0, pageJSONs.splice(index, 1)[0]);
                                saveContent();
                            }}
                            {@attach tooltip}
                            aria-label="Add new page below"
                            class="py-0.5">
                            <IconUp />
                        </button>
                        {/if}
                        {#if index + 1 < pageJSONs.length}
                        <button
                            onclick={() => {
                                if(index == currentPageIndex) currentPageIndex += 1;
                                else if(index + 1 == currentPageIndex) currentPageIndex -= 1;
                                pageJSONs.splice(index + 1, 0, pageJSONs.splice(index, 1)[0]);
                                saveContent();
                            }}
                            {@attach tooltip}
                            aria-label="Add new page below"
                            class="py-0.5">
                            <IconDown />
                        </button>
                        {/if}
                        <button
                            onclick={() => {
                                pageJSONs.splice(index + 1, 0, {
                                    type: "doc",
                                    content: [],
                                });
                                saveContent();
                            }}
                            {@attach tooltip}
                            aria-label="Add new page below"
                            class="py-0.5">
                            <IconAdd />
                        </button>
                        {#if pageJSONs.length != 1}
                        <button
                            onclick={() => {
                                pageJSONs.splice(index, 1);
                                currentPageIndex = Math.max(0, currentPageIndex - 1);
                                editor?.commands.setContent(pageJSONs[currentPageIndex]);
                                saveContent();
                            }}
                            {@attach tooltip}
                            aria-label="Delete this page"
                            class="py-0.5">
                            <IconDelete />
                        </button>
                        {/if}
                    </div>
                </div>
            {/each}
            {/key}
        </div>
        <div class="h-full w-full grow overflow-auto bg-zinc-800 border-l border-zinc-700">
            <div class="book-img m-3">
                <div
                    class="font-minecraft w-full grow overflow-clip first:focus:outline-none"
                    spellcheck="false"
                    id="wysiwyg-box"
                    bind:this={element}>
                </div>
            </div>
        </div>
    </div>

    <!-- output box(es) -->
    {#if page.url.searchParams.has("dev")}
        <code class="inline-block overflow-x-scroll p-3 text-xs"
            >DEV ONLY: {currentTiptapJSON
                ? JSON.stringify(currentTiptapJSON)
                : "Loading..."}</code>
        <br />
    {/if}
    <div class="w-screen bg-zinc-950 p-3 border-t border-zinc-700">
        <div class="flex max-h-32 items-start space-x-2 overflow-auto">
            <button
                {@attach tooltip}
                class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
                onclick={() => {
                    navigator.clipboard.writeText(
                        `[written_book_content={pages:[${pageJSONs.map((j) => [convert(j, shouldOptimise)])}],title:"${title}",author:"${author}"}]`,
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
            <code id="outputbox">
                <!-- {editor ? translateMOTD(tiptapJSON) : "Loading..."} -->
                {#if $appSettings.syntaxHighlight}
                    <Highlight
                        language={typescript}
                        code={`[written_book_content={pages:[${pageJSONs.map((j) => [convert(j, shouldOptimise)])}],title:"${title}",author:"${author}"}]`} />
                {:else}
                    <pre class="inline break-all whitespace-pre-wrap">{editor
                            ? `[written_book_content={pages:[${pageJSONs.map((j) => [convert(j, shouldOptimise)])}],title:"${title}",author:"${author}"}]`
                            : "Loading..."}</pre>
                {/if}
            </code>
        </div>
        <div class="mt-2 flex items-center space-x-2 select-none">
            <p class="font-lexend nomob text-xs text-white/60">
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

            {#if $appSettings.showCharacterCount}
                <p class="font-lexend nomob text-xs text-white/60">•</p>

                <p class="font-lexend nomob text-xs text-white/60">
                    <!-- TODO: account for title and author -->
                    {pageJSONs.map((j) => [convert(j, shouldOptimise)]).join(",").length +
                        title.length +
                        author.length} characters
                </p>
            {/if}
        </div>
    </div>
</main>

<WelcomeScreen bind:visible={welcomeScreenVisible} />

{#await import("$lib/components/modals/ExportSelectionModal.svelte") then modal}
    <modal.default bind:exportSelectionDialog editor={editor!} {shouldOptimise} />
{/await}

{#await import("$lib/components/modals/BookDetailsModal.svelte") then modal}
    <modal.default bind:bookDetailsDialog bind:title bind:author />
{/await}
