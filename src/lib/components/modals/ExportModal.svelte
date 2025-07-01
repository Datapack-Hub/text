<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";
	import IconCopy from "~icons/tabler/copy";
	import IconTick from "~icons/tabler/check";
	import { translateJSON, convert } from "$lib/text/nbt_or_json";
	import { translateMOTD } from "$lib/text/motd";
	let {
		outputDialog = $bindable(),
		outputVersion = $bindable(),
		editor,
		recentlyCopied,
		indent,
		indentSize,
		shouldOptimise = true,
	} = $props();
</script>

<Modal title="More output formats" bind:this={outputDialog} big key="E">
	<p>Select a Minecraft version:</p>
	<select bind:value={outputVersion} class="w-fit rounded-md bg-zinc-900 p-2">
		<option value="new">1.21.5+</option>
		<option value="old">Before 1.21.5</option>
	</select>
	<div class="mt-2 flex w-full flex-col">
		<p>For tellraw commands (send to chat):</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						"/tellraw @s " +
							convert(
								editor.getJSON(),
								"standard",
								outputVersion,
								shouldOptimise,
							),
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block max-h-56 w-full overflow-auto"
				>/tellraw @s {editor
					? convert(editor.getJSON(), "standard", outputVersion, shouldOptimise)
					: "Loading..."}
			</code>
		</div>

		<p class="mt-2">As a lore component:</p>
		<div class="flex items-start space-x-3 rounded-lg bg-zinc-950 p-3">
			<button
				class="rounded-md p-1 text-lg font-medium hover:bg-zinc-900 active:bg-white/10"
				onclick={() => {
					navigator.clipboard.writeText(
						`[lore=${convert(editor.getJSON(), "item_lore", outputVersion, shouldOptimise)}]`,
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			{#if outputVersion == "new"}
				<code class="inline-block max-h-56 w-full overflow-auto"
					>[lore={editor
						? convert(
								editor.getJSON(),
								"item_lore",
								outputVersion,
								shouldOptimise,
							)
						: "Loading..."}]
				</code>
			{:else}
				<code class="inline-block max-h-56 w-full overflow-auto"
					>[lore={editor
						? `'${translateJSON(editor.getJSON(), {
								exportType: "item_lore",
								exportVersion: outputVersion,
								optimise: shouldOptimise,
							})}`
						: "Loading..."}]
				</code>
			{/if}
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

		<p class="mt-2">As JSON:</p>
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
		{/if}
	</div>
</Modal>
