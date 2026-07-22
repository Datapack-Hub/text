import type { MCTextKey, MinecraftText, StringyMCText } from "$lib/types";
import { isAnInteractiveProp, isDefinedTextObject } from "../utils";

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

/**
 * Optimises the final outputted component string to reduce characters
 *
 * @param stringyTextElements An array of strings or text components
 * @returns the string or text components optimised
 */
export function optimise(
	stringyTextElements: StringyMCText[],
	lore = false,
): StringyMCText[] {
	let output: StringyMCText[] = [];

	if (!lore) {
		// add leading empty string for non-lore due to how Minecraft handles text components
		output.push("");
	}

	// Early return for single string
	if (
		stringyTextElements.length === 1 &&
		typeof stringyTextElements[0] === "string"
	) {
		return stringyTextElements;
	}

	output.push(...flattenMCText(stringyTextElements));
	output = mergeTextComponents(output);

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
): Record<keyof MinecraftText, any> {
	const allSharedProps: Record<keyof MinecraftText, any> = {} as Record<
		keyof MinecraftText,
		any
	>;
	for (const prop of styleProps) {
		const p = prop as MCTextKey;
		if (
			a[p] !== undefined &&
			b[p] !== undefined &&
			propsMatch(a[p], b[p], prop)
		) {
			allSharedProps[p] = a[p];
		}
	}
	return allSharedProps;
}

/**
 * Collects all MinecraftText components from the current index that share the same style properties
 *
 * @param i the current index into the array
 * @param group the current group of MinecraftText components being collected
 * @param output the current output array
 * @param allSharedProps a record of all shared properties between the group
 */
function collectAllFromIndex(
	i: number,
	group: MinecraftText[],
	output: StringyMCText[],
	allSharedProps: Record<keyof MinecraftText, any>,
) {
	let j = i;
	let sharedKeys = Object.keys(allSharedProps) as (keyof MinecraftText)[];
	while (output[j + 1] && typeof output[j + 1] === "object") {
		const next = output[j + 1] as MinecraftText;
		let allPropertiesMatch = sharedKeys.every(
			(prop) =>
				next[prop] !== undefined &&
				propsMatch(next[prop], allSharedProps[prop], prop),
		);

		if (!allPropertiesMatch) break;

		group.push(next);
		j++;
	}
}

/**
 * Checks if two properties match, considering interactive properties
 *
 * @param a property A
 * @param b property B
 * @param property the property to check for
 * @returns true if the properties match, false otherwise
 */
function propsMatch(a: any, b: any, property: string) {
	return isAnInteractiveProp(property)
		? JSON.stringify(a) === JSON.stringify(b)
		: a === b;
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
		if (typeof component === "string") {
			// string, just add
			output.push(component);
			continue;
		}

		if ("text" in component) {
			// MinecraftText with text property
			for (const [key, value] of Object.entries(component)) {
				if (value === undefined) {
					// remove undefined properties
					delete component[key as MCTextKey];
				}
			}
		}

		output.push(
			// if only text property remains, convert to string
			Object.keys(component).length === 1 && component.text
				? component.text
				: component,
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
	for (let i = 0; i < output.length - 1; i++) {
		const current = output[i],
			next = output[i + 1];

		// Merge whitespace and empty strings to next component
		if (
			isDefinedTextObject(current) &&
			typeof next === "string" &&
			/^\s*$/u.test(next)
		) {
			current.text += next;
			output.splice(i + 1, 1);
			i--;
			continue;
		}

		// Merge whitespace objects to next component
		if (isDefinedTextObject(current) && isDefinedTextObject(next)) {
			// which direction to merge
			if (/^\s+$/u.test(next.text)) {
				current.text += next.text;
				output.splice(i + 1, 1);
				i--;
				continue;
			} else if (/^\s+$/u.test(current.text)) {
				next.text = current.text + next.text;
				output.splice(i, 1);
				i--;
				continue;
			}
		}

		// Merge consecutive strings
		if (typeof current === "string" && typeof next === "string") {
			output[i] = current + next;
			output.splice(i + 1, 1);
			i--;
			continue;
		}

		// Find shared style/interactivity properties between consecutive objects
		if (typeof current === "object" && typeof next === "object") {
			const sharedProperties = getSharedStyleProps(current, next);

			if (Object.keys(sharedProperties).length > 0) {
				let group = [current];
				collectAllFromIndex(i, group, output, sharedProperties);

				if (group.length === 0) {
					continue;
				}

				// Remove shared properties from each group member for "extra"
				let extras: StringyMCText[] = group.map((comp) => {
					const copy = { ...comp };
					for (const prop of Object.keys(sharedProperties)) {
						delete copy[prop as MCTextKey];
					}
					return copy;
				});

				// Optimise extra
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
					if (merged.extra) {merged.extra = merged.extra.concat(extras);}
					else {merged.extra = extras;}
				}
				output.splice(i, group.length, merged);
			}
		}
	}
	return output;
}
