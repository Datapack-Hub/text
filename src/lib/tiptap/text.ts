import type {
	MCTextKey,
	MinecraftText,
	OldMinecraftText,
	StringyMCText,
	TranslateOptions,
} from "$lib/types";
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
];

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
}

/**
 * A color value LUT
 *
 * @param color the hex code
 * @returns the color name
 */
export function defaultColorLUT(color: string): string | undefined {
	if (!color || color === "null") {
		return;
	}
	return colorMap.find((e) => e.value === color)?.name || color;
}

/**
 * A color name LUT
 *
 * @param color the color name you want to find
 * @returns the hex code for the color
 */
export function defaultColorReverseLUT(color: string): string | undefined {
	if (!color || color === "null") {
		return;
	}
	return colorMap.find((e) => e.name === color)?.value || color;
}

/**
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
 * Applies the specific properties for a type of source or provider
 *
 * @param current current text component
 * @param c the current editor JSON
 * @param includeInteractivity should it have click and hover events
 * @param exportVersion the version to export to
 * @returns the current component with new properties
 */
export function addTypeSpecificValues(
	current: MinecraftText,
	c: JSONContent,
	includeInteractivity = true,
	exportVersion: "new" | "old" = "new",
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
		switch (exportVersion) {
			case "new":
				newApplyInteractiveValues(current, c);
				break;
			case "old":
				oldApplyInteractiveValues(current, c);
				break;
		}
	}

	return current;
}

/**
 * Applies the interactive values for the 1.21.5+ format
 *
 * @param current your current minecraft text
 * @param c the content
 * @param includeInteractivity if it should have interactive events or not
 */
