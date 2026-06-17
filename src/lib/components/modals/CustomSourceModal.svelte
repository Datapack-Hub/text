<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";
	import type { ExternalSources } from "$lib/types";

	import IconScore from "~icons/tabler/123";
	import IconSelector from "~icons/tabler/at";
	import IconNBT from "~icons/tabler/braces";
	import IconKeybind from "~icons/tabler/keyboard";
	import IconTranslate from "~icons/tabler/language";
	import IconObject from "~icons/tabler/box";

	import CheckBox from "../CheckBox.svelte";
	import MiniEditor from "../text/MiniEditor.svelte";
	import Combobox from "../Combobox.svelte";
	import { outputVersion } from "$lib/stores";

	let {
		customDialog = $bindable(),
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
		object: {
			atlas: "",
			sprite: "",
			player: {
				name: "",
				id: "",
			},
			hat: true,
		},
	});

	const defaultAtlases = [
		{ label: "minecraft:armor_trims", value: "minecraft:armor_trims" },
		{ label: "minecraft:banner_patterns", value: "minecraft:banner_patterns" },
		{ label: "minecraft:beds", value: "minecraft:beds" },
		{ label: "minecraft:blocks", value: "minecraft:blocks" },
		{ label: "minecraft:chests", value: "minecraft:chests" },
		{ label: "minecraft:decorated_pot", value: "minecraft:decorated_pot" },
		{ label: "minecraft:gui", value: "minecraft:gui" },
		{ label: "minecraft:map_decorations", value: "minecraft:map_decorations" },
		{ label: "minecraft:paintings", value: "minecraft:paintings" },
		{ label: "minecraft:particles", value: "minecraft:particles" },
		{ label: "minecraft:shield_patterns", value: "minecraft:shield_patterns" },
		{ label: "minecraft:shulker_boxes", value: "minecraft:shulker_boxes" },
		{ label: "minecraft:signs", value: "minecraft:signs" },
	];
</script>

