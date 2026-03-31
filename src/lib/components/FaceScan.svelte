<script lang="ts">
	import { onMount } from "svelte";

	let videoBinding: HTMLVideoElement = $state()!;
	let buttonBinding: HTMLButtonElement = $state()!;
	let textBinding: HTMLParagraphElement = $state()!;

	let infoMsg = $state("Please allow camera access to start the face scan.");
	let showProgress = $state(false);
	let progressValue = $state(0);
	let notDone = $state(true);

	onMount(() => {
		textBinding.classList.remove("fade-out");

		// Check if the browser supports media devices
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			infoMsg =
				"Your browser does not support camera access. Please use a compatible browser and try again.";
			buttonBinding.disabled = true;
			return;
		}
	});

	async function openCamera() {
		if (buttonBinding.disabled) return;

		await navigator.mediaDevices
			.getUserMedia({
				video: {
					facingMode: "user",
				},
			})
			.then((stream) => {
				videoBinding.srcObject = stream;
				videoBinding.play();
				funnyMessages(stream);
				showProgress = true;
			})
			.catch((err) => {
				infoMsg =
					"Unable to access camera. Please allow camera access and try again.";
				console.error("Error accessing camera:", err);
				return;
			});
	}

	async function funnyMessages(stream: MediaStream) {
		if (showProgress) return;
		buttonBinding.disabled = true;
		const audio = new Audio("facescan.mp3");
		audio.volume = 0;
		await audio.play();
		new Promise((resolve) => {
			const fadeInInterval = setInterval(() => {
				if (audio.volume < 0.5) {
					audio.volume = Math.min(audio.volume + 0.1, 0.5);
				} else {
					clearInterval(fadeInInterval);
					resolve(null);
				}
			}, 200);
		});

		const messages = [
			"Analyzing facial features...",
			"Calculating age based on wrinkles...",
			"Comparing your face to a database of celebrities...",
			"Checking for signs of wisdom and experience...",
			"Determining if you look like a responsible adult...",
			"Assessing your fashion sense for age clues...",
			"Evaluating your ability to use technology...",
			"Turn a little to the left for a better angle...",
			"Turn a little to the right for a better angle...",
			"Hold still while we scan your face...",
			"Almost there, just a few more seconds...",
			"Warming up unsafe servers...",
			"Consulting the ancient scrolls of age verification...",
			"Impregnating Flyrr...",
			"🚟",
		];
		for (let i = 0; i < 15; i++) {
			let duration = 300 + Math.random() * 2000;
			await new Promise((resolve) =>
				setTimeout(() => {
					textBinding.classList.remove("fade-out");
					resolve(null);
				}, 300),
			);
			infoMsg = messages[Math.floor(Math.random() * messages.length)];
			progressValue = i + 1;
			await new Promise((resolve) =>
				setTimeout(() => {
					textBinding.classList.add("fade-out");
					resolve(null);
				}, duration),
			);
		}
		new Promise((resolve) => {
			const fadeOutInterval = setInterval(() => {
				if (audio.volume >= 0.05) {
					audio.volume = Math.min(audio.volume - 0.1, 0.5);
				} else {
					clearInterval(fadeOutInterval);
					audio.pause();
					resolve(null);
				}
			}, 200);
		});
		textBinding.classList.remove("fade-out");
		infoMsg = "Age verification complete! You may now access the text editor.";
		showProgress = false;
		await new Promise((resolve) => setTimeout(resolve, 3000));
		notDone = false;
		for (const track of stream.getVideoTracks()) {
			track.stop();
		}
	}

	function forceClose(
		e: KeyboardEvent & {
			currentTarget: EventTarget & Window;
		},
	) {
		if(e.ctrlKey && e.key === "Enter") {
			notDone = false;
			e.preventDefault();
		}
	}
</script>

<svelte:window
	onkeydown={forceClose} />

{#if notDone}
	<div
		class="fixed z-50 flex h-full w-screen items-center justify-center bg-black/80 overflow-y-auto">
		<div class="z-50 m-auto w-3/4 py-4 lg:w-2/3 xl:w-1/2">
			<div class="flex items-center rounded-t-lg bg-zinc-900 p-4">
				<span class="grow text-lg font-bold">Age Verification Required</span>
			</div>
			<div class="flex flex-col items-center rounded-b-lg bg-zinc-800 p-4">
				<p class="mb-4 w-[80%]">
					To comply with local regulations regarding age verification, we need
					to verify your age before granting access to the text editor. Please
					use the face scan feature below to confirm that you are of legal age.
					<br /><br />
					Once your age is confirmed, this message will disappear and you can start
					using the text editor. Thank you for your understanding!
				</p>
				<button
					bind:this={buttonBinding}
					class="rounded bg-orange-500 px-4 py-2 text-sm text-black transition-all hover:bg-orange-600"
					onclick={openCamera}>
					Start Scan
				</button>
				<!-- silly compiler, this is for a camera feed! it doesn't *have* captions! -->
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					bind:this={videoBinding}
					class="mt-6 aspect-video w-[80%] rounded-md bg-zinc-950"></video>
				<div
					class="mt-4 w-[80%] rounded-sm bg-zinc-950 {showProgress
						? ''
						: 'hidden'}"
					role="progressbar"
					aria-valuemax="25"
					aria-valuenow={progressValue}
					aria-label="Face scan progress">
					<div
						class="h-4 rounded-sm bg-orange-500 motion-safe:transition-all"
						style={`width: ${progressValue * 5}%`}>
					</div>
				</div>
				<p id="infomsg_face" class="fade-out pt-6" bind:this={textBinding}>
					{infoMsg}
				</p>
				<p class="text-very-sm pt-2 opacity-50">
					(We don't actually do anything with this, Happy April Fools!)
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	#infomsg_face.fade-out {
		transition: opacity 0.2s ease;
		opacity: 0;
	}

	#infomsg_face:not(.fade-out) {
		transition: opacity 0.2s ease;
		opacity: 1;
	}
</style>
