<script lang="ts">
    import Modal from "#lib/components/Modal.svelte";
    import { Editor } from "@tiptap/core";
    import IconRight from "~icons/tabler/chevron-right";
    import IconDown from "~icons/tabler/chevron-down";
    import CheckBox from "../CheckBox.svelte";

    let sections = $state([
        {
            name: "Useful Characters",
            open: false ,
            chars: ["✔","❌","✘","™","®","©","℗","�"]
        },
        {
            name: "Utility Symbols",
            open: false,
            chars: ["ℹ","⚠","✎","⏻","⚑","⚐","⌚","✉","⚥","♀","♂","⌂","⌛","⏳","◎","⌀"],
        },
        {
            name: "Button Symbols",
            open: false,
            chars: ["☐","☑","☒","⏏","⏩","⏪","⏭","⏮","⏯","⏴","⏵","⏶","⏷","⏸","⏹","⏺","●","⏼","⌘"],
        },
        {
            name: "Arrow Symbols",
            open: false,
            chars: ["←","↑","→","↓","↔","⇄","⇵","▲","△","▶","▷","▼","▽","◀","◁","⏴","⏵","⏶","⏷","«","»","☜","☞"],
        },
        {
            name: "Fun Symbols",
            open: false,
            chars: ["☹","☺","☻","☠","☽","⛨","⚡","⚓","⚔","⛄","☃","❄","🌊","☂","☔","☁","🌧","⛈","☄","🔥","☀","🧪","⚗","✂","🎣","🗡","🏹","⛏","🪓","🔱","🛡",],
        },
        {
            name: "Other Symbols",
            open: false,
            chars: ["♪","♫","♬","♩","♭","♮","♯","⚀","⚁","⚂","⚃","⚄","⚅","☮","⓪","☈"],
        },
        {
            name: "Shapes",
            open: false,
            chars: ["●","◘","◦","■","□","◆","◇","○","⭘","♠","♤","♡","♥","♢","♦","♧","♣","★","☆","⯪","⯫","⭐","❤","❣","⧈","◎"],
        },
        {
            name: "Math and Logic",
            open: false,
            chars: ["⅟","½","⅓","¼","ⁿ","√","∛","∜","∀","∃","∄","∈","∉","∋","∌","⊂","⊄","⊆","⊃","⊅","⊇","∅","⋃","∑","∂","∫","⌠","⌡","∮","∞","≈","≠","≡","≢","≥","≤","±","∓","−","＋","÷","∧","∨","⊻","⊼","⊽","⊢","⊨","⊤","⊥","∥","≔","∁","∴","∵","·","⇏","⇒","⇔"],
        },
        {
            name: "Subscript and Superscript",
            open: false,
            chars: ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉","₊","₋","₌","₍","₎","⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹","⁺","⁻","⁼","⁽","⁾"]
        },
        {
            name: "Blocky Letters",
            open: false,
            chars: ["Ⓐ","Ⓑ","Ⓒ","Ⓓ","Ⓔ","Ⓕ","Ⓖ","Ⓗ","Ⓘ","Ⓙ","Ⓚ","Ⓛ","Ⓜ","Ⓝ","Ⓞ","Ⓟ","Ⓠ","Ⓡ","Ⓢ","Ⓣ","Ⓤ","Ⓥ","Ⓦ","Ⓧ","Ⓨ","Ⓩ","ⓐ","ⓑ","ⓒ","ⓓ","ⓔ","ⓕ","ⓖ","ⓗ","ⓘ","ⓙ","ⓚ","ⓛ","ⓜ","ⓝ","ⓞ","ⓟ","ⓠ","ⓡ","ⓢ","ⓣ","ⓤ","ⓥ","ⓦ","ⓧ","ⓨ","ⓩ","①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳"],
        },
        {
            name: "Writing",
            open: false,
            chars: ["¶","⁋","Є","〒","⏽","«","»","‹","›","※","‼","‽","⁈","⁉","⁎","⁑","⁂","⁒","⸘","⸮"],
        },
        {
            name: "Cultural",
            open: false,
            chars: ["☯", "☲", "☵", "☰", "☱", "☳", "☴", "☶", "☷"],
        },
        {
            name: "Gothic Alphabet",
            open: false,
            chars: ["𐌰","𐌱","𐌲","𐌳","𐌴","𐌵","𐌶","𐌷","𐌸","𐌹","𐌺","𐌻","𐌼","𐌽","𐌾","𐌿","𐍀","𐍁","𐍂","𐍃","𐍄","𐍅","𐍆","𐍇","𐍈","𐍉","𐍊"],
        },
        {
            name: "Runes",
            open: false,
            chars: ["ᚠ","ᚡ","ᚢ","ᚣ","ᚤ","ᚥ","ᚦ","ᚧ","ᚨ","ᚩ","ᚪ","ᚫ","ᚬ","ᚭ","ᚮ","ᚯ","ᚰ","ᚱ","ᚲ","ᚳ","ᚴ","ᚵ","ᚶ","ᚷ","ᚸ","ᚹ","ᚺ","ᚻ","ᚼ","ᚽ","ᚾ","ᚿ","ᛀ","ᛁ","ᛂ","ᛃ","ᛄ","ᛅ","ᛆ","ᛇ","ᛈ","ᛉ","ᛊ","ᛋ","ᛌ","ᛍ","ᛎ","ᛏ","ᛐ","ᛑ","ᛒ","ᛓ","ᛔ","ᛕ","ᛖ","ᛗ","ᛘ","ᛙ","ᛚ","ᛛ","ᛜ","ᛝ","ᛞ","ᛟ","ᛠ","ᛡ","ᛢ","ᛣ","ᛤ","ᛥ","ᛦ","ᛧ","ᛨ","ᛩ","ᛪ","᛫","᛬","᛭","ᛮ","ᛯ","ᛰ","ᛱ","ᛲ","ᛳ","ᛴ","ᛵ","ᛶ","ᛷ","ᛸ"]
        }
    ])

    let show_bold = $state(false);

    let {
        unicodeSelectorDialog = $bindable(),
        editor,
    }: {
        unicodeSelectorDialog: Modal;
        editor: Editor;
    } = $props();
