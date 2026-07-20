<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";
	import { Editor } from "@tiptap/core";

	// prettier-ignore
	const chars = ["¶","×","Ø","Þ","÷","ø","þ","…","™","►","•","♦","≈","❛","∘","∙","✿","⚈","∆","∇","≡","≣","≪","≫","⋘","⋙","‡","₪","۩","۞","⌗","⌘","∅","∏","∑","√","∞","〰","〽","╱","╲","╳","᜵","᜶","ᚋ","ᚌ","ᚍ","ᚎ","ᚏ","⊏","⊐","⊓","⊔","⊕","⊖","⊗","⊘","⊙","⊞","⊟","⊠","⊡","╭","╮","╰","╯","←","↑","→","↓","↔","↕","↖","↗","↘","↙","↩","↪","▶","◀","⤴","⤵","⇐","⇑","⇒","⇓","⇔","⇕","⇦","⇧","⇨","⇩","➡","⬅","⬆","⬇","☚","☛","☜","☝","☞","☟","∎","▁","▂","▃","▄","▅","▆","▇","█","▉","▊","▋","▌","▍","▎","▏","▐","░","▒","▓","▚","▞","■","□","▢","▣","▤","▥","▦","◧","◨","◩","◪","▲","△","▶","▷","◆","◇","◊","○","◌","●","◐","◑","◒","◓","◔","◕","◢","◣","◤","◥","★","☆","⭐","◻","◼","◽","◾","⚪","⚫","✳","✴","❇","፠","።","፧","፨","⁂","⁑","⁎","ᐁ","ᐃ","ᐅ","ᐊ","ᑌ","ᑎ","ᑐ","ᑕ","ᒣ","ᒥ","ᒧ","ᒪ","⬖","⬗","⬘","⬙","⬚","⬛","⬜","⬝","⬞","⬟","⬠","⬡","⬢","⬣","⬤","⬥","⬦","⬧","⬨","─","│","┅","┇","┌","┐","└","┘","├","┤","┬","┴","┼","═","║","╔","╗","╚","╝","╠","╣","╧","╩","╬","⓪","①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳","⓿","❶","❷","❸","❹","❺","❻","❼","❽","❾","❿","⓫","⓬","⓭","⓮","⓯","⓰","⓱","⓲","⓳","⓴","⓵","⓶","⓷","⓸","⓹","⓺","⓻","⓼","⓽","⓾","☐","☑","☒","⚐","⚑","♠","♣","♥","♦","✔","✖","❤","©","®","‼","⁉","™","Ⓜ","♻","⚠","⚡","☠","☢","☮","☯","☺","☻","☹","♀","♂","♩","♪","♫","♬","⚀","⚁","⚂","⚃","⚄","⚅","☀","☁","☂","☔","☃","☼","☽","☾","❄","⌚","⌛","☎","✂","✉","✎","✏","✒","♿","⚓","✈","✌","☕","♨","☺","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

	let {
		unicodeSelectorDialog = $bindable(),
		editor,
	}: {
		unicodeSelectorDialog: Modal;
		editor: Editor;
	} = $props();
</script>

<Modal
	title="Select Custom Unicode Character"
	bind:this={unicodeSelectorDialog}
	key="U"
	flexible>
	<div class="flex w-full flex-col space-y-2">
		<p>Click to insert a custom character:</p>
		<!-- big screens -->
		<div class="hidden grid-flow-col-dense grid-rows-12 gap-1 xl:grid">
			{#each chars as char}
				<button
					class="font-minecraft aspct-square h-9 w-9 rounded-md bg-zinc-900 p-2"
					onclick={() => editor.chain().focus().insertContent(char).run()}
					>{char}</button>
			{/each}
		</div>

		<!-- mid screens -->
		<div
			class="hidden grid-flow-row-dense gap-1 md:grid xl:hidden"
			style="grid-template-columns: repeat(17, minmax(0, 1fr));">
			{#each chars as char}
				<button
					class="font-minecraft aspct-square h-9 w-9 rounded-md bg-zinc-900 p-2"
					onclick={() => editor.chain().focus().insertContent(char).run()}
					>{char}</button>
			{/each}
		</div>

		<!-- smol screens -->
		<div class="grid grid-flow-row-dense grid-cols-11 gap-1 md:hidden">
			{#each chars as char}
				<button
					class="font-minecraft aspct-square h-9 w-9 rounded-md bg-zinc-900 p-2"
					onclick={() => editor.chain().focus().insertContent(char).run()}
					>{char}</button>
			{/each}
		</div>
	</div>
</Modal>
