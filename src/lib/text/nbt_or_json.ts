import type {
	MCTextKey,
	MinecraftText,
	OldMinecraftText,
	StringyMCText,
	TranslateOptions,
} from "$lib/types";
import { type JSONContent } from "@tiptap/core";
import {
	defaultColorLUT,
	isMarkType,
	trueMarkOrUndefined,
	unescapeUnicode,
} from "./general";

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
			current.text = unescapeUnicode(c.text!);
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
function newApplyInteractiveValues(current: MinecraftText, c: JSONContent) {
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
function oldApplyInteractiveValues(current: OldMinecraftText, c: JSONContent) {
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
		// todo fix
		// if (typeof curr === "object" && curr?.text && typeof next === "string" && (next.trim() === "" || next.trim() === "\n")) {
		// 	curr.text += next;
		// 	out.splice(i + 1, 1); i--;
		// 	continue;
		// }
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
					let extras: StringyMCText[] = group.map((comp) => {
						const c = { ...comp };
						for (const prop of Object.keys(sharedAll)) {
							delete c[prop as MCTextKey];
						}
						return c;
					});

					// Optimise extra
					extras = optimise(extras);
					const first = extras.shift();
					let merged;
					if (typeof first == "string") {
						if (extras[0]) {
							merged = { ...sharedAll, text: first, extra: extras };
						} else {
							merged = { ...sharedAll, text: first };
						}
					} else {
						if (extras[0]) {
							merged = { ...sharedAll, ...first, extra: extras };
						} else {
							merged = { ...sharedAll, ...first };
						}
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
	optimise: boolean,
	force_json: boolean = false
): string {
	let out = translateJSON(jsonContent, { exportVersion, exportType, optimise });
	if (exportVersion == "new" && !force_json) {
		// only remove strings
		out = out.replace(/(?<=[{,]\s*)"[^"]*"\s*:/g, (match) =>
			match.replace(/"/g, ""),
		);
	}
	return out;
}

/**
 * Converts the JSON content of the editor to a Minecraft JSON string.
 */
export function translateJSON(
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
					font: c.marks?.at(0)?.attrs?.font || undefined,
				};

				const shadowColorMark = c.marks?.find((m) => m.type === "shadowColor");
				if (shadowColorMark) {
					current.shadow_color = parseInt(
						shadowColorMark.attrs?.shadowColor.replace(/^#/, ""),
						16,
					);
				}

				current = addTypeSpecificValues(
					current,
					c,
					true,
					options.exportVersion,
				);
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
		} else {
			data.unshift("");
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

			for (const [_, c] of content.entries()) {
				let currentComponent: MinecraftText = {
					color: defaultColorLUT(c.marks?.at(0)?.attrs?.color),
					bold: trueMarkOrUndefined(c, "bold"),
					italic: trueMarkOrUndefined(c, "italic"),
					strikethrough: trueMarkOrUndefined(c, "strike"),
					underlined: trueMarkOrUndefined(c, "underline"),
					obfuscated: trueMarkOrUndefined(c, "obfuscated"),
					font: c.marks?.at(0)?.attrs?.font || undefined,
				};

				currentComponent = addTypeSpecificValues(
					currentComponent,
					c,
					false,
					options.exportVersion,
				);
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
