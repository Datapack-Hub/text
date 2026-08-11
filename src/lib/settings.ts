import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";

export type Settings = {
    showCharacterCount: boolean; // whether the character count is shown
    syntaxHighlight: boolean; // whether to show highlighted output text
    realisticLineHeight: boolean; // whether to use smaller line height
    hideSelectionExport: boolean; // whether to hide the export this button
    fontSize: number; // 0 = small, 1 = default, 2 = large
};

function createPersistentStore(key: string, startValue: any) {
    var value = browser ? (localStorage.getItem(key) ?? startValue) : startValue;
    if (typeof value == "string") {
        value = JSON.parse(value);
    } else {
        value = value;
    }

    const store = writable(value);

    store.subscribe((value) => {
        if (browser) {
            const stringValue = JSON.stringify(value);
            localStorage.setItem(key, stringValue);
        }
    });

    return store;
}

export const appSettings: Writable<Settings> = createPersistentStore("settings", {
    showCharacterCount: true,
    syntaxHighlight: true,
    realisticLineHeight: false,
    hideSelectionExport: true,
    fontSize: 1,
});
