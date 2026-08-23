<script lang="ts">
    import type { Editor } from "@tiptap/core";
    import IconUndo from "~icons/tabler/arrow-back-up";
    import IconRedo from "~icons/tabler/arrow-forward-up";
    import IconGradient from "~icons/tabler/contrast-2";
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
    import IconUploadImage from "~icons/tabler/photo-scan";
    import Modal from "../Modal.svelte";
    import TextStyleButtons from "./TextStyleButtons.svelte";
    import ToolbarButton from "./ToolbarButton.svelte";
    import { colourMap, getNodeAtSelection, sourceKeys } from "$lib/text/utils";
    import { tooltip } from "$lib/tooltip";
    import MiniEditor from "../text/MiniEditor.svelte";
    import ColorPicker from "svelte-awesome-color-picker";

    const { editor }: { editor: Editor | undefined } = $props();

    let colour = $state("#ffffff");
    let colourDialog: Modal = $state()!;

    let gradientDialog: Modal = $state()!;

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
    let insertImageDialog: Modal = $state()!;

    function toTitleCase(str: string) {
        return str.replace(
            /\w\S*/g,
            (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
        );
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
            JSON.stringify(sameHoverEventMark(start - 1)?.attrs) === JSON.stringify(mark.attrs)
        ) {
            start--;
        }
        // Expand right
        while (
            end < doc.content.size &&
            JSON.stringify(sameHoverEventMark(end)?.attrs) === JSON.stringify(mark.attrs)
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
            JSON.stringify(sameClickEventMark(start - 1)?.attrs) === JSON.stringify(mark.attrs)
        ) {
            start--;
        }
        // Expand right
        while (
            end < doc.content.size &&
            JSON.stringify(sameClickEventMark(end)?.attrs) === JSON.stringify(mark.attrs)
        ) {
            end++;
        }

        editor!.chain().focus().setTextSelection({ from: start, to: end }).run();
        const { action, value } = mark.attrs;
        clickEventType = action;
        clickEventValue = value;
        clickEventDialog!.open();
    }

    function customColourHandler() {
        editor?.chain().focus().setColor(colour).run();
        colourDialog?.close();
    }
</script>

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
            {colour}
            Icon={IconColor}
            {@attach tooltip}
            onClick={colourDialog.open}
            ariaLabel="Custom Color" />

        <ToolbarButton
            Icon={IconGradient}
            onClick={gradientDialog.open}
            ariaLabel="Color Gradient" />
        <div id="colorBtns" class="mx-1 flex items-center space-x-0">
            {#each colourMap as colour}
                <button
                    aria-label={toTitleCase(colour.name.replace("_", " "))}
                    onclick={() => editor!.chain().focus().setColor(colour.value).run()}
                    {@attach tooltip}
                    style="color: {colour.value || 'inherit'}"
                    class="rounded-md px-0 py-1 text-lg font-medium hover:bg-white/3 {editor.isActive(
                        'textStyle',
                        { color: colour.value },
                    )
                        ? ' bg-zinc-800'
                        : ''}">
                    <IconSquare />
                </button>
            {/each}
        </div>
        {#if editor.getAttributes("textStyle").color}
            <button
                onclick={() => editor?.chain().focus().unsetColor().run()}
                data-testid="unset-color-button"
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
                : ''} toolbar-btn {editor.isActive('hoverEvent') ? 'bg-zinc-800' : ''}"
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

        <ToolbarButton onClick={() => editor?.commands.undo()} ariaLabel="Undo" Icon={IconUndo} />
        <ToolbarButton onClick={() => editor?.commands.redo()} ariaLabel="Redo" Icon={IconRedo} />

        <div class="grow"></div>

        <ToolbarButton
            onClick={insertImageDialog?.open}
            ariaLabel="Insert Image"
            Icon={IconUploadImage}
            desktopOnly />
        <ToolbarButton
            onClick={keybindDialog?.open}
            ariaLabel="Keybinds"
            Icon={IconKeybinds}
            desktopOnly />
    {/if}
</div>

{#await import("$lib/components/modals/ClickEventModal.svelte") then modal}
    <modal.default bind:clickEventDialog bind:clickEventType bind:clickEventValue {editor} />
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
        class="btn">
        Add Hover Event
    </button>
</Modal>

{#await import("$lib/components/modals/CustomSourceModal.svelte") then modal}
    <modal.default bind:customDialog bind:customType {editor} />
{/await}

{#await import("$lib/components/modals/InsertImageModal.svelte") then modal}
    <modal.default bind:insertImageDialog {editor} />
{/await}

<Modal title="Custom Colour" bind:this={colourDialog} small nopad key="C">
    <div class="flex w-full flex-col py-4">
        <ColorPicker
            bind:hex={colour}
            --cp-bg-color="transparent"
            --cp-border-color="transparent"
            --cp-text-color="white"
            --cp-input-color="#18181b"
            --cp-button-hover-color="#18181b"
            isDialog={false}
            isAlpha={false} />

        <button onclick={customColourHandler} class="btn mx-4"> Done </button>
    </div>
</Modal>

{#await import("$lib/components/modals/FontPickerModal.svelte") then modal}
    <modal.default bind:fontDialog {fontUploadModal} editor={editor!} bind:fontName />
{/await}

{#await import("$lib/components/modals/KeybindModal.svelte") then modal}
    <modal.default bind:keybindDialog />
{/await}
{#await import("$lib/components/modals/FontUploadModal.svelte") then modal}
    <modal.default bind:fontUploadModal />
{/await}

{#await import("$lib/components/modals/ColorGradientModal.svelte") then modal}
    <modal.default {editor} bind:gradientDialog />
{/await}
{#await import("$lib/components/modals/UnicodeSelectorModal.svelte") then modal}
    <modal.default editor={editor!} bind:unicodeSelectorDialog />
{/await}
