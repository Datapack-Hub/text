import { type JSONContent } from "@tiptap/core";

export const colorMap = [
	{ name: "dark_red", value: "#AA0000" },
	{ name: "red", value: "#FF5555" },
	{ name: "gold", value: "#FFAA00" },
	{ name: "yellow", value: "#FFFF55" },
	{ name: "dark_green", value: "#00AA00" },
	{ name: "green", value: "#55FF55" },
	{ name: "aqua", value: "#55FFFF" },
	{ name: "dark_aqua", value: "#00AAAA" },
	{ name: "dark_blue", value: "#0000AA" },
	{ name: "blue", value: "#5555FF" },
	{ name: "light_purple", value: "#FF55FF" },
	{ name: "dark_purple", value: "#AA00AA" },
	{ name: "white", value: "#FFFFFF" },
	{ name: "gray", value: "#AAAAAA" },
	{ name: "dark_gray", value: "#555555" },
	{ name: "black", value: "#000000" },
];

export type MinecraftTextWithNoEvents = Pick<
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

// Create a type that replicates the Minecraft JSON text format
export type MinecraftText = {
	// Text OR translation
	translate?: string;

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
		value: string;
	};
	hover_event?: {
		action: string;
		contents: MinecraftTextWithNoEvents;
	};
};

export type ExternalSources = {
	score: {
		objective: string;
		name: string;
	};
	translate: {
		key: string;
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

export function defaultColorLUT(color: string): string {
	return colorMap.find((e) => e.value === color)?.name || color;
}

export function getMarkType(c: JSONContent, type: string) {
	return c.marks?.find((e) => e.type === type);
}
