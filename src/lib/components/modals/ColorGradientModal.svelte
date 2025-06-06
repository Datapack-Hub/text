<script lang="ts">
	import Modal from "$lib/Modal.svelte";
	import { applyGradient } from "$lib/tiptap/text";
	import ColorPicker from "svelte-awesome-color-picker";

	import IconDelete from "~icons/tabler/trash";
	import IconCustom from "~icons/tabler/plus";

	let {
		gradientDialog = $bindable(),
		gradientSteps = $bindable(),
		editor,
	} = $props();
</script>

<Modal title="Color Gradient" bind:this={gradientDialog}>
	<div class="flex flex-col w-full space-y-2">
		<p>Add colours to the gradient below:</p>
		<div class="flex flex-col space-y-1">
			{#each gradientSteps ?? [] as _,i}
				<div class="bg-zinc-900 w-full rounded-md p-2 flex items-center">
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
						class="bg-zinc-900 p-2 rounded-md w-fit cursor-pointer hover:bg-black/20 h-9 aspect-square flex items-center justify-center">
						<IconDelete />
					</button>
				</div>
			{/each}
			<button
				onclick={() => {
					gradientSteps.push("#ffffff");
					gradientSteps = gradientSteps;
				}}
				class="bg-zinc-900 p-2 rounded-md cursor-pointer hover:bg-black/50 aspect-square h-9 w-9">
				<IconCustom class="m-auto" />
			</button>
		</div>
		<button
			onclick={() => {
				applyGradient(editor, gradientSteps);
				gradientDialog.close();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit cursor-pointer hover:bg-black/50">
			Apply Gradient
		</button>
	</div>
</Modal>
