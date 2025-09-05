import { writable } from "svelte/store";

export const outputVersion = writable({
    friendly: "1.21.9+", 
    description: "'object' type added, allowing you to use non-character sprites",
    index: 2
})