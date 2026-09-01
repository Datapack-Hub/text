<script lang="ts">
    import IconImport from "~icons/tabler/upload";
    import IconGradient from "~icons/tabler/contrast-2";
    import IconLore from "~icons/tabler/swords";
    import IconCode from "~icons/tabler/code";
    import IconClose from "~icons/tabler/X";
    import { onMount } from "svelte";
    import { welcomeScreenFormat } from "$lib/globals";

    let { visible = $bindable(false) }: { visible: boolean } = $props();

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape" && visible) {
            visible = false;
        }
    }

    onMount(() => {
        let seenWelcome = localStorage.getItem("seen_welcome");
        if (seenWelcome && seenWelcome == welcomeScreenFormat) {
            visible = false;
        } else {
            visible = true;
            localStorage.setItem("seen_welcome", welcomeScreenFormat);
        }
    });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
    <div class="absolute">
        <div
            class="fixed top-0 left-0 z-40 flex h-screen w-screen flex-col items-center overflow-auto bg-black/65 text-zinc-100"
            style="font-family: Lexend">
            <div
                aria-hidden="true"
                onclick={() => (visible = false)}
                class="fixed top-0 left-0 z-40 h-screen w-screen bg-transparent"
                tabindex="-1">
            </div>
            <div class="z-50 m-auto w-[95%] py-4 md:w-[50%] 2xl:w-[40%]">
                <div class="flex items-center rounded-t-lg bg-zinc-900 p-2 text-xl">
                    <img src="/dph.svg" class="ml-1 h-8" alt="logo" />
                    <span
                        class="m-2 bg-linear-to-r from-red-500 to-yellow-500 bg-clip-text text-lg font-black text-transparent"
                        >Minecraft Text Editor</span>
                    <div class="grow"></div>
                    <button
                        aria-label="close"
                        class="rounded-md p-2 hover:bg-black/15"
                        onclick={() => (visible = false)}><IconClose /></button>
                </div>
                <div class="flex flex-col space-y-1 rounded-b-lg bg-zinc-900 px-4 pb-4">
                    <h1 class="font-black">Welcome!</h1>
                    <p class="text-sm text-zinc-300">
                        With this tool, you can easily generate text components for Minecraft
                        datapacks, tellraw commands, and more. Here's what makes us unique:
                    </p>

                    <div class="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                        <div
                            class="flex items-center space-x-2 rounded-md border-2 border-green-500 bg-green-500/20 p-2 text-zinc-200 shadow-xl drop-shadow-lg">
                            <IconImport class="w-[7.5%] lg:w-1/10" />
                            <div class="my-1 flex w-[92.5%] flex-col space-y-1 lg:w-9/10">
                                <span class="text-xs font-bold text-green-500 uppercase"
                                    >Import</span>
                                <span class="text-sm text-green-100"
                                    >Import text components from any version into the editor.</span>
                            </div>
                        </div>

                        <div
                            class="flex items-center space-x-2 rounded-md border-2 border-rose-500 bg-rose-500/20 p-2 text-zinc-200 shadow-xl drop-shadow-lg">
                            <IconGradient class="w-[7.5%] lg:w-1/10" />
                            <div class="my-1 flex w-[92.5%] flex-col space-y-1 lg:w-9/10">
                                <span class="text-xs font-bold text-rose-500 uppercase"
                                    >Gradient</span>
                                <span class="text-sm text-rose-100"
                                    >Add gradients to text, while keeping styles and interactivity.</span>
                            </div>
                        </div>

                        <div
                            class="flex items-center space-x-2 rounded-md border-2 border-blue-500 bg-blue-500/20 p-2 text-zinc-200 shadow-xl drop-shadow-lg">
                            <IconLore class="w-[7.5%] lg:w-1/10" />
                            <div class="my-1 flex w-[92.5%] flex-col space-y-1 lg:w-9/10">
                                <span class="text-xs font-bold text-blue-500 uppercase"
                                    >Lore output</span>
                                <span class="text-sm text-blue-100"
                                    >Get an output correctly formatted for item lore components.</span>
                            </div>
                        </div>

                        <div
                            class="flex items-center space-x-2 rounded-md border-2 border-zinc-500 bg-zinc-800 p-2 text-zinc-200 shadow-xl drop-shadow-lg">
                            <IconCode class="w-[7.5%] lg:w-1/10" />
                            <div class="my-1 flex w-[92.5%] flex-col space-y-1 lg:w-9/10">
                                <span class="text-xs font-bold text-zinc-500 uppercase"
                                    >Open source</span>
                                <span class="text-sm"
                                    >All the code is public, and we maintain and update it
                                    regularly.</span>
                            </div>
                        </div>
                    </div>

                    <p class="mt-2 text-sm text-zinc-400">
                        <b class="text-zinc-300">Feedback?</b> We are a small team and would love to
                        hear any feedback you have! Let us know what you think on our
                        <a href="https://discord.datapackhub.net/" class="link">Discord server</a>.
                    </p>

                    <p class="mt-1 text-sm text-zinc-400">
                        <b class="text-zinc-300">Bugs?</b> Report them on our
                        <a href="https://discord.datapackhub.net/" class="link">Discord server</a>,
                        or create an issue on
                        <a href="https://github.com/Datapack-Hub/text/issues" class="link">Github</a
                        >.
                    </p>

                    <p class="mt-2 text-xs text-zinc-500">
                        This site is maintained by Datapack Hub, and is <b>not</b> endorsed by Mojang
                        Studios.
                    </p>

                    <noscript>
                        <div
                            class="mt-2 rounded-md border-2 border-red-500 bg-red-500/20 px-3 py-2 text-rose-200">
                            <h1 class="font-bold text-white">
                                This website requires JavaScript to work.
                            </h1>
                            <p class="text-sm">
                                Please enable Javascript access in your site settings, then refresh
                                the page. If you still see this notice, try a different browser, or
                                ask for help in our <a href="https://discord.datapackhub.net/"
                                    >Discord server</a
                                >.
                            </p>
                        </div>
                    </noscript>
                </div>
            </div>
        </div>
    </div>
{/if}
