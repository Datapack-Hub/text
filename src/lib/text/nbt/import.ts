import type { JSONContent } from "@tiptap/core";
import { defaultColorReverseLUT } from "../utils";
import { type MinecraftText, type OldMinecraftText } from "../../types";
import { type StringyMCText } from "../../types";

export function snbtToDocument(raw: StringyMCText[]): JSONContent {
	let baseDocument: JSONContent = {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [],
			},
		],
	};

	if (Array.isArray(raw)) {
		for (const text of raw) {
			processTextComponent(text, baseDocument);
		}
	} else {
		processTextComponent(raw, baseDocument);
	}

	baseDocument = fixBrokenNewLines(baseDocument);

	return baseDocument;
}

export function convertToTextOrEmpty(raw: string): StringyMCText[] {
	if (raw === "") return [];

	raw = raw
		// quote unquoted keys
		.replaceAll(/([,{]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/gu, '$1"$2":')
		.replaceAll(/:\s*([a-zA-Z_][a-zA-Z0-9_.:-]*)(?=\s*[,}\]])/gu, (_, p1) => {
			// quote unquoted strings, ignoring booleans
			const protectedValues = ["true", "false", "1b", "0b"];
			if (protectedValues.includes(p1.toLowerCase())) {
				return `: ${p1.toLowerCase()}`;
			}
			return `: "${p1}"`;
		});
	if (/^"\w*"/u.test(raw)) {
		return [raw.replaceAll(`"`, "")];
	}

	// replace 1b and 0b with true and false literals
	raw = raw.replaceAll(/(?<="\w+"\s*:\s*)\b1b\b/gu, "true");
	raw = raw.replaceAll(/(?<="\w+"\s*:\s*)\b0b\b/gu, "false");

	// remove type suffixes from numbers (e.g., 1.0f, 2.0d, 3l)
	raw = stripTypeSuffixes(raw);

	let parsed: MinecraftText[] | MinecraftText | string;

	try {
		parsed = JSON.parse(raw);
	} catch (err) {
		return [
			"",
			{ color: "red", text: "An error occurred while parsing the SNBT." },
			{ color: "yellow", text: " Please send the " },
			{ color: "gold", text: "following error message" },
			{ color: "yellow", text: " to Datapack Hub staff:\n" },
			{ color: "white", bold: true, text: "Error: " },
			{ color: "gray", text: err!.toString() },
		];
	}

	if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
		return [parsed as MinecraftText];
	}

	return parsed as StringyMCText[];
}

function processTextComponent(text: StringyMCText, baseDocument: JSONContent) {
	if (typeof text === "string") {
		if (text === "") {
			return;
		}

		const temp = baseDocument.content!.at(-1)!.content!;
		baseDocument.content!.at(-1)!.content = [
			...temp,
			{
				type: "text",
				text: text,
			},
		];
		return;
	}

	let finalText = mapPropertiesToType(text);
	finalText = applyStyling(text, finalText);

	let paragraphContent = baseDocument.content?.at(-1)?.content;
	paragraphContent!.push(finalText);

	// Extra property
	if (text.extra) {
		text.extra!.forEach((txt) => {
			const newText = typeof txt === "object" ? { ...txt } : { text: txt };

			Object.assign(newText, {
				bold: text.bold ?? newText.bold,
				italic: text.italic ?? newText.italic,
				underlined: text.underlined ?? newText.underlined,
				obfuscated: text.obfuscated ?? newText.obfuscated,
				strikethrough: text.strikethrough ?? newText.strikethrough,
				color: text.color ?? newText.color,
				shadow_color: text.shadow_color ?? newText.shadow_color,
				click_event: text.click_event ?? newText.click_event,
				clickEvent: text.clickEvent ?? newText.clickEvent,
				hover_event: text.hover_event ?? newText.hover_event,
				hoverEvent: text.hoverEvent ?? newText.hoverEvent,
				font: text.font ?? newText.font,
			});

			processTextComponent(newText, baseDocument);
		});
	}
}

function mapPropertiesToType(source: MinecraftText): JSONContent {
	let finalText: JSONContent;

	if (source.selector) {
		finalText = {
			type: "selector",
			attrs: {
				selector: source.selector,
			},
		};
	} else if (source.score) {
		finalText = {
			type: "score",
			attrs: {
				name: source.score.name,
				objective: source.score.objective,
			},
		};
	} else if (source.nbt) {
		if (source.block) {
			finalText = {
				type: "block_nbt",
				attrs: {
					nbt: source.nbt,
					block: source.block,
					interpret: source.interpret ?? false,
				},
			};
		} else if (source.entity) {
			finalText = {
				type: "entity_nbt",
				attrs: {
					nbt: source.nbt,
					entity: source.entity,
					interpret: source.interpret ?? false,
				},
			};
		} else {
			finalText = {
				type: "storage_nbt",
				attrs: {
					nbt: source.nbt,
					storage: source.storage,
					interpret: source.interpret ?? false,
				},
			};
		}
	} else if (source.translate) {
		finalText = {
			type: "translate",
			attrs: {
				key: source.translate,
				params: source.with || [],
				fallback: source.fallback,
			},
		};
	} else if (source.keybind) {
		finalText = {
			type: "keybind",
			attrs: {
				key: source.keybind,
			},
		};
	} else if (source.sprite || source.atlas) {
		finalText = {
			type: "atlas_object",
			attrs: {
				atlas: source.atlas,
				sprite: source.sprite,
			},
		};
	} else if (source.player) {
		finalText = {
			type: "player_object",
			attrs: {
				hat: source.hat || true,
				player: {
					name: source.player.name,
				},
			},
		};
	} else {
		finalText = {
			type: "text",
			text: source.text || "",
		};
	}

	return finalText;
}