</script>

<Modal title="Insert Special Character" bind:this={unicodeSelectorDialog} key="U" flexible>
    <div class="flex flex-col">
        <p class="mb-2 max-w-239 text-sm text-zinc-400">
            In Minecraft, these special Unicode characters display in the pixely Minecraft font, and
            can be used to spice up text without needing a custom font. Source: <a
                class="link"
                href="https://gist.github.com/tarkodev/ec3604b007e543d2f9e596f4e1d63d9c"
                target="_blank">tarkodev on GitHub</a
            >.
        </p>
        <!-- big screens -->
        <div class="h-0 w-239"></div>
        <div class="space-y-2">
            <div class="flex items-center space-x-2">
                <div class="mr-3 flex items-center space-x-2 text-sm">
                    <CheckBox bind:value={show_bold} label="bold" />
                    <label for="bold">Show bold symbols</label>
                </div>
                <button
                    class="w-fit rounded-md bg-zinc-900 p-1.5 text-sm hover:bg-black/50"
                    onclick={() => sections.forEach((s) => (s.open = true))}>Expand All</button>
                <button
                    class="w-fit rounded-md bg-zinc-900 p-1.5 text-sm hover:bg-black/50"
                    onclick={() => sections.forEach((s) => (s.open = false))}>Collapse All</button>
            </div>
            {#each sections as sect}
                <div class="flex flex-col space-y-1">
                    <button
                        class="flex w-fit items-center space-x-2"
                        onclick={() => (sect.open = !sect.open)}>
                        {#if sect.open}<IconDown />{:else}<IconRight />{/if}
                        <span class="font-bold">{sect.name}</span>
                    </button>
                    {#if sect.open}
                        <div
                            class="grid w-fit grid-flow-dense grid-cols-8 gap-1 sm:grid-cols-12 md:grid-cols-17 lg:grid-cols-20 xl:grid-cols-24">
                            {#each sect.chars as char}
                                <button
                                    class="m-auto grid place-items-center {show_bold
                                        ? 'font-minecraft-bold'
                                        : 'font-minecraft'} aspect-square h-9 w-9 rounded-md bg-zinc-900 text-xl text-zinc-300 hover:text-white"
                                    onclick={() =>
                                        editor.chain().focus().insertContent(char!).run()}>
                                    <span class="translate-x-px">{char}</span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</Modal>
