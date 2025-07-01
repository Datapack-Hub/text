import type { JSONContent } from "@tiptap/core";
import { colorMap, trueMarkOrUndefined, unescapeUnicode } from "./general";

function hexToRgb(hex: string): [number, number, number] {
	hex = hex.replace(/^#/, "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((x) => x + x)
			.join("");
	}
	const num = parseInt(hex, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToLab([r, g, b]: [number, number, number]): [
	number,
	number,
	number,
] {
	// Convert RGB to XYZ
	let [rr, gg, bb] = [r, g, b].map((v) => {
		v /= 255;
		return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
	});

	const x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
	const y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0;
	const z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;

	// Convert XYZ to LAB
	const xyz = [x, y, z].map((v) =>
		v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116,
	);

	const l = 116 * xyz[1] - 16;
	const a = 500 * (xyz[0] - xyz[1]);
	const b_ = 200 * (xyz[1] - xyz[2]);
	return [l, a, b_];
}

export function deltaE(hex1: string, hex2: string): number {
	const lab1 = rgbToLab(hexToRgb(hex1));
	const lab2 = rgbToLab(hexToRgb(hex2));
	const [l1, a1, b1] = lab1;
	const [l2, a2, b2] = lab2;
	return Math.sqrt(
		Math.pow(l1 - l2, 2) + Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2),
	);
}

const formattingCodes = [
	{ key: "obfuscated", value: "k" },
	{ key: "bold", value: "l" },
	{ key: "strike", value: "m" },
	{ key: "underline", value: "n" },
	{ key: "italic", value: "o" },
];

export function translateMOTD(c: JSONContent) {
	const char = "\\u00a7";
	const paragraphs = c.content!;

	let data = "";

	for (const [i, p] of paragraphs.entries()) {
		const content = p.content ?? [];

		for (const c of content) {
			if (!c.text) {
				continue;
			}

			let lowestDE = 999;
			let lowestDEVal = "";
			let formatting = "";

			const color = c.marks?.at(0)?.attrs?.color;
			for (const c of colorMap) {
				if (!color) {
					continue;
				}

				const dE = deltaE(color, c.value);
				if (dE === 0) {
					lowestDEVal = `${char}${c.code}`;
					break;
				}
				if (dE < lowestDE) {
					lowestDE = dE;
					lowestDEVal = `${char}${c.code}`;
				}
			}

			for (const code of formattingCodes) {
				if (trueMarkOrUndefined(c, code.key)) {
					formatting += `${char}${code.value}`;
				}
			}

			data += `${char}r${lowestDEVal}${formatting}${unescapeUnicode(c.text)}`;
		}
		if (i < paragraphs.length - 1) data += "\\n";
	}
	return data;
}
