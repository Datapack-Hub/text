import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import Icons from "unplugin-icons/vite";
import tailwindcss from "@tailwindcss/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-cloudflare";

export default defineConfig({
    plugins: [
        sveltekit({
            preprocess: vitePreprocess(),
            adapter: adapter(),
        }),
        Icons({ compiler: "svelte" }),
        tailwindcss(),
    ],
    test: {
        projects: [
            {
                extends: "./vite.config.ts",
                test: {
                    name: "server",
                    environment: "node",
                    include: ["src/tests/unit/**/*.{test,spec}.{js,ts}"],
                    exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
                },
            },
        ],
    },
});
