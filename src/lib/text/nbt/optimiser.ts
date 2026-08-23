import type { MinecraftText, StringyMCText } from "$lib/types";
import { isAnInteractiveProp, isDefinedTextObject as isATextComponent } from "../utils";

const styleProps = [
    "color",
    "font",
    "bold",
    "italic",
    "underlined",
    "strikethrough",
    "obfuscated",
    "shadow_color",
    "click_event",
    "hover_event",
    "clickEvent",
    "hoverEvent",
] as const;

// Dear whoever reads this, I hope you like reading recursive and highly nested functions, because this is what you are in for.
// Good luck. Have fun. Don't get hurt.

/**
 * Optimises the final outputted component string to reduce characters
 *
 * @param stringyTextElements An array of strings or text components
 * @returns the string or text components optimised
 */
export function optimise(stringyTextElements: StringyMCText[], lore = false): StringyMCText[] {
    let output: StringyMCText[] = [];

    if (!lore) {
        // add leading empty string for non-lore due to how Minecraft handles text components
        output.push("");
    }

    // Early return for single string
    if (stringyTextElements.length === 1 && typeof stringyTextElements[0] === "string") {
        return stringyTextElements;
    }

    output.push(...flattenMCText(stringyTextElements));
    output = mergeTextComponents(mergeTextComponents(output));

    // if it is item lore then override
    if (lore) {
        output.unshift({ italic: false, color: "white", text: "" });
    }

    return output;
}

/**
 * Gets all shared style properties between two MinecraftText components
 *
 * @param a text component a to check
 * @param b text component b to check
 * @returns a record of shared style properties
 */
function getSharedStyleProps(
    a: MinecraftText,
    b: MinecraftText,
): [Record<keyof MinecraftText, any>, (keyof MinecraftText)[]] {
    const sharedStyleProps = {} as Record<keyof MinecraftText, any>;
    for (const prop of styleProps) {
        const key = prop as keyof MinecraftText;
        if (a[key] !== undefined && b[key] !== undefined && propertiesMatch(a[key], b[key], prop)) {
            sharedStyleProps[key] = a[key];
        }
    }
    return [sharedStyleProps, Object.keys(sharedStyleProps) as (keyof MinecraftText)[]];
}

/**
 * Collects all MinecraftText components from the current index that share the same style properties
 *
 * @param i the current index into the array
 * @param current the current MinecraftText component being considered
 * @param output the current output array
 * @param sharedStyleProps a record of all shared properties between the group
 */
function collectStyledRun(
    i: number,
    current: MinecraftText,
    output: StringyMCText[],
    sharedStyleProps: Record<keyof MinecraftText, any>,
): MinecraftText[] {
    let j = i;
    let sharedStyleKeys = Object.keys(sharedStyleProps) as (keyof MinecraftText)[];
    let finalList = [current];

    while (output[j + 1] && typeof output[j + 1] === "object") {
        const next = output[j + 1] as MinecraftText;

        // Check if all shared properties match for the next component
        let allPropertiesMatch = sharedStyleKeys.every(
            (prop) =>
                next[prop] !== undefined &&
                propertiesMatch(next[prop], sharedStyleProps[prop], prop),
        );

        if (!allPropertiesMatch) break;

        finalList.push(next);
        j++;
    }

    return finalList;
}

/**
 * Checks if two properties match, considering interactive properties
 *
 * @param a property A
 * @param b property B
 * @param property the property to check for
 * @returns true if the properties match, false otherwise
 */
function propertiesMatch(a: any, b: any, property: string) {
    return isAnInteractiveProp(property) ? JSON.stringify(a) === JSON.stringify(b) : a === b;
}

/**
 * Flattens the text elements by converting objects with only text property to strings and removing undefined properties
 *
 * @param stringyTextElements the text elements
 * @returns the elements with strings becoming string literals and cleaned object properties
 */
function flattenMCText(stringyTextElements: StringyMCText[]): StringyMCText[] {
    const output: StringyMCText[] = [];
    for (const component of stringyTextElements) {
        // its a string, just add it
        if (typeof component === "string") {
            output.push(component);
            continue;
        }

        // MinecraftText with text property
        if ("text" in component) {
            // remove any undefined properties
            for (const [key, value] of Object.entries(component)) {
                if (value === undefined) {
                    delete component[key as keyof MinecraftText];
                }
            }
        }

        output.push(
            // if only text property remains, convert to string
            Object.keys(component).length === 1 && component.text ? component.text : component,
        );
    }
    return output;
}

/**
 * Merges adjacent strings and whitespace, groups objects with shared style/interactivity properties
 *
 * @param output the optimized output step
 * @returns the optimized output step with merged strings, whitespace and group properties with shared styling
 */
function mergeTextComponents(output: StringyMCText[]) {
    // X->Y: who merges into who, where X and Y are either S (string) or C (component)
    for (let i = 0; i < output.length - 1; i++) {
        const current = output[i],
            next = output[i + 1];

        // S->C: Merge whitespace strings to previous component
        if (isATextComponent(current) && isWhitespaceOnly(next)) {
            current.text += next;
            output.splice(i + 1, 1);
            i--;
            continue;
        }

        // C->C: Merge text components who's text is only whitespace -> previous component
        if (isATextComponent(current) && isATextComponent(next)) {
            // which direction to merge
            // TODO: figure out why we need both checks, doing either or seems to work fine?
            if (isWhitespaceOnly(next.text)) {
                // merge to current
                current.text += next.text;
                output.splice(i + 1, 1);
                i--;
                continue;
            } else if (isWhitespaceOnly(current.text)) {
                // merge to next
                next.text = current.text + next.text;
                output.splice(i, 1);
                i--;
                continue;
            }
        }

        // S->S: Merge consecutive strings
        if (typeof current === "string" && typeof next === "string") {
            output[i] = current + next;
            output.splice(i + 1, 1);
            i--;
            continue;
        }

        // C->C: Find shared style/interactivity properties between consecutive objects
        if (typeof current === "object" && typeof next === "object") {
            const [sharedProperties, sharedPropertyKeys] = getSharedStyleProps(current, next);

            if (sharedPropertyKeys.length > 0) {
                let group = collectStyledRun(i, current, output, sharedProperties);

                // TODO: what the hell does this do? is it just for performance?
                if (group.length === 1) {
                    continue;
                }

                // Remove shared properties from each group member to save for later ("extra" property)
                let extras: StringyMCText[] = group.map((comp) => {
                    const copy = { ...comp };
                    for (const prop of sharedPropertyKeys) {
                        delete copy[prop as keyof MinecraftText];
                    }
                    return copy;
                });

                // Optimise "extra" properties
                extras = optimise(extras);
                const first = extras.shift();
                let merged = { ...sharedProperties };

                // Rebuild merged component
                if (typeof first === "string") {
                    merged.text = first;
                } else {
                    Object.assign(merged, { ...first });
                }

                if (extras.length > 0) {
                    if (merged.extra) {
                        merged.extra = merged.extra.concat(extras);
                    } else {
                        merged.extra = extras;
                    }
                }

                output.splice(i, group.length, merged);
            }
        }
    }
    return output;
}

function isWhitespaceOnly(str: StringyMCText): boolean {
    return typeof str === "string" && /^\s*$/u.test(str);
}
