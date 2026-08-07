import { writable } from "svelte/store";
import { versions } from "./types";

export const outputVersion = writable(versions[versions.length - 1]);