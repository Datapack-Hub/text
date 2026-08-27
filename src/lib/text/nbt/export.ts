import type { MinecraftText, OldMinecraftText, StringyMCText, TranslateOptions } from "$lib/types";
import { type JSONContent } from "@tiptap/core";
import {
    defaultColorLUT,
    findMarkType,
    rgbaToArgbHex,
    trueMarkOrUndefined,
    unescapeUnicode,
} from "../utils";
import { outputVersion } from "$lib/stores";
import { get } from "svelte/store";
import { optimise } from "./optimiser";

let exportVersion = get(outputVersion);

/**
 * Applies the specific properties for a type of source or provider
 *
 * @param current current text component
 * @param c the current editor JSON
 * @param includeInteractivity should it have click and hover events
 * @param outputVersion the version to export to
 * @returns the current component with new properties
 */
export function addTypeSpecificValues( // TODO maybe merge this into constructComponent()
    current: MinecraftText,
    c: JSONContent,
    includeInteractivity = true,
) {
    exportVersion = get(outputVersion);

    switch (c.type) {
        case "text":
            current.text = unescapeUnicode(c.text!);
            break;
        case "score":
            current.score = {
                name: c.attrs?.name,
                objective: c.attrs?.objective,
            };
            break;
        case "translate":
            current.translate = c.attrs?.key;
            if (c.attrs?.params && c.attrs?.params.length !== 0) {
                current.with = c.attrs?.params;
            }
            if (c.attrs?.fallback) {
                current.fallback = c.attrs?.fallback;
            }
            break;
        case "storage_nbt":
        case "block_nbt":
        case "entity_nbt":
            current.nbt = c.attrs?.nbt;
            current.storage = c.attrs?.storage;
            current.block = c.attrs?.block;
            current.entity = c.attrs?.entity;
            current.interpret = c.attrs?.interpret || undefined;
            break;
        case "keybind":
            current.keybind = c.attrs?.key;
            break;
        case "atlas_object":
            if (exportVersion.index >= 2) {
                if (c.attrs?.atlas && c.attrs?.atlas !== "") {
                    current.atlas = c.attrs?.atlas;
                }
                current.sprite = c.attrs?.sprite;

                current.bold = undefined;
                current.italic = undefined;
                current.obfuscated = undefined;
            } else {
                current.text = "";
            }
            break;
        case "player_object":
            if (exportVersion.index >= 2) {
                current.object = "player";
                current.player = {
                    name: c.attrs?.player.name,
                };
                current.hat = c.attrs?.hat;

                current.bold = undefined;
                current.italic = undefined;
                current.obfuscated = undefined;
            } else {
                current.text = "";
            }
            break;
        case "selector":
            current.selector = c.attrs?.selector;
            break;
    }

    if (includeInteractivity) {
        if (exportVersion.index >= 1) {
            newApplyInteractiveValues(current, c);
        } else {
            oldApplyInteractiveValues(current, c);
        }
    }

    return current;
}

/**
 * Applies the interactive values for the 1.21.5+ format
 *
 * @param current your current minecraft text
 * @param c the content
 */
function newApplyInteractiveValues(current: MinecraftText, c: JSONContent) {
    if (findMarkType(c, "clickEvent")) {
        const ce = findMarkType(c, "clickEvent")?.attrs;
        current.click_event = { action: ce!.action };
        switch (ce!.action) {
            case "open_url":
                current.click_event.url = ce!.value;
                break;
            case "run_command":
            case "suggest_command":
                current.click_event.command = ce!.value;
                break;
            case "copy_to_clipboard":
                current.click_event.value = ce!.value;
                break;
            case "change_page":
                current.click_event.page = ce!.value;
                break;
            case "open_dialog":
                current.click_event.dialog = ce!.value;
                break;
        }
    }

    if (findMarkType(c, "hoverEvent")) {
        const ce = findMarkType(c, "hoverEvent")?.attrs;
        current.hover_event = { action: ce!.action, value: ce!.value };
    }
}

/**
 * Applies the interactive values for the 1.21.4 and below format
 *
 * @param current your current (old) minecraft text
 * @param c the content
 */
function oldApplyInteractiveValues(current: OldMinecraftText, c: JSONContent) {
    if (findMarkType(c, "clickEvent")) {
        const ce = findMarkType(c, "clickEvent")?.attrs;
        current.clickEvent = { action: ce!.action, value: ce!.value };
    }

    if (findMarkType(c, "hoverEvent")) {
        const ce = findMarkType(c, "hoverEvent")?.attrs;
        current.hoverEvent = { action: ce!.action, contents: ce!.value };
    }
}

