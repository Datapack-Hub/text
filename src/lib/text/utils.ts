import type { MinecraftText } from "$lib/types";
import type { Editor, JSONContent } from "@tiptap/core";

export const colorMap = [
	{ name: "dark_red", value: "#AA0000", code: "4" },
	{ name: "red", value: "#FF5555", code: "c" },
	{ name: "gold", value: "#FFAA00", code: "6" },
	{ name: "yellow", value: "#FFFF55", code: "e" },
	{ name: "green", value: "#55FF55", code: "2" },
	{ name: "dark_green", value: "#00AA00", code: "a" },
	{ name: "aqua", value: "#55FFFF", code: "b" },
	{ name: "dark_aqua", value: "#00AAAA", code: "3" },
	{ name: "blue", value: "#5555FF", code: "1" },
	{ name: "dark_blue", value: "#0000AA", code: "9" },
	{ name: "dark_purple", value: "#AA00AA", code: "d" },
	{ name: "light_purple", value: "#FF55FF", code: "5" },
	{ name: "white", value: "#FFFFFF", code: "f" },
	{ name: "gray", value: "#AAAAAA", code: "7" },
	{ name: "dark_gray", value: "#555555", code: "8" },
	{ name: "black", value: "#000000", code: "0" },
];

export const sourceKeys = [
	"atlas_object",
	"player_object",
	"selector",
	"block_nbt",
	"entity_nbt",
	"storage_nbt",
	"keybind",
	"score",
	"translate",
] as const;

/**
 * Returns true if the specified mark is present in the content's marks, otherwise undefined.
 *
 * @param content the node to check
 * @param mark the mark to check
 * @returns the mark if true, undefined otherwise
 */
export function trueMarkOrUndefined(
	content: JSONContent,
	mark: string,
): true | undefined {
	const value = content.marks?.some((e) => e.type === mark) || false;
	return value ? value : undefined;
}
/**
 * A LUT to find the name of a color
 *
 * @param color the hex code
 * @returns the color name
 */
export function defaultColorLUT(color: string): string | undefined {
	if (!color || color === "null") {
		return;
	}
	return colorMap.find((e) => e.value.toUpperCase() === color)?.name || color;
}

/**
 * A LUT to find the value of a named color
 *
 * @param color the color name you want to find
 * @returns the hex code for the color
 */
export function defaultColorReverseLUT(color: string): string | undefined {
	if (!color || color === "null") {
		return;
	}
	return colorMap.find((e) => e.name.toLowerCase() === color)?.value || color;
}

/**
 * Finds a mark of a specific type in a JSONContent node.
 *
 * @param c the node you want to examine
 * @param type type to check
 * @returns the mark if found, otherwise undefined
 */
export function findMarkType(c: JSONContent, type: string) {
	return c.marks?.find((e) => e.type === type);
}

export function unescapeUnicode(str: string) {
	const regex = /\\u(?:([0-9a-fA-F]{4})|\{([0-9a-fA-F]+)\})/gu;

	// p1 will contain the 4-digit hex if it's \uXXXX
	// p2 will contain the variable hex if it's \u{XXXXX}
	return str.replace(regex, (_, p1: string, p2: string) => {
		// Get the hex value from whichever group matched
		const hex = p1 || p2;

		const codePoint = parseInt(hex, 16);
		return String.fromCodePoint(codePoint);
	});
}

export function isAnInteractiveProp(prop: string) {
	return (
		prop === "click_event" ||
		prop === "hover_event" ||
		prop === "clickEvent" ||
		prop === "hoverEvent"
	);
}

/**
 * Checks if an object is a defined MinecraftText object
 *
 * @param obj the object to check
 * @returns true if it is a defined MinecraftText object
 */
export function isDefinedTextObject(
	obj: any,
	// return type is that so that it can require the text property, instead of being optional
): obj is Omit<MinecraftText, "text"> & { text: string } {
	return typeof obj === "object" && obj.text !== undefined;
}

export function getNodeAtSelection(editor: Editor) {
	return editor.state.selection.$head.nodeBefore;
}

export function mapToHexByte(value: number): string {
	if (value < 0.0 || value > 1.0) {
		// Return "00" for out-of-range values
		return "00";
	}

	const byteValue = Math.round(value * 255);
	const hexString = byteValue.toString(16);

	return hexString.length === 1 ? "0" + hexString : hexString;
}

export function stripTypeSuffixes(input: string): string {
	const regex = /\b(\d+(?:\.\d+)?)[fdlsib]\b/gi;

	return input.replaceAll(regex, "$1");
}

export function argbToRgbaHex(rgbaHex: string): string {
	// Remove the leading '#' if it exists
	const hex = rgbaHex.startsWith("#") ? rgbaHex.slice(1) : rgbaHex;

	// Extract RGB and Alpha components
	const alpha = hex.slice(0, 2);
	const rgb = hex.slice(2, 8);

	// Return with alpha placed at the beginning

	return `#${rgb}${alpha}`;
}

export function rgbaToArgbHex(rgbaHex: string): string {
	// Remove the leading '#' if it exists
	const hex = rgbaHex.startsWith("#") ? rgbaHex.slice(1) : rgbaHex;

	// Extract RGB and Alpha components
	const rgb = hex.slice(0, 6);
	const alpha = hex.slice(6, 8);

	// Return with alpha placed at the beginning
	return `#${alpha}${rgb}`;
}
