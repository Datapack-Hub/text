<script lang="ts">
	import Modal from "$lib/Modal.svelte";
	import IconTick from "~icons/tabler/check";
	import IconScore from "~icons/tabler/123";
	import IconSelector from "~icons/tabler/at";
	import IconNBT from "~icons/tabler/braces";
	import IconKeybind from "~icons/tabler/keyboard";
	import IconTranslate from "~icons/tabler/language";
	import type { ExternalSources } from "$lib/tiptap/text";
	import MiniEditor from "../MiniEditor.svelte";

	let {
		customDialog = $bindable(),
		outputVersion = $bindable(),
		editor,
		customType = $bindable(),
	} = $props();

	let customValues: ExternalSources = $state({
		score: {
			objective: "",
			name: "",
		},
		translate: {
			key: "",
			params: [],
			fallback: undefined,
		},
		nbt: {
			sourceType: "",
			storage: "",
			entity: "",
			block: "",
			path: "",
			interpret: false,
		},
		keybind: {
			key: "",
		},
		selector: {
			selector: "",
		},
	});
</script>

<Modal title="Add Custom Source" bind:this={customDialog} key="W">
	<p>Select a source type to add</p>
	{#if !customType}
		<div class="grid grid-cols-3 gap-2">
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "translate";
				}}>
				<IconTranslate class="text-2xl" />
				<span>Translate Key</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "nbt";
				}}>
				<IconNBT class="text-2xl" />
				<span>NBT Value</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "score";
				}}>
				<IconScore class="text-2xl" />
				<span>Score Value</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "selector";
				}}>
				<IconSelector class="text-2xl" />
				<span>Selector</span>
			</button>
			<button
				class="bg-zinc-900 p-3 rounded-md w-full h-full flex flex-col items-center space-y-2 cursor-pointer hover:bg-black/50"
				onclick={() => {
					customType = "keybind";
				}}>
				<IconKeybind class="text-2xl" />
				<span>Keybind</span>
			</button>
		</div>
	{:else}
		<select bind:value={customType} class="bg-zinc-900 p-2 rounded-md">
			<option value="translate">Translate Key</option>
			<option value="score">Score Value</option>
			<option value="nbt">NBT Value</option>
			<option value="selector">Selector</option>
			<option value="keybind">Keybind</option>
		</select>
	{/if}

	{#if customType === "translate"}
		<p class="mt-2">Translate Key</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="item.minecraft.beef"
			bind:value={customValues.translate.key} />

		<p class="mt-2">Fallback</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="This text is shown if the key does not exist"
			bind:value={customValues.translate.fallback} />

		<p class="mt-2">Parameters</p>
		<div class="w-full flex flex-col space-y-1">
			{#each customValues.translate.params ?? [] as p, i}
				<div class="flex items-center space-x-1 w-full">
					<MiniEditor
						placeholder="Parameter #{i + 1}"
						bind:output={customValues.translate.params[i]} />
				</div>
			{/each}
		</div>
		<div class="flex items-center space-x-1">
			<button
				onclick={() => {
					customValues.translate.params.push("");
					customValues.translate.params = customValues.translate.params;
				}}
				class="bg-zinc-900 p-1 px-2 text-sm rounded-md w-fit cursor-pointer hover:bg-black/50">
				Add Parameter
			</button>
			{#if customValues.translate.params.length != 0}
				<button
					onclick={() => {
						customValues.translate.params.pop();
						customValues.translate.params = customValues.translate.params;
					}}
					class="bg-zinc-900 p-1 px-2 text-sm rounded-md w-fit cursor-pointer hover:bg-black/50">
					Remove Last Parameter
				</button>
			{/if}
		</div>

		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertTranslate({
						key: customValues.translate.key,
						params: customValues.translate.params,
						fallback: customValues.translate.fallback,
					})
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Translate Key
		</button>
	{:else if customType === "score"}
		<p class="mt-2">Objective</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="money"
			bind:value={customValues.score.objective} />
		<p class="mt-2">Player, Fake Player, or Entity</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="@s"
			bind:value={customValues.score.name} />

		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertScore({
						name: customValues.score.name,
						objective: customValues.score.objective,
					})
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Score Value
		</button>
	{:else if customType === "nbt"}
		<p class="mt-2">NBT Source type</p>
		<select
			bind:value={customValues.nbt.sourceType}
			class="bg-zinc-900 p-2 rounded-md">
			<option value="storage">Storage</option>
			<option value="block">Block</option>
			<option value="entity">Entity</option>
		</select>
		{#if customValues.nbt.sourceType === "storage"}
			<p class="mt-2">Storage ID</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="example:storage"
				bind:value={customValues.nbt.storage} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="flex items-center space-x-2 mt-2">
				<button
					class="size-8 aspect-square bg-zinc-900 rounded-md flex flex-col items-center"
					onclick={() =>
						(customValues.nbt.interpret = !customValues.nbt.interpret)}>
					{#if customValues.nbt.interpret}
						<IconTick class="m-auto text-lg" />
					{/if}
				</button>
				<label for="interpret"
					>Interpret (parse nbt value as a text component)</label>
			</div>

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertStorageNBT({
							storage: customValues.nbt.storage,
							nbt: customValues.nbt.path,
							interpret: customValues.nbt.interpret,
						})
						.run();
				}}
				class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
				Add NBT Value
			</button>
		{:else if customValues.nbt.sourceType === "entity"}
			<p class="mt-2">Entity</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="@e[type=villager,limit=1,sort=nearest]"
				bind:value={customValues.nbt.entity} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="flex items-center space-x-2 mt-2">
				<button
					class="size-8 aspect-square bg-zinc-900 rounded-md flex flex-col items-center"
					onclick={() =>
						(customValues.nbt.interpret = !customValues.nbt.interpret)}>
					{#if customValues.nbt.interpret}
						<IconTick class="m-auto text-lg" />
					{/if}
				</button>
				<label for="interpret"
					>Interpret (parse nbt value as a text component)</label>
			</div>

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertEntityNBT({
							entity: customValues.nbt.entity,
							nbt: customValues.nbt.path,
							interpret: customValues.nbt.interpret,
						})
						.run();
				}}
				class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
				Add NBT Value
			</button>
		{:else if customValues.nbt.sourceType === "block"}
			<p class="mt-2">Entity</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="~ ~ ~"
				bind:value={customValues.nbt.block} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="bg-zinc-900 p-2 rounded-md"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="flex items-center space-x-2 mt-2">
				<button
					class="size-8 aspect-square bg-zinc-900 rounded-md flex flex-col items-center"
					onclick={() =>
						(customValues.nbt.interpret = !customValues.nbt.interpret)}>
					{#if customValues.nbt.interpret}
						<IconTick class="m-auto text-lg" />
					{/if}
				</button>
				<label for="interpret"
					>Interpret (parse nbt value as a text component)</label>
			</div>

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertBlockNBT({
							block: customValues.nbt.block,
							nbt: customValues.nbt.path,
							interpret: customValues.nbt.interpret,
						})
						.run();
				}}
				class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
				Add NBT Value
			</button>
		{/if}
	{:else if customType === "keybind"}
		<p class="mt-2">Keybind</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="key.jump"
			bind:value={customValues.keybind.key} />
		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertKeybind({ key: customValues.keybind.key })
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Keybind
		</button>
	{:else if customType === "selector"}
		<p class="mt-2">Selector</p>
		<input
			type="text"
			class="bg-zinc-900 p-2 rounded-md"
			placeholder="@p[tag=something]"
			bind:value={customValues.selector.selector} />
		<button
			onclick={() => {
				customDialog.close();
				editor
					.chain()
					.focus()
					.insertSelector({ selector: customValues.selector.selector })
					.run();
			}}
			class="bg-zinc-900 p-2 rounded-md w-fit mt-2 cursor-pointer hover:bg-black/50">
			Add Selector
		</button>
	{/if}
</Modal>
