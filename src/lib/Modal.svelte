<script lang="ts">
	import IconClose from "~icons/tabler/x";

	export let opened = false;
	export let title = "Modal";
	export let small = false;
	export let nopad = false;
	export let big = false;

	export function open() {
		opened = true;
	}

	export function close() {
		opened = false;
	}
</script>

<div class="absolute {opened ? "" : "hidden"}">
	<div
		class="fixed top-0 left-0 w-screen h-screen bg-black/65 flex flex-col items-center text-zinc-100 overflow-auto"
		style="font-family: Lexend">
		<div class="{small ? "w-fit" : "w-[95%] md:w-[50%] 2xl:w-[30%]"} {big ? "w-[95%]!" : ""} m-auto py-4">
			<div class="rounded-t-lg p-4 bg-zinc-900 flex items-center">
				<span class="font-bold text-lg flex-grow">{title}</span>
				<button on:click={close}><IconClose /></button>
			</div>
			<div class="rounded-b-lg {nopad ? "" : "p-4"} bg-zinc-800 flex flex-col space-y-1">
				<slot />
			</div>
		</div>
	</div>
</div>
