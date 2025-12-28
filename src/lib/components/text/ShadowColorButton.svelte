<script lang="ts">
	import { tooltip } from "$lib/tooltip";
	import IconShadow from "~icons/tabler/shadow";

	interface Props {
		/** DOM element of the label wrapper */
		labelElement: HTMLLabelElement | undefined;
		/** hex color */
		hex: string | null;
		/** input label */
		label: string;
		/** input name, useful in a native form */
		name?: string | undefined;
		/** directionality left to right, or right to left*/
		dir: "ltr" | "rtl";
		small?: boolean;
	}

	let {
		labelElement = $bindable(),
		hex,
		label,
		name = undefined,
		dir,
		small,
	}: Props = $props();
</script>

<label bind:this={labelElement} {dir}>
	<button
		aria-label="Shadow Color"
		{@attach tooltip}
		class="p-1 {small
			? 'text-sm'
			: 'text-lg'} rounded-md bg-zinc-800 font-medium hover:bg-white/3">
		<IconShadow />
	</button>
</label>
