<script lang="ts">
	import Modal from "$lib/Modal.svelte";
	import IconCopy from "~icons/tabler/copy";
	import IconTick from "~icons/tabler/check";

    let { outputDialog = $bindable(), outputVersion = $bindable(), editor, recentlyCopied, indent, indentSize, translate, translateToNBT } = $props();

</script>

<Modal title="More output formats" bind:this={outputDialog} big>
	<p>Select a Minecraft version:</p>
	<select bind:value={outputVersion} class="bg-zinc-900 p-2 rounded-md w-fit">
		<option value="new">1.21.5+</option>
		<option value="old">Before 1.21.5</option>
	</select>
	<div class="flex flex-col w-full mt-2">
		<p>For tellraw commands (send to chat):</p>
		<div class="flex items-start bg-zinc-950 p-3 space-x-3 rounded-lg">
			<button
				class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
				onclick={() => {
					navigator.clipboard.writeText(
						"/tellraw @s " + translateToNBT(editor.getJSON(), "standard", outputVersion),
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block w-full overflow-auto max-h-56"
				>/tellraw @s {editor ? translateToNBT(editor.getJSON(), "standard", outputVersion): "Loading..."}
			</code>
		</div>

		<p class="mt-2">As a lore component:</p>
		<div class="flex items-start bg-zinc-950 p-3 space-x-3 rounded-lg">
			<button
				class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
				onclick={() => {
					navigator.clipboard.writeText(
						`[lore=${translateToNBT(editor.getJSON(), "item_lore", outputVersion)}]`,
					);
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			{#if outputVersion == "new"}
			<code class="inline-block w-full overflow-auto max-h-56"
				>[lore={editor
					? translateToNBT(editor.getJSON(), "item_lore", outputVersion)
					: "Loading..."}]
			</code>
			{:else}
			<code class="inline-block w-full overflow-auto max-h-56"
				>[lore={editor
					? 
					`'${translate(editor.getJSON(), "item_lore", false, 0, outputVersion)}'`
					: "Loading..."}]
			</code>
			{/if}
		</div>

		<p class="mt-2">As JSON:</p>
		<div class="flex items-start bg-zinc-950 p-3 space-x-3 rounded-lg">
			<button
				class="p-1 text-lg hover:bg-zinc-900 active:bg-white/10 rounded-md font-medium"
				onclick={() => {
					navigator.clipboard.writeText(translate(editor.getJSON(), "standard", indent, indentSize, outputVersion));
					recentlyCopied = true;
					setTimeout(() => (recentlyCopied = false), 2000);
				}}>
				<IconCopy />
			</button>
			<code class="inline-block w-full overflow-auto max-h-56"
				><pre>{editor ? translate(editor.getJSON(), "standard", indent, indentSize, outputVersion) : "Loading..."}</pre>
			</code>
		</div>

		<div class="flex items-center gap-2 mt-2">
			<p>Indent?</p>
			<button
				class="size-8 aspect-square bg-zinc-900 rounded-md flex flex-col items-center"
				onclick={() =>
					(indent = !indent)}>
				{#if indent}
					<IconTick class="m-auto text-lg" />
				{/if}
			</button>
		</div>
		{#if indent}			
			<label for="indentSize" class="mt-2">Indent Size:</label>
			<input type="number" id="indentSize" max="8" min="1" bind:value={indentSize} class="bg-zinc-900 p-2 rounded-md w-fit" />
		{/if}


	</div>
</Modal>