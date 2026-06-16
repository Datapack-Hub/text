import type { MinecraftText } from "$lib/types";
import type { Editor, JSONContent } from "@tiptap/core";
import { generateGradient } from "typescript-color-gradient";

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
} /**
 * Checks the type of the mark against `type`
 *
 * @param c the node you want to examine
 * @param type type to check
 * @returns true if it matches
 */

export function isMarkType(c: JSONContent, type: string) {
	return c.marks?.find((e) => e.type === type);
}

export function unescapeUnicode(str: string) {
	const regex = /\\u(?:([0-9a-fA-F]{4})|\{([0-9a-fA-F]+)\})/g;

	return str.replace(regex, (match, p1, p2) => {
		// p1 will contain the 4-digit hex if it's \uXXXX
		// p2 will contain the variable hex if it's \u{XXXXX}
		const hex = p1 || p2; // Get the hex value from whichever group matched

		if (hex) {
			const codePoint = parseInt(hex, 16);
			return String.fromCodePoint(codePoint);
		}
		// If for some reason no hex was captured (shouldn't happen with this regex),
		// return the original match to avoid breaking the string.
		return match;
	});
}

/**
 * Applies a gradient to a selection in an editor
 *
 * @param editor the editor you want to apply it to
 * @param gradientColors the colors you want to use
 * @returns
 */
export function applyGradient(editor: Editor, gradientColors: string[]) {
	const { from, to } = editor.state.selection;
	if (from === to) return;

	const doc = editor.state.doc;
	let text = "";
	let textPositions: { pos: number; len: number }[] = [];

	// Collect all text and their positions in the selection
	doc.nodesBetween(from, to, (node, pos) => {
		if (node.isText) {
			const nodeStart = Math.max(from, pos);
			const nodeEnd = Math.min(to, pos + node.text!.length);
			const sliceStart = nodeStart - pos;
			const sliceEnd = nodeEnd - pos;
			const part = node.text?.slice(sliceStart, sliceEnd) ?? "";
			if (part.length > 0) {
				text += part;
				textPositions.push({ pos: nodeStart, len: part.length });
			}
		}
	});
	if (!text.length) return;

	const total = text.length;
	if (total === 0 || gradientColors.length < 2) return;

	const gradientArray = generateGradient(gradientColors, total);

	let chain = editor.chain();

	// Remove color from selection first
	chain.focus().setTextSelection({ from, to }).unsetColor();

	let charIndex = 0;
	for (const { pos, len } of textPositions) {
		for (let i = 0; i < len; i++) {
			const color = gradientArray[charIndex];
			chain
				.setTextSelection({ from: pos + i, to: pos + i + 1 })
				.setColor(color);
			charIndex++;
		}
	}
	chain.focus().setTextSelection({ from, to });

	chain.run();
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
): obj is Omit<MinecraftText, "text"> & { text: string } {
	return typeof obj === "object" && obj.text !== undefined;
}

export function getNodeAtSelection(editor: Editor) {
	return editor.state.selection.$head.nodeBefore;
}
