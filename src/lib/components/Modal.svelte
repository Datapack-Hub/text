<script lang="ts">
	import { tick } from "svelte";
	import IconClose from "~icons/tabler/x";

	type Props = {
		key?: string;
		[key: string]: any;
	};

	let {
		opened = $bindable(false),
		title = $bindable("Modal"),
		small = $bindable(false),
		nopad = $bindable(false),
		big = $bindable(false),
		flexible = $bindable(false),
		children,
		key,
	}: Props = $props();

	export async function open() {
		opened = true;
		await tick();
	}

	export async function close() {
		opened = false;
		await tick();
	}

	function modifierPressed(event: KeyboardEvent) {
		return navigator.platform.startsWith("Mac") ||
			navigator.platform.includes("iPhone")
			? event.metaKey
			: event.ctrlKey;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!key) {
			return;
		}

		if (event.key === "Escape" && opened) {
			close();
		}

		if (event.shiftKey && modifierPressed(event) && event.key === key) {
			event.preventDefault();
			open();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if opened}
	<div class="absolute {opened ? '' : 'hidden'}">
		<div
			class="fixed top-0 left-0 flex h-screen w-screen flex-col items-center overflow-auto bg-black/65 text-zinc-100"
			style="font-family: Lexend">
			<div
				aria-hidden="true"
				onclick={() => close()}
				class="fixed top-0 left-0 z-40 h-screen w-screen bg-transparent"
				tabindex="-1"
				hidden={!opened}>
			</div>
			<div
				class="z-50 {small ? 'w-fit' : 'w-[95%] md:w-[50%] 2xl:w-[30%]'} {big
					? 'w-[95%]!'
					: ''} {flexible ? 'w-fit! max-w-[95%]' : ''} m-auto py-4">
				<div class="flex items-center rounded-t-lg bg-zinc-900 p-4">
					<span class="grow text-lg font-bold">{title}</span>
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
{/if}
