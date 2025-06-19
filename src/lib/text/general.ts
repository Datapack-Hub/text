import type { Editor, JSONContent } from "@tiptap/core";
import { generateGradient } from "typescript-color-gradient";

/**
 * @param content the node to check
 * @param mark the mark to check
 * @returns the mark if true, undefined otherwise
 */

export function trueMarkOrUndefined(
	content: JSONContent,
	mark: string,
): true | undefined {
	const value = content.marks?.some((e) => e.type === mark);
	return value === true ? value : undefined;
} /**
 * A color value LUT
 *
 * @param color the hex code
 * @returns the color name
 */

export function defaultColorLUT(color: string): string | undefined {
	if (!color || color === "null") {
		return;
	}
	return colorMap.find((e) => e.value.toLowerCase() === color)?.name || color;
} /**
 * A color name LUT
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
export const colorMap = [
	{ name: "dark_red", value: "#AA0000" },
	{ name: "red", value: "#FF5555" },
	{ name: "gold", value: "#FFAA00" },
	{ name: "yellow", value: "#FFFF55" },
	{ name: "green", value: "#55FF55" },
	{ name: "dark_green", value: "#00AA00" },
	{ name: "aqua", value: "#55FFFF" },
	{ name: "dark_aqua", value: "#00AAAA" },
	{ name: "blue", value: "#5555FF" },
	{ name: "dark_blue", value: "#0000AA" },
	{ name: "dark_purple", value: "#AA00AA" },
	{ name: "light_purple", value: "#FF55FF" },
	{ name: "white", value: "#FFFFFF" },
	{ name: "gray", value: "#AAAAAA" },
	{ name: "dark_gray", value: "#555555" },
	{ name: "black", value: "#000000" },
];
