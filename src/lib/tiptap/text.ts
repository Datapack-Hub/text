import { type JSONContent } from "@tiptap/core";

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

export function colorNameToHexCode(color: string): string | undefined {
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
			current.click_event = getMarkType(c, "clickEvent")?.attrs as {
				action: string;
				value: string;
			};
			current.hover_event = getMarkType(c, "hoverEvent")?.attrs as {
				action: string;
				contents: BaseMinecraftText;
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

	return current;
}
