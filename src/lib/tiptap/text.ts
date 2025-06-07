import { Editor, type JSONContent } from "@tiptap/core";
import { generateGradient } from "typescript-color-gradient";

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

export type BaseMinecraftText = Pick<
	MinecraftText,
	| "text"
	| "color"
	| "font"
	| "bold"
	| "italic"
	| "underlined"
	| "strikethrough"
	| "obfuscated"
>;

export type StringyMCText = string | MinecraftText;

// Note: this also includes old fields. I hate the way this is designed but it works.
export type MinecraftText = {
	translate?: string;
	with?: string[];
	fallback?: string;

	text?: string;

	score?: {
		name: string;
		objective: string;
	};

	nbt?: string;
	interpret?: string;
	storage?: string;
	block?: string;
	entity?: string;

	keybind?: string;

	selector?: string;

	color?: string;
	shadow_color?: number | number[];
	font?: string;
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	strikethrough?: boolean;
	obfuscated?: boolean;
	click_event?: {
		action: string;
		url?: string;
		command?: string;
		value?: string;
		page?: string;
		dialog?: string;
	};
	hover_event?: {
		action: string;

		value?: BaseMinecraftText | BaseMinecraftText[];

		id?: string;
		count?: number;
		components?: {}[];

		name?: BaseMinecraftText | BaseMinecraftText[];
		uuid?: string | number[];
	};

	// Old ones
	clickEvent?: {
		action: string;
		value: string;
	};

	hoverEvent?: {
		action: string;
		contents: any;
	};

	extra?: MinecraftText[];

	[key: string]: any;
};

export type ExternalSources = {
	score: {
		objective: string;
		name: string;
	};
	translate: {
		key: string;
		params: string[];
		fallback?: string;
	};
	nbt: {
		sourceType: string;
		storage: string;
		entity: string;
		block: string;
		path: string;
		interpret: boolean;
	};
	keybind: {
		key: string;
	};
	selector: {
		selector: string;
	};
};

const styleProps = [
	"color",
	"font",
	"bold",
	"italic",
	"underlined",
	"strikethrough",
	"obfuscated",
	"click_event",
	"hover_event",
	"clickEvent",
	"hoverEvent",
];

export function trueMarkOrUndefined(
	content: JSONContent,
	mark: string,
): true | undefined {
	const value = content.marks?.some((e) => e.type === mark);
	return value === true ? value : undefined;
}

export function defaultColorLUT(color: string): string | undefined {
	if (!color || color === "null") {
		return;
	}
	return colorMap.find((e) => e.value === color)?.name || color;
}

export function defaultColorReverseLUT(color: string): string | undefined {
	if (!color || color === "null") {
		return;
	}
	return colorMap.find((e) => e.name === color)?.value || color;
}

export function getMarkType(c: JSONContent, type: string) {
	return c.marks?.find((e) => e.type === type);
}

export function addTypeSpecificValues(
	current: MinecraftText,
	c: JSONContent,
	includeInteractivity = true,
	exportVersion: "new" | "old" = "new",
) {
	switch (exportVersion) {
		case "new":
			newApplyTypeSpecificValues(current, c, includeInteractivity);
			break;
		case "old":
			oldApplyTypeSpecificValues(current, c, includeInteractivity);
			break;
	}

	return current;
}

function newApplyTypeSpecificValues(
	current: MinecraftText,
	c: JSONContent,
	includeInteractivity = true,
) {
	switch (c.type) {
		case "text":
			current.text = c.text;
			break;
		case "score":
			current.score = {
				name: c.attrs?.name,
				objective: c.attrs?.objective,
			};
			break;
		case "translate":
			current.translate = c.attrs?.key;
			if (c.attrs?.params && c.attrs?.params.length != 0) {
				current.with = c.attrs?.params;
			}
			if (c.attrs?.fallback) {
				current.fallback = c.attrs?.fallback;
			}
			break;
		case "storage_nbt":
		case "block_nbt":
		case "entity_nbt":
			current.nbt = c.attrs?.nbt;
			current.storage = c.attrs?.storage;
			current.block = c.attrs?.block;
			current.entity = c.attrs?.entity;
			current.interpret = c.attrs?.interpret || undefined;
			break;
		case "keybind":
			current.keybind = c.attrs?.key;
			break;
		case "selector":
			current.selector = c.attrs?.selector;
			break;
	}
	if (includeInteractivity) {
		if (getMarkType(c, "clickEvent")) {
			const ce = getMarkType(c, "clickEvent")?.attrs;
			current.click_event = { action: ce!.action };
			switch (ce!.action) {
				case "open_url":
					current.click_event.url = ce!.value;
					break;
				case "run_command":
				case "suggest_command":
					current.click_event.command = ce!.value;
					break;
				case "copy_to_clipboard":
					current.click_event.value = ce!.value;
					break;
				case "change_page":
					current.click_event.page = ce!.value;
					break;
				case "open_dialog":
					current.click_event.dialog = ce!.value;
					break;
			}
		}

		if (getMarkType(c, "hoverEvent")) {
			const ce = getMarkType(c, "hoverEvent")?.attrs;
			current.hover_event = { action: ce!.action, value: ce!.value };
		}
	}
}