/**
 * Converts the JSON content of the editor to an NBT string.
 */
export function convert(
    jsonContent: JSONContent,
    optimise: boolean,
    exportType: "standard" | "item_lore" = "standard",
    forceJson: boolean = false,
): string {
    exportVersion = get(outputVersion);
    let out = translateJSON(jsonContent, { exportType, optimise });

    // Convert from JSON string to NBT string if required
    if (exportVersion.index >= 1 && !forceJson) {
        // nbt number type fix for shadow colour
        // moved from translateJSON function
        const shadowColorMatches = out.matchAll(/"shadow_color":(-?\d+)/gu);
        const relevantShadowColorMatches = shadowColorMatches.filter(item => (parseInt(item[1]) > 2 ** 31 - 1 || parseInt(item[1]) < (-2) ** 31)).toArray().map(item => item[1])
        const deduplicatedRelevantShadowColorMatches = [...new Set(relevantShadowColorMatches)];

        for (const match of deduplicatedRelevantShadowColorMatches) {
            const num = parseInt(match)
            out = out.replaceAll(`"shadow_color":${match}`, `"shadow_color":${num}L`);
        }
        
        // remove string marks from json keys only
        out = out.replaceAll(/(?<=[{,]\s*)"[^"]*"\s*:/gu, (match) => match.replaceAll(`"`, ""));
    }

    return out;
}

/**
 * Converts the JSON content of the editor to a Minecraft JSON string.
 */
export function translateJSON(json: JSONContent, options: TranslateOptions): string {
    const paragraphs = json.content ?? [];

    if (options.exportType === "standard") {
        let data: StringyMCText[] = [];

        for (const [i, p] of paragraphs.entries()) {
            const content = p.content ?? [];
            for (const c of content) {
                data.push(constructComponent(c));
            }
            if (i < paragraphs.length - 1) data.push("\n");
        }

        if (data.length === 0) {
            return Math.random() < 0.002
                ? "🤓 <- kevin is waiting for you to type something"
                : "waiting for input...";
        }

        if (options.optimise) {
            data = optimise(data);
        } else {
            data.unshift("");
        }

        if (data.length === 2 && data[0] == "") {
            return JSON.stringify(data[1]);
        } else if (data.length === 1) {
            return JSON.stringify(data[0])
        }

        return JSON.stringify(data);
    } else if (options.exportType === "item_lore") {
        let data: (StringyMCText[] | StringyMCText)[] = [];

        for (const p of paragraphs) {
            const content = p.content ?? [];
            let currentLine: StringyMCText[] = [];

            for (const [_, c] of content.entries()) {
                currentLine.push(constructComponent(c, false));
            }

            data.push(currentLine);
        }

        if (Array.isArray(data) && options.optimise) {
            data = data.map((d) => (Array.isArray(d) ? optimise(d, true) : d));
        }

        return JSON.stringify(data);
    }

    return "[]";
}

/**
 * Constructs a component from a given Tiptap JSON content object
 */
function constructComponent(content: JSONContent, includeInteractivity: boolean = true) {
    // Construct basic styled component
    let currentComponent: MinecraftText = {
        color: defaultColorLUT(content.marks?.find(obj => obj.type == "textStyle")?.attrs?.color || undefined),
        bold: trueMarkOrUndefined(content, "bold"),
        italic: trueMarkOrUndefined(content, "italic"),
        strikethrough: trueMarkOrUndefined(content, "strike"),
        underlined: trueMarkOrUndefined(content, "underline"),
        obfuscated: trueMarkOrUndefined(content, "obfuscated"),
        font: content.marks?.find(obj => obj.type == "textStyle")?.attrs?.font || undefined,
    };

    // Add shadow colour
    const shadowColorMark = content.marks?.find((m) => m.type === "shadowColor");
    if (shadowColorMark) {
        let colorVal: string = shadowColorMark.attrs?.shadowColor.replace(/^#/u, "");
        if (colorVal && colorVal.length <= 8) {
            currentComponent.shadow_color = parseInt(
                rgbaToArgbHex(colorVal.padEnd(8, "FF")).replace(/^#/u, ""),
                16,
            );
        }
    }

    // Add content values (e.g. text and custom sources) depending on the component type
    currentComponent = addTypeSpecificValues(currentComponent, content, includeInteractivity);

    return currentComponent
}