<Modal title="Add Custom Source" bind:this={customDialog} key="W">
	<p>Select a source type to add</p>
	{#if !customType}
		<div class="grid grid-cols-3 gap-2">
			<button
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50"
				onclick={() => {
					customType = "translate";
				}}>
				<IconTranslate class="text-2xl" />
				<span>Translate Key</span>
			</button>
			<button
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50"
				onclick={() => {
					customType = "nbt";
				}}>
				<IconNBT class="text-2xl" />
				<span>NBT Value</span>
			</button>
			<button
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50"
				onclick={() => {
					customType = "score";
				}}>
				<IconScore class="text-2xl" />
				<span>Score Value</span>
			</button>
			<button
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50"
				onclick={() => {
					customType = "selector";
				}}>
				<IconSelector class="text-2xl" />
				<span>Selector</span>
			</button>
			<button
				class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50"
				onclick={() => {
					customType = "keybind";
				}}>
				<IconKeybind class="text-2xl" />
				<span>Keybind</span>
			</button>
			{#if $outputVersion.index >= 2}
				<button
					class="flex h-full w-full flex-col items-center space-y-2 rounded-md bg-zinc-900 p-3 hover:bg-black/50"
					onclick={() => {
						customType = "object";
					}}>
					<IconObject class="text-2xl" />
					<span>Object</span>
				</button>
			{/if}
		</div>
	{:else}
		<select bind:value={customType} class="rounded-md bg-zinc-900 p-2">
			<option value="translate">Translate Key</option>
			<option value="score">Score Value</option>
			<option value="nbt">NBT Value</option>
			<option value="selector">Selector</option>
			<option value="keybind">Keybind</option>
			<option value="object">Object</option>
		</select>
	{/if}

	{#if customType === "translate"}
		<p class="mt-2">Translate Key</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="item.minecraft.beef"
			bind:value={customValues.translate.key} />

		<p class="mt-2">Fallback</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="This text is shown if the key does not exist"
			bind:value={customValues.translate.fallback} />

		<p class="mt-2">Parameters</p>
		<div class="flex w-full flex-col space-y-1">
			{#each customValues.translate.params ?? [] as p, i}
				<div class="flex w-full items-center space-x-1">
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
				class="w-fit rounded-md bg-zinc-900 p-1 px-2 text-sm hover:bg-black/50">
				Add Parameter
			</button>
			{#if customValues.translate.params.length != 0}
				<button
					onclick={() => {
						customValues.translate.params.pop();
						customValues.translate.params = customValues.translate.params;
					}}
					class="w-fit rounded-md bg-zinc-900 p-1 px-2 text-sm hover:bg-black/50">
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
			class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Add Translate Key
		</button>
	{:else if customType === "score"}
		<p class="mt-2">Objective</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
			placeholder="money"
			bind:value={customValues.score.objective} />
		<p class="mt-2">Player, Fake Player, or Entity</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
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
			class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Add Score Value
		</button>
	{:else if customType === "nbt"}
		<p class="mt-2">NBT Source type</p>
		<select
			bind:value={customValues.nbt.sourceType}
			class="rounded-md bg-zinc-900 p-2">
			<option value="storage">Storage</option>
			<option value="block">Block</option>
			<option value="entity">Entity</option>
		</select>
		{#if customValues.nbt.sourceType === "storage"}
			<p class="mt-2">Storage ID</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				placeholder="example:storage"
				bind:value={customValues.nbt.storage} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="mt-2 flex items-center space-x-2">
				<CheckBox bind:value={customValues.nbt.interpret} label="interpret" />
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
				class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				Add NBT Value
			</button>
		{:else if customValues.nbt.sourceType === "entity"}
			<p class="mt-2">Entity</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				placeholder="@e[type=villager,limit=1,sort=nearest]"
				bind:value={customValues.nbt.entity} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="mt-2 flex items-center space-x-2">
				<CheckBox bind:value={customValues.nbt.interpret} label="interpret" />
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
				class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				Add NBT Value
			</button>
		{:else if customValues.nbt.sourceType === "block"}
			<p class="mt-2">Entity</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				placeholder="~ ~ ~"
				bind:value={customValues.nbt.block} />

			<p class="mt-2">NBT path</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				placeholder="Items[0].id"
				bind:value={customValues.nbt.path} />

			<div class="mt-2 flex items-center space-x-2">
				<CheckBox bind:value={customValues.nbt.interpret} label="interpret" />
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
				class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				Add NBT Value
			</button>
		{/if}
	{:else if customType === "keybind"}
		<p class="mt-2">Keybind</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
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
			class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Add Keybind
		</button>
	{:else if customType === "selector"}
		<p class="mt-2">Selector</p>
		<input
			type="text"
			class="rounded-md bg-zinc-900 p-2"
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
			class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
			Add Selector
		</button>
	{:else if customType === "object"}
		<p class="mt-2">Object Type</p>
		<select
			bind:value={customValues.object.object}
			class="rounded-md bg-zinc-900 p-2">
			<option value="atlas">Atlas (sprite)</option>
			<option value="player">Player Head</option>
		</select>

		{#if customValues.object.object == "atlas"}
			<p class="mt-2">Atlas</p>
			<Combobox
				items={defaultAtlases}
				type="single"
				inputProps={{ placeholder: "Defaults to minecraft:blocks" }}
				bind:value={customValues.object.atlas} />
			<p class="mt-2">Sprite</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				bind:value={customValues.object.sprite} />

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertAtlasObject({
							atlas: customValues.object.atlas,
							sprite: customValues.object.sprite,
						})
						.run();
				}}
				class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				Add Object
			</button>
		{:else if customValues.object.object == "player"}
			<p class="mt-2">Username</p>
			<input
				type="text"
				class="rounded-md bg-zinc-900 p-2"
				bind:value={customValues.object.player.name} />

			<div class="mt-2 flex items-center space-x-2">
				<CheckBox bind:value={customValues.object.hat} label="interpret" />
				<label for="interpret">Render Hat (2nd skin layer)</label>
			</div>

			<button
				onclick={() => {
					customDialog.close();
					editor
						.chain()
						.focus()
						.insertPlayerObject({
							player: {
								name: customValues.object.player.name,
							},
							hat: customValues.object.hat,
						})
						.run();
				}}
				class="mt-2 w-fit rounded-md bg-zinc-900 p-2 hover:bg-black/50">
				Add Object
			</button>
		{/if}
	{/if}
</Modal>
