<script lang="ts">
	import IconClose from "~icons/tabler/x";

	let {
		opened = $bindable(false),
		title = $bindable("Modal"),
		small = $bindable(false),
		nopad = $bindable(false),
		big = $bindable(false),
		flexible = $bindable(false),
		children,
		key,
	} = $props();

	export function open() {
		opened = true;
	}

	export function close() {
		opened = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && opened) {
			close();
		}

		if (event.shiftKey && event.ctrlKey && event.key === key) {
			event.preventDefault();
			open();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="absolute {opened ? '' : 'hidden'}">
	<div
		class="fixed top-0 left-0 flex h-screen w-screen flex-col items-center overflow-auto bg-black/65 text-zinc-100"
		style="font-family: Lexend">
		<div
			onclick={() => close()}
			class="fixed top-0 left-0 h-screen w-screen"
			style="z-index: 40; background: transparent;"
			aria-hidden="true"
			tabindex="-1"
			hidden={!opened}>
		</div>
		<div
			class="z-50 {small ? 'w-fit' : 'w-[95%] md:w-[50%] 2xl:w-[30%]'} {big
				? 'w-[95%]!'
				: ''} {flexible ? 'w-fit! max-w-[95%]' : ''} m-auto py-4">
			<div class="rounded-t-lg p-4 bg-zinc-900 flex items-center">
				<span class="font-bold text-lg flex-grow">{title}</span>
				<button aria-label="close" onclick={close}><IconClose /></button>
			</div>
			<div
				class="rounded-b-lg {nopad
					? ''
					: 'p-4'} flex flex-col space-y-1 bg-zinc-800">
				{@render children()}
			</div>
		</div>
	</div>
</div>
