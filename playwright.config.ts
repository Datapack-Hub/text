import { defineConfig } from "@playwright/test";

export default defineConfig({
	webServer: {
		command: "npm run build && npm run preview",
		port: 4173,
	},
	fullyParallel: true,
	testDir: "src/tests/e2e",
});
