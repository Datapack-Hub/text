<script lang="ts">
	import Modal from "$lib/Modal.svelte";
	import { Editor } from "@tiptap/core";

	const chars = ["¶","×","Ø","Þ","÷","ø","þ","…","™","►","•","♦","≈","❛","∘","∙","✿","⚈","∆","∇","≡","≣","≪","≫","⋘","⋙","‡","₪","۩","۞","⌗","⌘","∅","∏","∑","√","∞","〰","〽","╱","╲","╳","᜵","᜶","ᚋ","ᚌ","ᚍ","ᚎ","ᚏ","⊏","⊐","⊓","⊔","⊕","⊖","⊗","⊘","⊙","⊞","⊟","⊠","⊡","╭","╮","╰","╯","←","↑","→","↓","↔","↕","↖","↗","↘","↙","↩","↪","▶","◀","⤴","⤵","⇐","⇑","⇒","⇓","⇔","⇕","⇦","⇧","⇨","⇩","➡","⬅","⬆","⬇","☚","☛","☜","☝","☞","☟","∎","▁","▂","▃","▄","▅","▆","▇","█","▉","▊","▋","▌","▍","▎","▏","▐","░","▒","▓","▚","▞","■","□","▢","▣","▤","▥","▦","◧","◨","◩","◪","▲","△","▶","▷","◆","◇","◊","○","◌","●","◐","◑","◒","◓","◔","◕","◢","◣","◤","◥","★","☆","⭐","◻","◼","◽","◾","⚪","⚫","✳","✴","❇","፠","።","፧","፨","⁂","⁑","⁎","ᐁ","ᐃ","ᐅ","ᐊ","ᑌ","ᑎ","ᑐ","ᑕ","ᒣ","ᒥ","ᒧ","ᒪ","⬖","⬗","⬘","⬙","⬚","⬛","⬜","⬝","⬞","⬟","⬠","⬡","⬢","⬣","⬤","⬥","⬦","⬧","⬨","─","│","┅","┇","┌","┐","└","┘","├","┤","┬","┴","┼","═","║","╔","╗","╚","╝","╠","╣","╧","╩","╬","⓪","①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳","⓿","❶","❷","❸","❹","❺","❻","❼","❽","❾","❿","⓫","⓬","⓭","⓮","⓯","⓰","⓱","⓲","⓳","⓴","⓵","⓶","⓷","⓸","⓹","⓺","⓻","⓼","⓽","⓾","☐","☑","☒","⚐","⚑","♠","♣","♥","♦","✔","✖","❤","©","®","‼","⁉","™","Ⓜ","♻","⚠","⚡","☠","☢","☮","☯","☺","☻","☹","♀","♂","♩","♪","♫","♬","⚀","⚁","⚂","⚃","⚄","⚅","☀","☁","☂","☔","☃","☼","☽","☾","❄","⌚","⌛","☎","✂","✉","✎","✏","✒","♿","⚓","✈","✌","☕","♨","☺","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"]

	let {
		unicodeSelectorDialog = $bindable(),
		editor,
	}: {
		unicodeSelectorDialog: Modal,
		editor: Editor
	} = $props();
</script>

<Modal title="Select Custom Unicode Character" bind:this={unicodeSelectorDialog} key="G" opened flexible>
	<div class="flex flex-col w-full space-y-2">
		<p>Click to insert a custom character:</p>
		<!-- big screens -->
		<div class="hidden xl:grid grid-flow-col-dense grid-rows-12 gap-1">
			{#each chars as char}
			<button 
			class="bg-zinc-900 p-2 font-minecraft aspct-square w-9 h-9 rounded-md"
			onclick={() => editor.chain().focus().insertContent(char).run()}>{char}</button>
			{/each}
		</div>
		
		<!-- mid screens -->
		<div class="hidden md:grid xl:hidden grid-flow-row-dense gap-1" style="grid-template-columns: repeat(17, minmax(0, 1fr));">
			{#each chars as char}
			<button 
			class="bg-zinc-900 p-2 font-minecraft aspct-square w-9 h-9 rounded-md"
			onclick={() => editor.chain().focus().insertContent(char).run()}>{char}</button>
			{/each}
		</div>
		
		<!-- smol screens -->
		<div class="grid md:hidden grid-flow-row-dense gap-1 grid-cols-11">
			{#each chars as char}
			<button 
			class="bg-zinc-900 p-2 font-minecraft aspct-square w-9 h-9 rounded-md"
			onclick={() => editor.chain().focus().insertContent(char).run()}>{char}</button>
			{/each}
		</div>
	</div>
</Modal>
