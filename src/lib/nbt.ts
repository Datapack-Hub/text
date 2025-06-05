import type { JSONContent } from "@tiptap/core";
import { colorNameToHexCode, type MinecraftText } from "./tiptap/text";

type TextOrEmpty = string | MinecraftText;

export function convertToTextOrEmpty(raw: string): TextOrEmpty[] {
	raw = raw.replace(/([,{]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

	let parsed: MinecraftText[] | MinecraftText | string;

	try {
		parsed = JSON.parse(raw);
	} catch (e) {
		console.error("Failed to parse SNBT:", e, raw);
		return [""];
	}

	if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
		return [parsed as MinecraftText];
	}

	return parsed as TextOrEmpty[];
}

export function snbtToDocument(raw: TextOrEmpty[]): JSONContent {
	// requote keys

	let baseDocument: JSONContent = {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [],
			},
		],
	};

	for (const text of raw) {
		if (typeof text === "string") {
			if (text === "") {
				continue;
			}

			baseDocument.content?.push({
				type: "paragraph",
			});
			continue;
		}

		let finalText = mapPropertiesToType(text);
		finalText = applyStyling(text, finalText);

		let paragraphContent = baseDocument.content?.at(-1)?.content;

		if (!paragraphContent) {
			baseDocument.content!.at(-1)!.content = [];
			paragraphContent = baseDocument.content!.at(-1)!.content;
		}

		paragraphContent!.push(finalText);
	}

	baseDocument = fixBrokenNewLines(baseDocument);
	return baseDocument;
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
	} else {
		finalText = {
			type: "text",
			text: source.text || "",
		};
	}

	return finalText;
}

function applyStyling(text: MinecraftText, finalText: JSONContent) {
	if (!finalText.marks) {
		finalText.marks = [];
	}

	if (text.color) {
		finalText.marks?.push({
			type: "textStyle",
			attrs: {
				color: colorNameToHexCode(text.color),
			},
		});
	}

	if (text.shadow_color) {
		const hex = "#" + text.shadow_color.toString(16).padStart(6, "0");
		finalText.marks?.push({
			type: "shadowColor",
			attrs: {
				shadowColor: hex,
			},
		});
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
		const cE = text.click_event;

		// Check if only one of the properties is set, throw an error if more than one is set
		if (
			(cE.url && (cE.command || cE.value || cE.page || cE.dialog)) ||
			(cE.command && (cE.url || cE.value || cE.page || cE.dialog)) ||
			(cE.value && (cE.url || cE.command || cE.page || cE.dialog)) ||
			(cE.page && (cE.url || cE.command || cE.value || cE.dialog)) ||
			(cE.dialog && (cE.url || cE.command || cE.value || cE.page))
		) {
			throw new Error(
				"Click event can only have one of url, command, value, page, or dialog set.",
			);
		}

		const actionSource =
			cE.url || cE.command || cE.value || cE.page || cE.dialog;

		finalText.marks?.push({
			type: "clickEvent",
			attrs: {
				action: cE.action,
				value: actionSource,
			},
		});
	}

	if (text.clickEvent) {
		const cE = text.clickEvent;


		const actionSource = cE.value

		finalText.marks?.push({
			type: "clickEvent",
			attrs: {
				action: cE.action,
				value: actionSource,
			},
		});
	}

	if (text.hoverEvent) {
		finalText.marks?.push({
			type: "hoverEvent",
			attrs: {
				action: text.hoverEvent.action,
				value: text.hoverEvent.value,
			},
		});
	}

	// if (text.font) {
	// 	finalText.marks?.push({
	// 		type: "font",
	// 		attrs: {
	// 			font: text.font,
	// 		},
	// 	});
	// }

	return finalText;
}

function fixBrokenNewLines(doc: any) {
	const fixedContent = [];

	for (const node of doc.content) {
		if (node.type !== "paragraph" || !node.content) {
			// Non-paragraph nodes are copied as-is
			fixedContent.push(node);
			continue;
		}

		let currentParagraph = [];

		for (const child of node.content) {
			if (child.type !== "text" || !child.text.includes("\n")) {
				// No newline — add to current paragraph
				currentParagraph.push(child);
				continue;
			}

			// Text node contains newlines — split it
			const lines = child.text.split("\n");
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
