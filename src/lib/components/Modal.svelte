<script lang="ts">
	import IconClose from "~icons/tabler/x";

	type Props = {
		key?: string;
		[key: string]: any;
	};

	let dialog: HTMLDialogElement = $state()!;

	let {
		title = $bindable("Modal"),
		small = $bindable(false),
		nopad = $bindable(false),
		big = $bindable(false),
		flexible = $bindable(false),
		children,
		key,
	}: Props = $props();

	export function open() {
		dialog.showModal();
	}

	export function close() {
		dialog.close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!key) {
			return;
		}
		if (event.key === "Escape" && dialog.open) {
			close();
		}

		if (event.shiftKey && event.ctrlKey && event.key === key) {
			event.preventDefault();
			open();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<dialog
	bind:this={dialog}
	id={title}
	onclick={(e) => e.target === dialog && close()}
	class="fixed top-0 left-0 z-50 {small
		? 'w-fit'
		: 'w-[95%] md:w-[50%] 2xl:w-[30%]'} {big ? 'w-[95%]!' : ''} {flexible
		? 'w-fit! max-w-[95%]'
		: ''} m-auto bg-transparent text-zinc-100 backdrop:bg-black/65">
		<div class="flex items-center justify-center h-[90vh] flex-col">
			<div class="flex items-center rounded-t-lg bg-zinc-900 p-4 w-full">
				<span class="flex-grow text-lg font-bold">{title}</span>
				<button aria-label="close" onclick={close}><IconClose /></button>
			</div>
			<div
				class="rounded-b-lg {nopad
					? ''
					: 'p-4'} bg-zinc-800 w-full">
				{@render children()}
			</div>
		</div>
</dialog>
<!-- <div class="absolute {opened ? '' : 'hidden'}">
	<div
		class="fixed top-0 left-0 flex h-screen w-screen flex-col items-center overflow-auto bg-black/65 text-zinc-100"
		style="font-family: Lexend">
	</div>
</div> -->
