<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";
	import { applyGradient } from "$lib/text/general";
	import ColorPicker from "svelte-awesome-color-picker";

	import IconDelete from "~icons/tabler/trash";
	import IconCustom from "~icons/tabler/plus";

	let {
		gradientDialog = $bindable(),
		gradientSteps = $bindable(),
		editor,
	} = $props();
</script>

<Modal title="Color Gradient" bind:this={gradientDialog} key="G">
	<div class="flex w-full flex-col space-y-2">
		<p>Add colours to the gradient below:</p>
		<div class="flex flex-col space-y-1">
			{#each gradientSteps ?? [] as _, i}
				<div class="flex w-full items-center rounded-md bg-zinc-900 p-2">
					<div class="flex-grow">
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
					<button
						onclick={() => {
							gradientSteps.splice(i, 1);
							gradientSteps = gradientSteps;
						}}
						class="flex aspect-square h-9 w-fit items-center justify-center rounded-md bg-zinc-900 p-2 hover:bg-black/20">
						<IconDelete />
					</button>
				</div>
			{/each}
			<button
				onclick={() => {
					gradientSteps.push("#ffffff");
					gradientSteps = gradientSteps;
				}}
				class="aspect-square h-9 w-9 rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				<IconCustom class="m-auto" />
			</button>
		</div>
		<p class="my-2">Preview</p>
		<div class="bg-zinc-950 px-4 py-2 font-minecraft text-2xl">
			<span style="background: -webkit-linear-gradient(0, {gradientSteps.join(",")}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Example text</span>
		</div>
		<button
			onclick={() => {
				applyGradient(editor, gradientSteps);
				gradientDialog.close();
			}}
			class="w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Apply Gradient
		</button>
	</div>
</Modal>