function newApplyInteractiveValues(
	current: MinecraftText,
	c: JSONContent,
) {
	if (isMarkType(c, "clickEvent")) {
		const ce = isMarkType(c, "clickEvent")?.attrs;
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

	if (isMarkType(c, "hoverEvent")) {
		const ce = isMarkType(c, "hoverEvent")?.attrs;
		current.hover_event = { action: ce!.action, value: ce!.value };
	}
}

/**
 * Applies the interactive values for the 1.21.4 and below format
 *
 * @param current your current (old) minecraft text
 * @param c the content
 * @param includeInteractivity if it should have interactive events or not
 */
function oldApplyInteractiveValues(
	current: OldMinecraftText,
	c: JSONContent
) {
	if (isMarkType(c, "clickEvent")) {
		const ce = isMarkType(c, "clickEvent")?.attrs;
		current.clickEvent = { action: ce!.action, value: ce!.value };
	}

	if (isMarkType(c, "hoverEvent")) {
		const ce = isMarkType(c, "hoverEvent")?.attrs;
		current.hoverEvent = { action: ce!.action, contents: ce!.value };
	}
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

/**
 * Optimises the final outputted component string to reduce characters
 *
 * @param arr An array of strings or text components
 * @returns
 */
export function optimise(arr: StringyMCText[], lore = false): StringyMCText[] {
	let out: StringyMCText[] = [];

	if (!lore) {
		out.push("");
	}

	// 1: Remove undefineds, flatten MinecraftText with only text
	for (const comp of arr) {
		if (typeof comp === "string") {
			out.push(comp);
			continue;
		}
		if ("text" in comp) {
			Object.keys(comp).forEach(
				(k) =>
					comp[k as MCTextKey] === undefined && delete comp[k as MCTextKey],
			);
		}
		out.push(Object.keys(comp).length === 1 ? comp.text! : comp);
	}

	// 2: Merge adjacent strings and whitespace, group objects with shared style
	for (let i = 0; i < out.length - 1; i++) {
		const curr = out[i],
			next = out[i + 1];

		// Merge whitespace to prev component
		if (
			typeof curr === "object" &&
			curr?.text &&
			typeof next === "string" &&
			(next.trim() === "" || next.trim() === "\n")
		) {
			curr.text += next;
			out.splice(i + 1, 1);
			i--;
			continue;
		}
		// Merge consecutive strings
		if (typeof curr === "string" && typeof next === "string") {
			out[i] = curr + next;
			out.splice(i + 1, 1);
			i--;
			continue;
		}

		// Find shared style/interactivity properties between consecutive objects
		if (typeof curr === "object" && typeof next === "object") {
			const shared: Record<string, any> = {};
			for (const prop of styleProps) {
				const p = prop as MCTextKey;
				if (
					curr[p] !== undefined &&
					next[p] !== undefined &&
					curr[p] === next[p]
				) {
					shared[prop] = curr[p];
				}
			}
			// Merge all properties in styleProps that are identical across the group
			const allProps = [...styleProps];
			const sharedAll: Record<string, any> = {};
			for (const prop of allProps) {
				const p = prop as MCTextKey;
				if (
					curr[p] !== undefined &&
					next[p] !== undefined &&
					(prop === "hover_event" ||
					prop === "click_event" ||
					prop === "hoverEvent" ||
					prop === "clickEvent"
						? JSON.stringify(curr[p]) === JSON.stringify(next[p])
						: curr[p] === next[p])
				) {
					sharedAll[p] = curr[p];
				}
			}
			if (Object.keys(sharedAll).length > 0) {
				// Find how many consecutive objects share these properties
				let j = i;
				let group = [curr];

				while (
					j + 1 < out.length &&
					typeof out[j + 1] === "object" &&
					Object.keys(sharedAll).every(
						(prop) =>
							out[j + 1][prop as keyof StringyMCText] !== undefined &&
							(prop === "hover_event" ||
							prop === "click_event" ||
							prop === "hoverEvent" ||
							prop === "clickEvent"
								? JSON.stringify(out[j + 1][prop as keyof StringyMCText]) ===
									JSON.stringify(sharedAll[prop])
								: out[j + 1][prop as keyof StringyMCText] === sharedAll[prop]),
					)
				) {
					group.push(out[j + 1] as MinecraftText);
					j++;
				}
				if (group.length > 1) {
					// Remove shared properties from each group member for "extra"
					const extras = optimise(
						group.map((comp) => {
							const c = { ...comp };
							for (const prop of Object.keys(sharedAll)) {
								delete c[prop as MCTextKey];
							}
							return c;
						}),
					);

					const first = extras.shift();
					let merged;
					if (typeof first == "string") {
						merged = { ...sharedAll, text: first, extra: extras };
					} else {
						merged = { ...sharedAll, ...first, extra: extras };
					}
					out.splice(i, group.length, merged);
					i--; // recheck at this position
					continue;
				}
			}
		}
	}

	// 3: Remove leading empty string if followed by a string
	if (out.length >= 2 && out[0] === "" && typeof out[1] === "string")
		out.shift();

	// 4: If out[1] is a string, or an object without any style properties, then remove out[0]
	if (
		out.length >= 2 &&
		out[0] == "" &&
		(typeof out[1] === "string" ||
			(typeof out[1] === "object" &&
				!styleProps.some(
					(prop) => out[1][prop as keyof StringyMCText] !== undefined,
				)))
	) {
		out.shift();
	}

	// 5: If it is item lore then override
	if (lore) {
		out.unshift({ italic: false, color: "white", text: "" });
	}

	return out;
}

/**
 * Converts the JSON content of the editor to an NBT string.
 */
export function convert(
	jsonContent: JSONContent,
	exportType: "standard" | "item_lore" = "standard",
	exportVersion: "new" | "old" = "new",
	optimise: boolean
): string {
	let out = translate(jsonContent, { exportVersion, exportType, optimise });
	if (exportVersion == "new") {
		// only remove strings
		out = out.replace(/"(?:[^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, (match) =>
			match.replace(/"/g, ""),
		);
	}
	return out;
}

/**
 * Converts the JSON content of the editor to a Minecraft JSON string.
 */
export function translate(
	json: JSONContent,
	options: TranslateOptions,
): string {
	const paragraphs = json.content ?? [];

	if (options.exportType === "standard") {
		let data: StringyMCText[] = [];

		for (const [i, p] of paragraphs.entries()) {
			const content = p.content ?? [];
			for (const c of content) {
				let current: MinecraftText = {
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

				current = addTypeSpecificValues(current, c, true, options.exportVersion);
				data.push(current);
			}
			if (i < paragraphs.length - 1) data.push("\n");
		}

		if (data.length === 0) {
			return Math.random() < 0.002
				? "🤓 <- james is waiting for you to type something"
				: "waiting for input...";
		}

		if (options.optimise) {
			data = optimise(data);
		}

		if (data.length === 1) {
			return options.indent
				? JSON.stringify(data[0], null, options.indentSize)
				: JSON.stringify(data[0]);
		}

		return options.indent
			? JSON.stringify(data, null, options.indentSize)
			: JSON.stringify(data);
	} else if (options.exportType === "item_lore") {
		let data: (StringyMCText[] | StringyMCText)[] = [];

		for (const p of paragraphs) {
			const content = p.content ?? [];
			let currentLine: StringyMCText[] = [];

			for (const c of content) {
				let currentComponent: MinecraftText = {
					color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
					bold: trueMarkOrUndefined(c, "bold"),
					italic: trueMarkOrUndefined(c, "italic"),
					strikethrough: trueMarkOrUndefined(c, "strike"),
					underlined: trueMarkOrUndefined(c, "underline"),
					obfuscated: trueMarkOrUndefined(c, "obfuscated"),
				};

				currentComponent = addTypeSpecificValues(currentComponent, c, false);
				currentLine.push(currentComponent);
			}

			data.push(currentLine);
		}

		if (Array.isArray(data) && options.optimise) {
			data = data.map((d) => (Array.isArray(d) ? optimise(d, true) : d));
		}

		return options.indent
			? JSON.stringify(data, null, options.indentSize)
			: JSON.stringify(data);
	}

	return "[]";
}
