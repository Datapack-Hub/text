<script lang="ts">
    import IconImport from "~icons/tabler/upload";
    import IconGradient from "~icons/tabler/contrast-2";
    import IconLore from "~icons/tabler/swords";
    import IconCode from "~icons/tabler/code";
    import IconClose from "~icons/tabler/X"
    import Key from "./Key.svelte";

    let { visible = $bindable(false) }: { visible: boolean } = $props()

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape" && visible) {
            visible = false;
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
<div class="absolute">
    <div
        class="fixed top-0 left-0 z-40 flex h-screen w-screen flex-col items-center overflow-auto bg-black/65 text-zinc-100"
        style="font-family: Lexend">
        <div
            aria-hidden="true"
            onclick={() => close()}
            class="fixed top-0 left-0 z-40 h-screen w-screen bg-transparent"
            tabindex="-1">
        </div>
        <div
            class="z-50 w-[95%] md:w-[50%] 2xl:w-[40%] m-auto py-4">
            <div class="flex items-center rounded-t-lg bg-zinc-900 p-2 text-xl">
                <img src="/dph.svg" class="h-8 ml-1 " alt="logo" />  
                <span class="text-lg font-black m-2 bg-linear-to-r from-red-500 to-yellow-600 bg-clip-text text-transparent">Minecraft Text Editor</span>
                <div class="grow"></div>
                <button aria-label="close" class="p-2 hover:bg-black/15 rounded-md" onclick={() => visible = false}><IconClose /></button>
            </div>
            <div class="rounded-b-lg px-4 pb-4 flex flex-col space-y-1 bg-zinc-900">
                <h1 class="font-black">Welcome! </h1>
                <p class="text-zinc-300 text-sm">With this tool, you can easily generate text components for Minecraft datapacks, tellraw commands, and more. Here's what makes us unique:</p>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">

                    <div class="flex items-center space-x-2 bg-green-500/20 text-zinc-200 rounded-md border-green-500 p-2 border-2 shadow-xl drop-shadow-lg">
                        <IconImport class="w-[7.5%] lg:w-1/10" />
                        <div class="flex flex-col space-y-1 my-1 w-[92.5%] lg:w-9/10">
                            <span class="uppercase text-xs text-green-500 font-bold">Import</span>
                            <span class="text-sm text-green-100">Import text components from any version into the editor.</span>
                        </div>
                    </div>

                    <div class="flex items-center space-x-2 bg-rose-500/20 text-zinc-200 rounded-md border-rose-500 p-2 border-2 shadow-xl drop-shadow-lg">
                        <IconGradient class="w-[7.5%] lg:w-1/10" />
                        <div class="flex flex-col space-y-1 my-1 w-[92.5%] lg:w-9/10">
                            <span class="uppercase text-xs text-rose-500 font-bold">Gradient</span>
                            <span class="text-sm text-rose-100">Easily add gradients to text, we'll do the rest.</span>
                        </div>
                    </div>

                    <div class="flex items-center space-x-2 bg-blue-500/20 text-zinc-200 rounded-md border-blue-500 p-2 border-2 shadow-xl drop-shadow-lg">
                        <IconLore class="w-[7.5%] lg:w-1/10" />
                        <div class="flex flex-col space-y-1 my-1 w-[92.5%] lg:w-9/10">
                            <span class="uppercase text-xs text-blue-500 font-bold">Lore output</span>
                            <span class="text-sm text-blue-100">Get an output correctly formatted for item lore components.</span>
                        </div>
                    </div>

                    <div class="flex items-center space-x-2 bg-zinc-800 text-zinc-200 rounded-md border-zinc-500 p-2 border-2 shadow-xl drop-shadow-lg">
                        <IconCode class="w-[7.5%] lg:w-1/10" />
                        <div class="flex flex-col space-y-1 my-1 w-[92.5%] lg:w-9/10">
                            <span class="uppercase text-xs text-zinc-500 font-bold">Open source</span>
                            <span class="text-sm">All the code is public, and we maintain and update it regularly.</span>
                        </div>
                    </div>
                </div>

                <p class="text-sm text-zinc-400 mt-2"><b class="text-zinc-300">Feedback?</b> We are a small team and would love to hear any feedback you have! Let us know what you think on our <a href="https://discord.datapackhub.net/" class="link">Discord server</a>.</p>

                <p class="text-sm text-zinc-400 mt-1"><b class="text-zinc-300">Bugs?</b> Report them on our <a href="https://discord.datapackhub.net/" class="link">Discord server</a>, or create an issue on <a href="https://github.com/Datapack-Hub/text/issues" class="link">Github</a>.</p>

                <p class="text-zinc-500 text-xs mt-2">This site is maintained by Datapack Hub, and is <b>not</b> endorsed by Mojang Studios.</p>
                    
                <noscript>
                    <div class="rounded-md border-2 border-red-500 bg-red-500/20 px-3 py-2 mt-2 text-rose-200">
                        <h1 class="font-bold text-white">This website requires JavaScript to work.</h1>
                        <p class="text-sm">Please enable Javascript access in your site settings, then refresh the page. If you still see this notice, try a different browser, or ask for help in our <a href="https://discord.datapackhub.net/">Discord server</a>.</p>
                    </div>
                </noscript>
            </div>
        </div>
    </div>
</div>
{/if}