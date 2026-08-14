<script lang="ts">
    import IconImport from "~icons/tabler/upload";
    import IconGradient from "~icons/tabler/contrast-2";
    import IconLore from "~icons/tabler/swords";
    import IconCode from "~icons/tabler/code";
</script>

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
                    <span class="text-lg font-bold m-2 bg-linear-to-r from-red-500 to-yellow-600 bg-clip-text text-transparent">Minecraft Text Editor</span>
                    <div class="grow"></div>
                    <button aria-label="close" class="p-2 hover:bg-black/15 rounded-md" onclick={close}>X</button>
                </div>
                <div class="rounded-b-lg px-4 pb-4 flex flex-col space-y-1 bg-zinc-900">
                    <p>Welcome! </p>
                    <p class="text-zinc-300 text-sm">With this tool, easily generate text for Minecraft datapacks, tellraw commands, and more. Here's what else we have to offer:</p>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">

                        <div class="flex items-center space-x-2 bg-zinc-800 text-zinc-200 rounded-md border-rose-500 p-2 border-0 shadow-xl drop-shadow-lg">
                            <IconImport class="w-[7.5%] lg:w-1/5" />
                            <div class="flex flex-col space-y-1 my-1">
                                <span class="uppercase text-xs text-zinc-500 font-bold">Import</span>
                                <span class="text-sm">Import text components from any version into the editor to make adjustments.</span>
                            </div>
                        </div>

                        <div class="flex items-center space-x-2 bg-zinc-800 text-zinc-200 rounded-md border-rose-500 p-2 border-0 shadow-xl drop-shadow-lg">
                            <IconGradient class="w-[7.5%] lg:w-1/5" />
                            <div class="flex flex-col space-y-1 my-1">
                                <span class="uppercase text-xs text-zinc-500 font-bold">Gradient</span>
                                <span class="text-sm">Easily add gradients to text, without the output being insanely long.</span>
                            </div>
                        </div>

                        <div class="flex items-center space-x-2 bg-zinc-800 text-zinc-200 rounded-md border-rose-500 p-2 border-0 shadow-xl drop-shadow-lg">
                            <IconLore class="w-[7.5%] lg:w-1/5" />
                            <div class="flex flex-col space-y-1 my-1">
                                <span class="uppercase text-xs text-zinc-500 font-bold">Lore output</span>
                                <span class="text-sm">With two clicks, get an output correctly formatted for item lore components.</span>
                            </div>
                        </div>

                        <div class="flex items-center space-x-2 bg-zinc-800 text-zinc-200 rounded-md border-rose-500 p-2 border-0 shadow-xl drop-shadow-lg">
                            <IconCode class="w-[7.5%] lg:w-1/5" />
                            <div class="flex flex-col space-y-1 my-1">
                                <span class="uppercase text-xs text-zinc-500 font-bold">Open source</span>
                                <span class="text-sm">All the code that makes this work is public. We maintain and update the site regularly.</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-zinc-300 text-xs mt-2">This site is maintained by Datapack Hub, and is <b>not</b> endorsed by Mojang Studios.</p>
                </div>
            </div>
        </div>
    </div>

