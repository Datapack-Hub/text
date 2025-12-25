<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";

	let {
		clickEventDialog = $bindable(),
		clickEventType = $bindable(),
		editor,
		clickEventValue = $bindable(),
	} = $props();
</script>

<Modal title="Click Event" bind:this={clickEventDialog} key="T">
	<p>Event Type</p>
	<select bind:value={clickEventType} class="rounded-md bg-zinc-900 p-2">
		<option value="open_url">Open URL</option>
		<option value="run_command">Run Command</option>
		<option value="suggest_command">Suggest Command</option>
		<option value="copy_to_clipboard">Copy to Clipboard</option>
		<option value="change_page">Change Page (in books only)</option>
		<option value="open_dialog">Open Dialog</option>
	</select>

	{#if clickEventType == "open_url"}
		<p class="mt-2">URL:</p>
		<input
			type="url"
			class="rounded-md bg-zinc-900 p-2 invalid:outline-2 invalid:outline-red-500"
			placeholder="https://example.com"
			pattern="https?://.*"
			bind:value={clickEventValue} />
	{:else if clickEventType == "run_command"}
		<p class="mt-2">Command:</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="/give @s apple"
			bind:value={clickEventValue} />
		<p class="text-zinc-400">
			Note: the player must have permission to run the command!
		</p>
	{:else if clickEventType == "suggest_command"}
		<p class="mt-2">Command:</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="/give @s apple"
			bind:value={clickEventValue} />
		<p class="text-zinc-400">
			Note: the player must have permission to run the command!
		</p>
	{:else if clickEventType == "copy_to_clipboard"}
		<p class="mt-2">Text to copy:</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="I love the Wuppertal Suspension Railway"
			bind:value={clickEventValue} />
	{:else if clickEventType == "change_page"}
		<p class="mt-2">Page to go to:</p>
		<input
			type="number"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="32"
			bind:value={clickEventValue} />
	{:else if clickEventType == "open_dialog"}
		<p class="mt-2">Dialog ID:</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="namespace:example_dialog"
			bind:value={clickEventValue} />
	{/if}

	<div class="flex items-center space-x-2">
		{#if clickEventType}
			<button
				onclick={() => {
					clickEventDialog.close();
					editor
						.chain()
						.focus()
						.setClickEvent({ action: clickEventType, value: clickEventValue })
						.run();
				}}
				class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				Add Click Event
			</button>
		{/if}
	</div>
</Modal>