function applyStyling(
	text: MinecraftText & OldMinecraftText,
	finalText: JSONContent,
) {
	if (!finalText.marks) {
		finalText.marks = [];
	}

	if (text.color) {
		finalText.marks.push({
			type: "textStyle",
			attrs: {
				color: defaultColorReverseLUT(text.color),
			},
		});
	}

	if (text.font) {
		const textStyle = finalText.marks.find((mark) => mark.type === "textStyle");
		if (textStyle) {
			textStyle.attrs!.font = text.font;
		} else {
			finalText.marks?.push({
				type: "textStyle",
				attrs: {
					font: text.font,
				},
			});
		}
	}

	if (text.shadow_color) {
		const combinedShadowStr = (
			Array.isArray(text.shadow_color)
				? text.shadow_color.map(mapToHexByte).join("")
				: text.shadow_color.toString(16)
		).replaceAll(/[lL#]/gu, "");
		const intValue = parseInt(combinedShadowStr, 16);

		if (intValue > 0 && intValue < 0xffffffff) {
			const hex = "#" + combinedShadowStr.padStart(8, "ff");
			finalText.marks?.push({
				type: "shadowColor",
				attrs: {
					shadowColor: hex,
				},
			});
		}
	}

	if (text.bold) {
		finalText.marks?.push({
			type: "bold",
		});
	}

	if (text.italic) {
		finalText.marks?.push({
			type: "italic",
		});
	}

	if (text.underlined) {
		finalText.marks?.push({
			type: "underline",
		});
	}

	if (text.obfuscated) {
		finalText.marks?.push({
			type: "obfuscated",
		});
	}

	if (text.strikethrough) {
		finalText.marks?.push({
			type: "strike",
		});
	}

	if (text.click_event) {
		const e = text.click_event;

		// Check if only one of the properties is set, throw an error if more than one is set
		if (
			(e.url && (e.command || e.value || e.page || e.dialog)) ||
			(e.command && (e.url || e.value || e.page || e.dialog)) ||
			(e.value && (e.url || e.command || e.page || e.dialog)) ||
			(e.page && (e.url || e.command || e.value || e.dialog)) ||
			(e.dialog && (e.url || e.command || e.value || e.page))
		) {
			throw new Error(
				"Click event can only have one of url, command, value, page, or dialog set.",
			);
		}

		const actionSource = e.url || e.command || e.value || e.page || e.dialog;

		finalText.marks?.push({
			type: "clickEvent",
			attrs: {
				action: e.action,
				value: actionSource,
			},
		});
	}

	if (text.clickEvent) {
		const cE = text.clickEvent;

		const actionSource = cE.value;

		finalText.marks?.push({
			type: "clickEvent",
			attrs: {
				action: cE.action,
				value: actionSource,
			},
		});
	}

	if (text.hover_event) {
		finalText.marks?.push({
			type: "hoverEvent",
			attrs: {
				action: text.hover_event.action,
				value: text.hover_event.value,
			},
		});
	}

	if (text.hoverEvent) {
		finalText.marks?.push({
			type: "hoverEvent",
			attrs: {
				action: text.hoverEvent.action,
				value: text.hoverEvent.contents,
			},
		});
	}

	return finalText;
}

function fixBrokenNewLines(doc: JSONContent) {
	const fixedContent = [];

	for (const node of doc.content!) {
		if (node.type !== "paragraph" || !node.content) {
			// Non-paragraph nodes are copied as-is
			fixedContent.push(node);
			continue;
		}

		let currentParagraph = [];

		for (const child of node.content) {
			if (child.type === "text" && child.text === "") {
				// Remove empty text nodes
				continue;
			}

			if (child.type !== "text" || !child.text!.includes("\n")) {
				// No newline — add to current paragraph
				currentParagraph.push(child);
				continue;
			}

			// Text node contains newlines — split it
			const lines = child.text!.split("\n");
			for (let i = 0; i < lines.length; i++) {
				if (i > 0) {
					// Push previous paragraph and start a new one
					fixedContent.push({
						type: "paragraph",
						content: currentParagraph,
					});
					currentParagraph = [];
				}
				// Only add non-empty text nodes
				if (lines[i]) {
					currentParagraph.push({
						type: "text",
						text: lines[i],
						...(child.marks ? { marks: child.marks } : {}),
					});
				}
			}
		}

		// Add the last paragraph
		if (currentParagraph.length > 0) {
			fixedContent.push({
				type: "paragraph",
				content: currentParagraph,
			});
		}
	}

	return {
		type: "doc",
		content: fixedContent,
	};
}

function mapToHexByte(value: number): string {
	if (value < 0.0 || value > 1.0) {
		// Return "00" for out-of-range values
		return "00";
	}

	const byteValue = Math.round(value * 255);
	const hexString = byteValue.toString(16);

	return hexString.length === 1 ? "0" + hexString : hexString;
}

function stripTypeSuffixes(input: string): string {
	// Regex matches digits, optional decimal, and captures the numeric part (group 1)
	// while matching the suffix [fDdLsS] outside the group.
	const regex = /\b(\d+(?:\.\d+)?)[fDdLsS]\b/g;

	return input.replaceAll(regex, "$1");
}
