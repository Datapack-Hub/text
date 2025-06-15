<script lang="ts">
	import Modal from "$lib/Modal.svelte";

	let {
		fontUploadModal = $bindable(),
	} = $props();


</script>

<Modal title="Upload a font" bind:this={fontUploadModal} key="U" opened>
	<label for="fontFileUpload" class="flex items-center justify-center bg-zinc-900 p-6 rounded-md">
		<p>blah</p>
	</label>
	<input class="hidden" type="file" name="fontFileUpload">
</Modal>
