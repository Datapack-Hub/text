<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";
	import { outputVersion } from "$lib/stores";
	import { translateMOTD } from "$lib/text/motd";
	import { convert } from "$lib/text/nbt/nbt_or_json";
	import IconCopy from "~icons/tabler/copy";
	import CheckBox from "../CheckBox.svelte";
	let {
		outputDialog = $bindable(),
		editor,
		recentlyCopied,
		shouldOptimise = true,
	} = $props();

	let exportAsJSON = $state(false);
</script>

<Modal title="More output formats" bind:this={outputDialog} big key="E">
	<div class="flex w-full flex-col">
		{#if $outputVersion.index > 0}
			<div class="mt-1 flex items-center space-x-2">
				<CheckBox bind:value={exportAsJSON} label="json" />
				<span>Toggle JSON mode (for use in json files)</span>
			</div>
		{/if}

		<p class="mt-2">
			As {$outputVersion.index > 0 ? " " : "JSON "}text components:
		</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						convert(editor.getJSON(), "standard", shouldOptimise, exportAsJSON),
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block max-h-56 w-full overflow-auto">
				{editor
					? convert(editor.getJSON(), "standard", shouldOptimise, exportAsJSON)
					: "Loading..."}
			</code>
		</div>

		<p class="mt-2">As a lore component:</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						`[lore=${convert(editor.getJSON(), "item_lore", shouldOptimise, exportAsJSON)}]`,
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block max-h-56 w-full overflow-auto"
				><span class="text-white/35">[lore=</span>{editor
					? convert(editor.getJSON(), "item_lore", shouldOptimise, exportAsJSON)
					: "Loading..."}<span class="text-white/35">]</span>
			</code>
		</div>

		<p class="mt-2">As a MOTD:</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						editor ? translateMOTD(editor.getJSON()) : "Loading...",
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block max-h-56 w-full overflow-auto"
				>{editor ? translateMOTD(editor.getJSON()) : "Loading..."}
			</code>
		</div>
	</div>
</Modal>
