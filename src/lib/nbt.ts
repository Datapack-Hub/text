import type { JSONContent } from "@tiptap/core";
import { colorNameToHexCode, type MinecraftText } from "./tiptap/text";

type TextOrEmpty = "" | MinecraftText;

export function convertToTextOrEmpty(raw: string): TextOrEmpty[] {
	if (raw === "") {
		return [""];
	}

	raw = raw.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '"$1":');

	let parsed: MinecraftText[] | MinecraftText | string;

	try {
		parsed = JSON.parse(raw);
	} catch (e) {
		return [""];
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
		if (text === "") {
			continue;
        }
        
		let finalText = mapPropertiesToType(text);
        finalText = applyStyling(text, finalText);

		baseDocument.content![0].content?.push(finalText);
	}

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
				color: colorNameToHexCode(text.color)
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
        
        const cE = text.click_event

        // Check if only one of the properties is set, throw an error if more than one is set
        if ((cE.url && (cE.command || cE.value || cE.page || cE.dialog)) ||
            (cE.command && (cE.url || cE.value || cE.page || cE.dialog)) ||
            (cE.value && (cE.url || cE.command || cE.page || cE.dialog)) ||
            (cE.page && (cE.url || cE.command || cE.value || cE.dialog)) ||
            (cE.dialog && (cE.url || cE.command || cE.value || cE.page))) {
            throw new Error("Click event can only have one of url, command, value, page, or dialog set.");
        }

        const actionSource = cE.url || cE.command || cE.value || cE.page || cE.dialog;

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
                id: text.hover_event.id,
                count: text.hover_event.count,
                components: text.hover_event.components,
                name: text.hover_event.name,
                uuid: text.hover_event.uuid,
			},
		});
	}

	if (text.font) {
		finalText.marks?.push({
			type: "font",
			attrs: {
				font: text.font,
			},
		});
	}

	return finalText;
}