function oldApplyTypeSpecificValues(
	current: MinecraftText,
	c: JSONContent,
	includeInteractivity = true,
) {
	switch (c.type) {
		case "text":
			current.text = c.text;
			break;
		case "score":
			current.score = {
				name: c.attrs?.name,
				objective: c.attrs?.objective,
			};
			break;
		case "translate":
			current.translate = c.attrs?.key;
			if (c.attrs?.params && c.attrs?.params.length != 0) {
				current.with = c.attrs?.params;
			}
			if (c.attrs?.fallback) {
				current.fallback = c.attrs?.fallback;
			}
			break;
		case "storage_nbt":
		case "block_nbt":
		case "entity_nbt":
			current.nbt = c.attrs?.nbt;
			current.storage = c.attrs?.storage;
			current.block = c.attrs?.block;
			current.entity = c.attrs?.entity;
			current.interpret = c.attrs?.interpret || undefined;
			break;
		case "keybind":
			current.keybind = c.attrs?.key;
			break;
		case "selector":
			current.selector = c.attrs?.selector;
			break;
	}
	if (includeInteractivity) {
		if (getMarkType(c, "clickEvent")) {
			const ce = getMarkType(c, "clickEvent")?.attrs;
			current.clickEvent = { action: ce!.action, value: ce!.value };
		}

		if (getMarkType(c, "hoverEvent")) {
			const ce = getMarkType(c, "hoverEvent")?.attrs;
			current.hoverEvent = { action: ce!.action, contents: ce!.value };
		}
	}
}

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

	let chain = editor.chain()

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

	chain.run()
}

export function optimise(arr: StringyMCText[]): StringyMCText[] {
	let out: StringyMCText[] = [];

	// 1: Remove undefineds, flatten MinecraftText with only text
	for (const comp of arr) {
		if (typeof comp === "string") {
			out.push(comp);
			continue;
		}
		Object.keys(comp).forEach(k => comp[k] === undefined && delete comp[k]);
		out.push(Object.keys(comp).length === 1 ? comp.text! : comp);
	}

	// 2: Merge adjacent strings and whitespace, group objects with shared style
	for (let i = 0; i < out.length - 1; i++) {
		const curr = out[i], next = out[i + 1];

		// Merge whitespace to prev component
		if (typeof curr === "object" && curr?.text && typeof next === "string" && (next.trim() === "" || next.trim() === "\n")) {
			curr.text += next;
			out.splice(i + 1, 1); i--;
			continue;
		}
		// Merge consecutive strings
		if (typeof curr === "string" && typeof next === "string") {
			out[i] = curr + next;
			out.splice(i + 1, 1); i--;
			continue;
		}
		// Group objects with shared style
		if (typeof curr !== "object" || !curr) continue;
		let shared: string[] = [], count = 1, j = i + 1;
		while (j < out.length && typeof out[j] === "object" && out[j]) {
			const n = out[j] as MinecraftText;
			const s = styleProps.filter(p => curr[p] !== undefined && JSON.stringify(curr[p]) === JSON.stringify(n[p]));
			if (s.length) { shared = s; count++; j++; } else break;
		}
		if (count > 1 && shared.length) {
			const base: MinecraftText = {};
			shared.forEach(p => base[p] = (out[i] as MinecraftText)[p]);
			base.extra = [];
			for (let k = i; k < i + count; k++) {
				const c = { ...(out[k] as MinecraftText) };
				shared.forEach(p => delete c[p]);
				base.extra.push(c);
			}
			out.splice(i, count, base);
		}
	}

	// 3: Remove leading empty string if followed by a string
	if (out.length >= 2 && out[0] === "" && typeof out[1] === "string") out.shift();

	return out;
}

