// src/lib/stores/settings.js
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Settings = {
    showCharacterCount: boolean;
    syntaxHighlight: boolean;
    realisticLineHeight: boolean
};

function createPersistentStore(key: string, startValue: any) {
    var value = browser ? localStorage.getItem(key) ?? startValue : startValue;
    if (typeof value == "string"){
        value = JSON.parse(value)
    } else {
        value = value
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

// Example usage for app settings
export const appSettings: Writable<Settings> = createPersistentStore('settings', {
    showCharacterCount: true,
    syntaxHighlight: true,
    realisticLineHeight: false
});
