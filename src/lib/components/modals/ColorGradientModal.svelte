<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import type { Editor } from "@tiptap/core";
    import { onMount } from "svelte";
    import ColorPicker from "svelte-awesome-color-picker";
    import Sortable from "sortablejs"
    import { generateGradient } from "typescript-color-gradient";

    import IconCustom from "~icons/tabler/plus";
    import IconDelete from "~icons/tabler/trash";
    import IconHandle from "~icons/tabler/grip-vertical"
    import IconRecent from "~icons/tabler/clock-hour-4"
    import IconCircle from "~icons/tabler/circle-filled"
    import IconBack from "~icons/tabler/arrow-back-up";

    let recentsPageOpen: boolean = $state(false)
    let recentGradients: Array<string[]> = $state([])

    function openRecentsPage() {
        if (localStorage.getItem("recent_gradients")) {
            recentGradients = JSON.parse(localStorage.getItem("recent_gradients")!);
        } else {
            recentGradients = [];
            localStorage.setItem("recent_gradients", "[]");
        }
        recentsPageOpen = true;
    }

    let { gradientDialog = $bindable(), gradientSteps = $bindable(), editor } = $props();
    let sortContainer: HTMLDivElement | undefined = $state();

    function applyGradient(editor: Editor, gradientColors: string[]) {
        const { from, to } = editor.state.selection;
        if (from === to) return;

        const doc = editor.state.doc;
        let text = "";
        let textPositions: { pos: number; len: number }[] = [];

        // Collect all text and their positions in the selection
        doc.nodesBetween(from, to, (node, pos) => {
            if (node.isText) {
                const nodeStart = Math.max(from, pos);
                const nodeEnd = Math.min(to, pos + node.text!.length);
                const sliceStart = nodeStart - pos;
                const sliceEnd = nodeEnd - pos;
                const part = node.text?.slice(sliceStart, sliceEnd) ?? "";
                if (part.length > 0) {
                    text += part;
                    textPositions.push({ pos: nodeStart, len: part.length });
                }
            }
        });
        if (text.length === 0) return;

        const total = text.length;
        if (total === 0 || gradientColors.length < 2) return;

        const gradientArray = generateGradient(gradientColors, total);

        let chain = editor.chain();

        // Remove color from selection first
        chain.focus().setTextSelection({ from, to }).unsetColor();

        let charIndex = 0;
        for (const { pos, len } of textPositions) {
            for (let i = 0; i < len; i++) {
                const color = gradientArray[charIndex];
                chain.setTextSelection({ from: pos + i, to: pos + i + 1 }).setColor(color);
                charIndex++;
            }
        }
        chain.focus().setTextSelection({ from, to });

        chain.run();

        // Add to recents if nevessary
        if (recentGradients.includes(gradientSteps)) {
            recentGradients = recentGradients.filter(grad => grad !== gradientSteps)
        }
        
        recentGradients.push(gradientSteps)

        if (recentGradients.length > 10) {
            recentGradients.shift()
        }

        localStorage.setItem("recent_gradients", JSON.stringify(recentGradients));
    }

    function opened(){
        recentsPageOpen = false

        // Load recent gradients 
        if (localStorage.getItem("recent_gradients")) {
            recentGradients = JSON.parse(localStorage.getItem("recent_gradients")!);
        } else {
            recentGradients = [];
            localStorage.setItem("recent_gradients", "[]");
        }

        // Create sortable
        Sortable.create(sortContainer, {
            animation: 200,
            handle: ".handle",
            onEnd: (evt: Sortable.SortableEvent): void => {
				const { oldIndex, newIndex } = evt;
				if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
					return;
				}
				const updatedSteps: string[] = [...gradientSteps];
				const [movedItem]: string[] = updatedSteps.splice(oldIndex, 1);
				updatedSteps.splice(newIndex, 0, movedItem);
				gradientSteps = updatedSteps;
            }
        })
    }
</script>

<Modal title="Color Gradient" bind:this={gradientDialog} onOpen={opened} key="G">
    <div class="flex w-full flex-col space-y-1">
    {#if !recentsPageOpen}
        <p>Add colours to the gradient below:</p>
        <div class="flex flex-col space-y-1" bind:this={sortContainer}>
            {#key gradientSteps}
            {#each gradientSteps ?? [] as _, i}
                <div class="flex w-full items-center rounded-md bg-zinc-900 p-2">
                    <IconHandle class="handle cursor-move text-zinc-500" />
                    <div class="grow">
                        <ColorPicker
                            bind:hex={gradientSteps[i]}
                            position="responsive"
                            --cp-bg-color="#18181b"
                            --cp-text-color="white"
                            --cp-input-color="#0C0C0E"
                            --cp-button-hover-color="#18181b"
                            textInputModes={["hex"]}
                            isAlpha={false} />
                    </div>
                    {#if gradientSteps.length > 1}
                        <button
                            onclick={() => {
                                gradientSteps.splice(i, 1);
                                gradientSteps = gradientSteps;
                            }}
                            class="flex aspect-square h-9 w-fit items-center justify-center rounded-md bg-zinc-900 p-2 hover:bg-black/20">
                            <IconDelete />
                        </button>
                    {/if}
                </div>
            {/each}
            {/key}
        </div>
        <div class="flex space-x-2 justify-between">
            <button
                onclick={() => {
                    gradientSteps.push("#ffffff");
                    gradientSteps = gradientSteps;
                }}
                class="aspect-square h-9 w-9 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
                <IconCustom class="m-auto" />
            </button>
        </div>
        <p class="mt-2">Preview</p>
        <div class="font-minecraft bg-zinc-950 px-4 py-2 text-2xl rounded-md">
            <span
                style="background: -webkit-linear-gradient(0, {gradientSteps.join(
                    ',',
                )}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
                >{editor?.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to,
                    " ",
                ) || "error! no text selected"}</span>
        </div>

        <p class="text-sm text-white/60">
            <b>Note:</b> you need to select text in the editor before you try and apply a gradient.
        </p>

        <div class="flex items-center justify-between mt-2">
            <button
                onclick={() => {
                    applyGradient(editor, gradientSteps);
                    gradientDialog.close();
                }}
                class="btn">
                Apply Gradient
            </button>
            
            <button
                onclick={openRecentsPage}
                class="btn flex items-center space-x-1">
                <IconRecent />
                <span>Recent gradients</span>
            </button>
        </div>
    {:else}
        <div class="flex items-center">
            <p class="grow">Your top 10 most recent gradients are shown below:</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            {#each recentGradients ?? [] as gradient}
            <div class="flex space-x-1 items-center">
                <div class="flex w-full items-center space-x-2 rounded-md bg-zinc-900 p-2">
                    <!-- <span>Colours: </span> -->
                    <div class="flex grow items-center space-x-1">
                        {#each gradient ?? [] as step}
                        <IconCircle class="text-xl" style={"color: " + step + ";"} />
                        {/each}
                    </div>
                </div>
                <button class="btn" onclick={() => {
                    gradientSteps = gradient;
                    opened()
                }}>Use</button>
            </div>
            {/each}
        </div>
        
        <button
            onclick={() => (recentsPageOpen = false)}
            class="mt-2 flex h-full w-fit cursor-pointer items-center space-x-2 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
            <IconBack />
            <span>Back</span>
        </button>   

    {/if}
    </div>
</Modal>
