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

	// 0: Early return for single string
	if (
		stringyTextElements.length === 1 &&
		typeof stringyTextElements[0] === "string"
	) {
		return stringyTextElements;
	}

	// 1: Remove undefineds, flatten MinecraftText with only text
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
					delete component[key as MCTextKey]; // remove undefined properties
				}
			}
		}

		// if only text property remains, convert to string
		output.push(
			Object.keys(component).length === 1 ? component.text! : component,
		);
	}

	// 2: Merge adjacent strings and whitespace, group objects with shared style
	for (let i = 0; i < output.length - 1; i++) {
		const current = output[i],
			next = output[i + 1];

		// Merge whitespace to next component
		if (
			isDefinedTextObject(current) &&
			typeof next === "string" &&
			next.match(/^\s*$/)
		) {
			current.text += next;
			output.splice(i + 1, 1);
			i--;
			continue;
		}

		// Merge whitespace objects to next component
		if (isDefinedTextObject(current) && isDefinedTextObject(next)) {
			// which direction to merge
			if (next.text.match(/^\s*$/)) {
				current.text += next.text;
				output.splice(i + 1, 1);
				i--;
				continue;
			} else if (current.text.match(/^\s*$/)) {
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
			// Merge all properties in styleProps that are identical across the group
			const allShared: Record<keyof MinecraftText, any> = getSharedStyleProps(
				current,
				next,
			);

			if (Object.keys(allShared).length > 0) {
				// Find how many consecutive objects share these properties
				let group = [current];

				collectAllFromIndex(i, group, output, allShared);
				if (group.length > 1) {
					// Remove shared properties from each group member for "extra"
					let extras: StringyMCText[] = group.map((comp) => {
						const copy = { ...comp };
						for (const prop of Object.keys(allShared)) {
							delete copy[prop as MCTextKey];
						}
						return copy;
					});

					// Optimise extra
					extras = optimise(extras);
					const first = extras.shift();
					let merged = { ...allShared };
					if (typeof first == "string") {
						merged.text = first;
						if (extras.length > 0) merged.extra = extras;
					} else {
						merged = { ...allShared, ...first };
						if (extras.length > 0) merged.extra = extras;
					}
					output.splice(i, group.length, merged);
					i--; // recheck at this position
					continue;
				}
			}
		}
	}

	// 3: Remove leading empty string if followed by a string
	if (output.length >= 2 && output[0] === "" && typeof output[1] === "string")
		output.shift();

	// 4: If out[1] is a string, or an object without any style properties, then remove out[0]
	if (
		output.length >= 2 &&
		output[0] == "" &&
		(typeof output[1] === "string" ||
			(typeof output[1] === "object" &&
				!styleProps.some(
					(prop) => output[1][prop as keyof StringyMCText] !== undefined,
				)))
	) {
		output.shift();
	}

	// 5: If it is item lore then override
	if (lore) {
		output.unshift({ italic: false, color: "white", text: "" });
	}
	return output;
}

function getSharedStyleProps(a: MinecraftText, b: MinecraftText) {
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

function propsMatch(a: any, b: any, property: string) {
	return isAnInteractiveProp(property)
		? JSON.stringify(a) === JSON.stringify(b)
		: a === b;
}
