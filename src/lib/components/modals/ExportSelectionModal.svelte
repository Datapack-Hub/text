<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { Editor } from "@tiptap/core";
    import Key from "../Key.svelte";
    import MiniRenderer from "../text/MiniRenderer.svelte";
    import { appSettings } from "$lib/settings";
    import { convert } from "$lib/text/nbt/export";
    import { json, typescript } from "svelte-highlight/languages";
    import Highlight from "svelte-highlight";

    import IconCopy from "~icons/tabler/copy";
    import IconCheck from "~icons/tabler/check";
    import CheckBox from "../CheckBox.svelte";

    let recentlyCopied: boolean = $state(false);
    let jsonOutput: boolean = $state(false);

    let {
        exportSelectionDialog = $bindable(),
        editor,
        shouldOptimise = true,
    }: {
        exportSelectionDialog: Modal;
        editor: Editor;
        shouldOptimise: boolean;
    } = $props();

    let value: object = $state({});

    function onOpen() {
        let content = editor.state.doc
            .slice(editor.state.selection.from, editor.state.selection.to)
            .content.toJSON();

        // Fix if only one line
        if (content[0].type !== "paragraph") {
            content = [
                {
                    type: "paragraph",
                    content: content,
                },
            ];
        }

        // If last paragraph is empty, remove
        if (content.length > 0 && !("content" in content[content.length - 1])) {
            content.pop();
        }

        // Format in document
        value = {
            type: "doc",
            content: content,
        };
    }
</script>

<Modal title="Export selection" bind:this={exportSelectionDialog} key="Q" {onOpen}>
    <div class="flex w-full flex-col space-y-1">
        {#key value}
            <p class="w-full">Selected text:</p>
            <div class="rounded-md bg-zinc-900 px-1">
                <MiniRenderer {value} />
            </div>

            <p class="mt-2 w-full">Output:</p>
            <code class="max-h-56 w-full space-x-3 overflow-auto rounded-lg bg-zinc-950 p-3">
                {#if $appSettings.syntaxHighlight}
                    <Highlight
                        language={jsonOutput ? json : typescript}
                        code={convert(value, shouldOptimise, "standard", jsonOutput)} />
                {:else}
                    <pre class="inline break-all whitespace-pre-wrap">
                {editor ? convert(value, shouldOptimise, "standard", jsonOutput) : "Loading..."}
            </pre>
                {/if}
            </code>

            <div class="mt-1 mb-2 flex items-center space-x-2">
                <CheckBox label="bg" bind:value={jsonOutput} />
                <label for="bg">JSON output</label>
            </div>

            <button
                class="btn flex items-center space-x-2"
                onclick={() => {
                    navigator.clipboard.writeText(convert(value, shouldOptimise));
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
        {/key}
    </div>
</Modal>
