<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";
	import { translateMOTD } from "$lib/text/motd";
	import { convert, translateJSON } from "$lib/text/nbt_or_json";
	import IconCopy from "~icons/tabler/copy";
	import CheckBox from "../CheckBox.svelte";
	let {
		outputDialog = $bindable(),
		outputVersion = $bindable(),
		editor,
		recentlyCopied,
		shouldOptimise = true,
	} = $props();

	let exportAsJSON = $state(false);

	function exportThing(exportAsJSON: boolean) {
		if (!exportAsJSON) {
			return convert(
				editor.getJSON(),
				"item_lore",
				outputVersion,
				shouldOptimise,
			);
		}
		return translateJSON(editor.getJSON(), {
			exportType: "item_lore",
			exportVersion: outputVersion,
			optimise: shouldOptimise,
		});
	}
</script>

<Modal title="More output formats" bind:this={outputDialog} big key="E">
	<p>Select a Minecraft version:</p>
	<select bind:value={outputVersion} class="w-fit rounded-md bg-zinc-900 p-2">
		<option value="new">1.21.5+</option>
		<option value="old">Before 1.21.5</option>
	</select>
	<div class="flex w-full flex-col">
		{#if outputVersion == "new"}
		<div class="flex items-center space-x-2 mt-1">
			<CheckBox bind:value={exportAsJSON} label="json" />
			<span>Toggle JSON mode (for use in json files)</span>
		</div>
		{/if}

		<p class="mt-2">As {outputVersion == "new" ? " " : "JSON "}text components:</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						convert(
							editor.getJSON(),
							"standard",
							outputVersion,
							shouldOptimise,
							exportAsJSON
						),
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block max-h-56 w-full overflow-auto">
				{editor
					? convert(editor.getJSON(), "standard", outputVersion, shouldOptimise, exportAsJSON)
					: "Loading..."}
			</code>
		</div>

		<p class="mt-2">As a lore component:</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						`[lore=${convert(editor.getJSON(), "item_lore", outputVersion, shouldOptimise, exportAsJSON)}]`,
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
				<code class="inline-block max-h-56 w-full overflow-auto"
					><span class="text-white/35">[lore=</span>{editor
						? convert(
							editor.getJSON(),
							"item_lore",
							outputVersion,
							shouldOptimise,
							exportAsJSON
						)
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

		<!-- <p class="mt-2">As JSON:</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						translateJSON(editor.getJSON(), {
							exportType: "standard",
							exportVersion: outputVersion,
							indent,
							indentSize,
							optimise: shouldOptimise,
						}),
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block max-h-56 w-full overflow-auto"
				><pre>{editor
						? translateJSON(editor.getJSON(), {
								exportType: "standard",
								exportVersion: outputVersion,
								indent,
								indentSize,
								optimise: shouldOptimise,
							})
						: "Loading..."}</pre>
			</code>
		</div>

		<div class="mt-2 flex items-center gap-2">
			<p>Indent?</p>
			<button
				class="flex aspect-square size-8 flex-col items-center rounded-md bg-zinc-900"
				onclick={() => (indent = !indent)}>
				{#if indent}
					<IconTick class="m-auto text-lg" />
				{/if}
			</button>
		</div>
		{#if indent}
			<label for="indentSize" class="mt-2">Indent Size:</label>
			<input
				type="number"
				id="indentSize"
				max="8"
				min="1"
				bind:value={indentSize}
				class="w-fit rounded-md bg-zinc-900 p-2" />
		{/if} -->
	</div>
</Modal>
