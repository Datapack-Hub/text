import { Extension, Mark, mergeAttributes } from "@tiptap/core";

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
	color?: string;
	font?: string;
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	strikethrough?: boolean;
	obfuscated?: boolean;
	clickEvent?: {
		action: string;
		value: string;
	};
	hoverEvent?: {
		action: string;
		contents: MinecraftTextWithNoEvents;
	};
};

interface ClickEventAttributes {
	action: string | null;
	value: string | null;
}

interface HoverEventAttributes {
	action: string | null;
	value: object;
}


declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		font: {
			/**
			 * Set the font family
			 * @param font The font family
			 * @example editor.commands.setFontFamily('Arial')
			 */
			setFont: (fontFamily: string) => ReturnType;
			/**
			 * Unset the font family
			 * @example editor.commands.unsetFontFamily()
			 */
			unsetFont: () => ReturnType;
		};
		obfuscated: {
			setObfuscated: () => ReturnType;
			toggleObfuscated: () => ReturnType;
			unsetObfuscated: () => ReturnType;
			setClickEvent: (attributes: ClickEventAttributes) => ReturnType;
			unsetClickEvent: () => ReturnType;
			setHoverEvent: (attributes: HoverEventAttributes) => ReturnType;
			unsetHoverEvent: () => ReturnType;
		};
	}
}

export const Obfuscation = Mark.create({
	name: "obfuscated",
	renderHTML({ HTMLAttributes }) {
		return [
			"blink",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			0,
		];
	},
	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addCommands() {
		return {
			setObfuscated:
				() =>
				({ chain }: any) => {
					return chain().setMark(this.name).run();
				},
			toggleObfuscated:
				() =>
				({ chain }: any) => {
					return chain().toggleMark(this.name).run();
				},
			unsetObfuscated:
				() =>
				({ chain }: any) => {
					return chain().unsetMark(this.name).run();
				},
		};
	},
});

export const Fonts = Extension.create({
	name: "font",

	addOptions() {
		return {
			types: ["textStyle"],
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					font: {
						default: null,
						parseHTML: (element) =>
							element.style.fontFamily?.replace(/['"]+/g, ""),
						renderHTML: (attributes) => {
							if (!attributes.font) {
								return {};
							}

							return {
								style: `font-family: monospace;`,
							};
						},
					},
				},
			},
		];
	},

	addCommands() {
		return {
			setFont:
				(font) =>
				({ chain }) => {
					return chain().setMark("textStyle", { font: font }).run();
				},
			unsetFont:
				() =>
				({ chain }) => {
					return chain()
						.setMark("textStyle", { font: null })
						.removeEmptyTextStyle()
						.run();
				},
		};
	},
});

export const ClickEventMark = Mark.create({
	name: "clickEvent",

	addAttributes(): ClickEventAttributes {
		return {
			action: null,
			value: null,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-click-event-action]",
				getAttrs: (element) => {
					if (typeof element === "string") {
						return false;
					}
					const el = element as HTMLElement;
					const action = el.getAttribute("data-click-event-action");
					const value = el.getAttribute("data-click-event-value");
					if (!action) {
						return false;
					}
					return {
						action,
						value,
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"span",
			mergeAttributes(
				{
					"data-click-event-action": HTMLAttributes.action,
					"data-click-event-value": HTMLAttributes.value,
					class: "clickEvent", // Optional styling
				},
				HTMLAttributes,
			),
			0,
		];
	},

	addCommands() {
		return {
			setClickEvent:
				(attributes: ClickEventAttributes) =>
				({ chain }) => {
					return chain().setMark(this.name, attributes).run();
				},
			unsetClickEvent:
				() =>
				({ chain }) => {
					return chain().unsetMark(this.name).run();
				},
		};
	},
});

export const HoverEventMark = Mark.create({
	name: "hoverEvent",

	addAttributes(): ClickEventAttributes {
		return {
			action: null,
			value: null,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-hover-event-action]",
				getAttrs: (element) => {
					if (typeof element === "string") {
						return false;
					}
					const el = element as HTMLElement;
					const action = el.getAttribute("data-hover-event-action");
					const value = el.getAttribute("data-hover-event-value");
					if (!action) {
						return false;
					}
					return {
						action,
						value,
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"span",
			mergeAttributes(
				{
					"data-click-event-action": HTMLAttributes.action,
					"data-click-event-value": HTMLAttributes.value,
					class: "hoverEvent", // Optional styling
				},
				HTMLAttributes,
			),
			0,
		];
	},

	addCommands() {
		return {
			setHoverEvent:
				(attributes: HoverEventAttributes) =>
				({ chain }) => {
					return chain().setMark(this.name, attributes).run();
				},
			unsetHoverEvent:
				() =>
				({ chain }) => {
					return chain().unsetMark(this.name).run();
				},
		};
	},
});