export function translateToNBT(
	jsonContent: JSONContent,
	exportType: string = "standard",
	exportVersion: "new" | "old" = "new",
): string {
	if (exportVersion == "new") {
		// nbt doesnt need indenting
		return translate(jsonContent, exportType, false, 0).replace(
			/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g,
			(match) => match.replace(/"/g, ""),
		);
	} else {
		return translate(jsonContent, exportType, false, 0, "old").replace(
			/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g,
			(match) => match.replace(/"/g, ""),
		);
	}
}

export function translate(
	json: JSONContent,
	exportType: string = "standard",
	indent: boolean,
	indentSize: number,
	exportVersion: "new" | "old" = "new",
): string {
	const paragraphs = json.content!;

	if (exportType == "standard") {
		let data: StringyMCText[] = [""];

		paragraphs.forEach((p, i) => {
			const content = p.content || [];
			let current: MinecraftText;

			content.forEach((c) => {
				current = {
					color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
					bold: trueMarkOrUndefined(c, "bold"),
					italic: trueMarkOrUndefined(c, "italic"),
					strikethrough: trueMarkOrUndefined(c, "strike"),
					underlined: trueMarkOrUndefined(c, "underline"),
					obfuscated: trueMarkOrUndefined(c, "obfuscated"),
				};

				const shadowColorMark = c.marks?.find((m) => m.type === "shadowColor");
				if (shadowColorMark) {
					current.shadow_color = parseInt(
						shadowColorMark.attrs?.shadowColor.replace(/^#/, ""),
						16,
					);
				}

				current = addTypeSpecificValues(current, c, true, exportVersion);

				data.push(current);
			});

			if (i < paragraphs.length - 1) {
				data.push("\n");
			}
		});

		if (data.length === 1 && data[0] === "") {
			if (Math.random() < 0.002) {
				return "🤓 <- james is waiting for you to type something";
			}
			return "waiting for input...";
		}

		if (data.length == 2) {
			return indent
				? JSON.stringify(data[1], null, indentSize)
				: JSON.stringify(data[1]);
		}

		data = optimise(data);

		return indent
			? JSON.stringify(data, null, indentSize)
			: JSON.stringify(data);
	} else if (exportType == "item_lore") {
		let data: (StringyMCText[] | StringyMCText)[] = [];

		paragraphs.forEach((p) => {
			const content = p.content || [];
			let currentLine: StringyMCText[] = [];
			let currentComponent: MinecraftText;

			content.forEach((c, i) => {
				currentComponent = {
					color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
					bold: trueMarkOrUndefined(c, "bold"),
					italic: trueMarkOrUndefined(c, "italic"),
					strikethrough: trueMarkOrUndefined(c, "strike"),
					underlined: trueMarkOrUndefined(c, "underline"),
					obfuscated: trueMarkOrUndefined(c, "obfuscated"),
				};

				// For lore: default behaviour is to be purple and italic
				// If the first element in the line has colour or italic on, then create an element before it to override the default of the rest of the array
				// If the first element of the array doesn't have colour/italic, then set it to white/false, to override the default of the rest of the array
				if (i === 0) {
					if (currentComponent.color || currentComponent.italic) {
						currentLine.push({
							italic: false,
							color: "white",
						});
					} else {
						if (!currentComponent.color) {
							currentComponent.color = "white";
						}

						if (!currentComponent.italic) {
							currentComponent.italic = false;
						}
					}
				}

				currentComponent = addTypeSpecificValues(currentComponent, c, false);
				currentLine.push(currentComponent);
			});

			if (currentLine.length == 2) {
				data.push(currentLine[1]);
			} else {
				data.push(currentLine);
			}
		});

		if (Array.isArray(data)) {
			data = data.map((d) => {
				if (Array.isArray(d)) {
					return optimise(d);
				} else {
					return d;
				}
			});
		}

		return indent
			? JSON.stringify(data, null, indentSize)
			: JSON.stringify(data);
	} else {
		return "[]";
	}
}