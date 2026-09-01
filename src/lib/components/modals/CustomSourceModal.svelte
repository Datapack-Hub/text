<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import type { ExternalSources } from "$lib/types";

    import IconScore from "~icons/tabler/123";
    import IconBack from "~icons/tabler/arrow-back-up";
    import IconSelector from "~icons/tabler/at";
    import IconObject from "~icons/tabler/box";
    import IconNBT from "~icons/tabler/braces";
    import IconInfo from "~icons/tabler/info-circle";
    import IconKeybind from "~icons/tabler/keyboard";
    import IconTranslate from "~icons/tabler/language";

    import { outputVersion } from "$lib/settings";
    import { tooltip_right } from "$lib/tooltip";
    import CheckBox from "../CheckBox.svelte";
    import MiniEditor from "../text/MiniEditor.svelte";

    let { customDialog = $bindable(), editor, customType = $bindable() } = $props();

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
    {#if !customType}
        <p>Select a source type to add</p>
        <div class="flex flex-col space-y-2">
        <!-- <div class="grid grid-cols-2 gap-2"> -->
            <button 
            class="bg-zinc-900 hover:bg-black/50 p-2 rounded-md w-full flex items-center space-x-2"
            onclick={() => customType = "translate"}>
                <IconTranslate class="w-10 flex justify-center shrink-0 text-2xl" />
                <div class="grow flex flex-col items-start">
                    <span>Translate Key</span>
                    <span class="text-xs text-left text-zinc-400">A translate key changes based on the player's language.</span>
                </div>
            </button>
            <button 
                class="bg-zinc-900 hover:bg-black/50 p-2 rounded-md w-full flex items-center space-x-2"
                onclick={() => customType = "nbt"}>
                <IconNBT class="w-10 flex justify-center shrink-0 text-2xl" />
                <div class="grow flex flex-col items-start">
                    <span>NBT Value</span>
                    <span class="text-xs text-left text-zinc-400">Display a value from an NBT store. This only works in certain contexts.</span>
                </div>
            </button>
            <button 
                class="bg-zinc-900 hover:bg-black/50 p-2 rounded-md w-full flex items-center space-x-2"
                onclick={() => customType = "score"}>
                <IconScore class="w-10 flex justify-center shrink-0 text-2xl" />
                <div class="grow flex flex-col items-start">
                    <span>Scoreboard Value</span>
                    <span class="text-xs text-left text-zinc-400">Display a number from a scoreboard. This only works in certain contexts.</span>
                </div>
            </button>
            <button 
                class="bg-zinc-900 hover:bg-black/50 p-2 rounded-md w-full flex items-center space-x-2"
                onclick={() => customType = "selector"}>
                <IconSelector class="w-10 flex justify-center shrink-0 text-2xl" />
                <div class="grow flex flex-col items-start">
                    <span>Selector</span>
                    <span class="text-xs text-left text-zinc-400">Display an entity name, or a list of entity names. This only works in certain contexts.</span>
                </div>
            </button>
            <button 
                class="bg-zinc-900 hover:bg-black/50 p-2 rounded-md w-full flex items-center space-x-2"
                onclick={() => customType = "keybind"}>
                <IconKeybind class="w-10 flex justify-center shrink-0 text-2xl" />
                <div class="grow flex flex-col items-start">
                    <span>Keybind</span>
                    <span class="text-xs text-left text-zinc-400">Display the player's keybind for an action (e.g. "key.jump" would be "Space" by default).</span>
                </div>
            </button>
            {#if $outputVersion.index >= 2}
                <button 
                    class="bg-zinc-900 hover:bg-black/50 p-2 rounded-md w-full flex items-center space-x-2"
                    onclick={() => customType = "object"}>
                    <IconObject class="w-10 flex justify-center shrink-0 text-2xl" />
                    <div class="grow flex flex-col items-start">
                        <span>Object</span>
                        <span class="text-xs text-left text-zinc-400">Display either a game texture (e.g. a block) or the front of a player head.</span>
                    </div>
                </button>
            {/if}
        </div>
    {:else}
        <!-- <select bind:value={customType} class="input-basic">
            <option value="translate">Translate Key</option>
            <option value="score">Score Value</option>
            <option value="nbt">NBT Value</option>
            <option value="selector">Selector</option>
            <option value="keybind">Keybind</option>
            <option value="object">Object</option>
        </select> -->
    {/if}

    {#if customType === "translate"}
        <div class="bg-zinc-900 p-2 rounded-md w-full flex items-center space-x-2">
            <IconTranslate class="w-10 flex justify-center shrink-0 text-2xl" />
            <div class="grow flex flex-col">
                <span>Translate Key</span>
                <span class="text-xs text-zinc-400">A translate key changes based on the player's language.</span>
            </div>
            <button class="rounded-md p-2 hover:bg-black/15" onclick={() => customType = null}>
                <IconBack />
            </button>
        </div>

        <div class="flex items-center space-x-1 mt-2">
            <span>Translate Key</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The translate key, as defined in a resource pack's language files." />
        </div>
        <input
            type="text"
            class="input-basic"
            placeholder="item.minecraft.beef"
            bind:value={customValues.translate.key} />

        
        <div class="flex items-center space-x-1 mt-2">
            <span>Fallback</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="What to show if the translate key does not exist (e.g. if the resource pack is not installed)" />
        </div>
        <input
            type="text"
            class="input-basic"
            placeholder="This text is shown if the key does not exist"
            bind:value={customValues.translate.fallback} />

        <div class="flex items-center space-x-1 mt-2">
            <span>Parameters</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="Some advanced translate keys allow you to insert custom text inside the translated value." />
        </div>
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
            class="btn mt-2">
            Add Translate Key
        </button>
    {:else if customType === "score"}
        <div class="bg-zinc-900 p-2 rounded-md w-full flex items-center space-x-2">
            <IconScore class="w-10 flex justify-center shrink-0 text-2xl" />
            <div class="grow flex flex-col">
                <span>Scoreboard Value</span>
                <span class="text-xs text-zinc-400">Display a number from a scoreboard. This only works in certain contexts.</span>
            </div>
            <button class="rounded-md p-2 hover:bg-black/15" onclick={() => customType = null}>
                <IconBack />
            </button>
        </div>

        <div class="flex items-center space-x-1 mt-2">
            <span>Objective</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The name of the scoreboard objective to get the score from." />
        </div>
        <input
            type="text"
            class="input-basic"
            placeholder="money"
            bind:value={customValues.score.objective} />

        <div class="flex items-center space-x-1 mt-2">
            <span>Player Name or Selector</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="Either the name of the score holder (a player or fake player), or an entity selector." />
        </div>
        <input
            type="text"
            class="input-basic"
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
            class="btn mt-2">
            Add Score Value
        </button>
    {:else if customType === "nbt"}
        <div class="bg-zinc-900 p-2 rounded-md w-full flex items-center space-x-2">
            <IconNBT class="w-10 flex justify-center shrink-0 text-2xl" />
            <div class="grow flex flex-col">
                <span>NBT Value</span>
                <span class="text-xs text-zinc-400">Display a value from an NBT store. This only works in certain contexts.</span>
            </div>
            <button class="rounded-md p-2 hover:bg-black/15" onclick={() => customType = null}>
                <IconBack />
            </button>
        </div>

        <div class="flex items-center space-x-1 mt-2">
            <span>NBT Source Type</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The type of thing you are getting the NBT from." />
        </div>
        <select bind:value={customValues.nbt.sourceType} class="input-basic">
            <option value="storage">Storage</option>
            <option value="entity">Entity</option>
            <option value="block">Block</option>
        </select>
        {#if customValues.nbt.sourceType === "storage"}
            <div class="flex items-center space-x-1 mt-2">
                <span>Storage ID</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The namespaced ID of the NBT storage" />
            </div>
            <input
                type="text"
                class="input-basic"
                placeholder="example:storage"
                bind:value={customValues.nbt.storage} />

            <div class="flex items-center space-x-1 mt-2">
                <span>NBT Path</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The path to the NBT value in the storage." />
            </div>
            <input
                type="text"
                class="input-basic"
                placeholder="Items[0].id"
                bind:value={customValues.nbt.path} />

            <div class="mt-2 flex items-center space-x-2">
                <CheckBox bind:value={customValues.nbt.interpret} label="interpret" />
                <label for="interpret" class="flex flex-col">
                    <span>Interpret</span>
                    <span class="text-xs text-zinc-500">If enabled, the NBT value will be treated and parsed as if it is a text component.</span>
                </label>
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
                class="btn mt-2">
                Add NBT Value
            </button>
        {:else if customValues.nbt.sourceType === "entity"}
            <div class="flex items-center space-x-1 mt-2">
                <span>Entity Selector</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The selector for the entity you want to get the NBT from. This could also be a player name." />
            </div>
            <input
                type="text"
                class="input-basic"
                placeholder="@e[type=villager,limit=1,sort=nearest]"
                bind:value={customValues.nbt.entity} />

            <div class="flex items-center space-x-1 mt-2">
                <span>NBT Path</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The path to the NBT value in the entity." />
            </div>
            <input
                type="text"
                class="input-basic"
                placeholder="Items[0].id"
                bind:value={customValues.nbt.path} />

            <div class="mt-2 flex items-center space-x-2">
                <CheckBox bind:value={customValues.nbt.interpret} label="interpret" />
                <label for="interpret" class="flex flex-col">
                    <span>Interpret</span>
                    <span class="text-xs text-zinc-500">If enabled, the NBT value will be treated and parsed as if it is a text component.</span>
                </label>
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
                class="btn mt-2">
                Add NBT Value
            </button>
        {:else if customValues.nbt.sourceType === "block"}
            <div class="flex items-center space-x-1 mt-2">
                <span>Block</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The coordinates to the block entity that you want to get the NBT from. This can be absolute or relative." />
            </div>
            <input
                type="text"
                class="input-basic"
                placeholder="~ ~ ~"
                bind:value={customValues.nbt.block} />

            <div class="flex items-center space-x-1 mt-2">
                <span>NBT Path</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The path to the NBT value in the entity." />
            </div>
            <input
                type="text"
                class="input-basic"
                placeholder="Items[0].id"
                bind:value={customValues.nbt.path} />

            <div class="mt-2 flex items-center space-x-2">
                <CheckBox bind:value={customValues.nbt.interpret} label="interpret" />
                <label for="interpret" class="flex flex-col">
                    <span>Interpret</span>
                    <span class="text-xs text-zinc-500">If enabled, the NBT value will be treated and parsed as if it is a text component.</span>
                </label>
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
                class="btn mt-2">
                Add NBT Value
            </button>
        {/if}
    {:else if customType === "keybind"}
        <div class="bg-zinc-900 p-2 rounded-md w-full flex items-center space-x-2">
            <IconKeybind class="w-10 flex justify-center shrink-0 text-2xl" />
            <div class="grow flex flex-col">
                <span>Keybind</span>
                <span class="text-xs text-zinc-400">Display the player's keybind for an action (e.g. "key.jump" would be "Space" by default).</span>
            </div>
            <button class="rounded-md p-2 hover:bg-black/15" onclick={() => customType = null}>
                <IconBack />
            </button>
        </div>

        <div class="flex items-center space-x-1 mt-2">
            <span>Keybind</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The ID of the keybind. A full list is on the Minecraft Wiki." />
        </div>
        <input
            type="text"
            class="input-basic"
            placeholder="key.jump"
            bind:value={customValues.keybind.key} />
        <button
            onclick={() => {
                customDialog.close();
                editor.chain().focus().insertKeybind({ key: customValues.keybind.key }).run();
            }}
            class="btn mt-2">
            Add Keybind
        </button>
    {:else if customType === "selector"}
        <div class="bg-zinc-900 p-2 rounded-md w-full flex items-center space-x-2">
            <IconSelector class="w-10 flex justify-center shrink-0 text-2xl" />
            <div class="grow flex flex-col">
                <span>Selector</span>
                <span class="text-xs text-zinc-400">Display an entity name, or a list of entity names. This only works in certain contexts.</span>
            </div>
            <button class="rounded-md p-2 hover:bg-black/15" onclick={() => customType = null}>
                <IconBack />
            </button>
        </div>

        <div class="flex items-center space-x-1 mt-2">
            <span>Selector</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The entity selector." />
        </div>
        <input
            type="text"
            class="input-basic"
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
            class="btn mt-2">
            Add Selector
        </button>
    {:else if customType === "object"}
        <div class="bg-zinc-900 p-2 rounded-md w-full flex items-center space-x-2">
            <IconObject class="w-10 flex justify-center shrink-0 text-2xl" />
            <div class="grow flex flex-col">
                <span>Object</span>
                <span class="text-xs text-zinc-400">Display either a game texture (e.g. a block) or the front of a player head.</span>
            </div>
            <button class="rounded-md p-2 hover:bg-black/15" onclick={() => customType = null}>
                <IconBack />
            </button>
        </div>

        <div class="flex items-center space-x-1 mt-2">
            <span>Object Type</span>
            <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The type of object (sprite/texture or player head)." />
        </div>
        <select bind:value={customValues.object.object} class="input-basic">
            <option value="atlas">Atlas (sprite)</option>
            <option value="player">Player Head</option>
        </select>

        {#if customValues.object.object == "atlas"}
            <div class="flex items-center space-x-1 mt-2">
                <span>Atlas</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The resource pack atlas to which this sprite belongs." />
            </div>
            <select
                bind:value={customValues.object.atlas}
                class="rounded-md bg-zinc-900 p-2 data-hidden:border-2 font-mono">
                <option hidden value="" data-hidden>(defaults to minecraft:blocks)</option>
                {#each defaultAtlases as atlas}
                    <option value={atlas.value}>{atlas.label}</option>
                {/each}
            </select>

            <div class="flex items-center space-x-1 mt-2">
                <span>Sprite</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The path to the specific sprite." />
            </div>
            <input
                type="text"
                class="input-basic"
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
                class="btn mt-2">
                Add Object
            </button>
        {:else if customValues.object.object == "player"}
            <div class="flex items-center space-x-1 mt-2">
                <span>Username</span>
                <IconInfo class="text-sm text-zinc-300" {@attach tooltip_right} aria-label="The username of the player. If you want to dynamically choose a player, then you will need to use a macro function." />
            </div>
            <input
                type="text"
                class="input-basic"
                placeholder="Technoblade"
                bind:value={customValues.object.player.name} />

            <div class="mt-2 flex items-center space-x-2">
                <CheckBox bind:value={customValues.object.hat} label="renderHat" />
                <label for="renderHat" class="flex flex-col">
                    <span>Render Hat</span>
                    <span class="text-xs text-zinc-500">If enabled, the second layer of the skin will also be displayed.</span>
                </label>
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
                class="btn mt-2">
                Add Object
            </button>
        {/if}
    {/if}
</Modal>
