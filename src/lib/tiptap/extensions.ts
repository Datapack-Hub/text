import {
	Extension,
	Mark,
	mergeAttributes,
	Node,
	type CommandProps,
} from "@tiptap/core";

interface ClickEventAttributes {
	action: string | null;
	value: string | null;
}

interface HoverEventAttributes {
	action: string | null;
	value: string | null;
}

interface ScoreAttributes {
	name: string;
	objective: string;
}

interface TranslateAttributes {
	key: string;
}

interface StorageNBTAttributes {
	nbt: string;
	storage: string;
	interpret: boolean;
}
interface BlockNBTAttributes {
	nbt: string;
	block: string;
	interpret: boolean;
}
interface EntityNBTAttributes {
	nbt: string;
	entity: string;
	interpret: boolean;
}

interface KeybindAttributes {
	key: string;
}

interface SelectorAttributes {
	selector: string;
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
		scoreNode: {
			insertScore: (attrs: ScoreAttributes) => ReturnType;
		};
		translateNode: {
			insertTranslate: (attrs: TranslateAttributes) => ReturnType;
		};
		NBTNode: {
			insertBlockNBT: (attrs: BlockNBTAttributes) => ReturnType;
			insertStorageNBT: (attrs: StorageNBTAttributes) => ReturnType;
			insertEntityNBT: (attrs: EntityNBTAttributes) => ReturnType;
		};
		keybindNode: {
			insertKeybind: (attrs: KeybindAttributes) => ReturnType;
		};
		selectorNode: {
			insertSelector: (attrs: SelectorAttributes) => ReturnType;
		};
	}
}

export const Obfuscation = Mark.create({
	name: "obfuscated",
	renderHTML({ HTMLAttributes }) {
		return [
			"span",
			mergeAttributes(
				{
					class: "obfuscated",
				},
				HTMLAttributes,
			),
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

	addAttributes(): HoverEventAttributes {
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
					"data-hover-event-action": HTMLAttributes.action,
					"data-hover-event-value": HTMLAttributes.value,
					class: "hoverEvent",
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

export interface NodeOptions {
	HTMLAttributes: Record<string, any>;
}

export const ScoreNode = Node.create<NodeOptions>({
	name: "score",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): ScoreAttributes {
		return {
			name: "",
			objective: "",
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-score-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { name, objective } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-score-node": "true",
				contenteditable: "false",
				style: `
          background-color: #555555;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.9em;
          display: inline-flex;
          align-items: center;
          gap: 4px 6px;
        `,
			}),
			["span", {}, `SCORE: ${name} - ${objective}`],
		];
	},

	addCommands() {
		return {
			insertScore:
				(attrs: { name: string; objective: string }) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});

export const TranslateNode = Node.create<NodeOptions>({
	name: "translate",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): TranslateAttributes {
		return {
			key: "",
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-translate-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { key } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-translate-node": "true",
				contenteditable: "false",
				style: `
          background-color: #555555;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.9em;
          display: inline-flex;
          align-items: center;
          gap: 4px 6px;
        `,
			}),
			["span", {}, `TRANSLATE: ${key}`],
		];
	},

	addCommands() {
		return {
			insertTranslate:
				(attrs: { key: string }) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});

export const StorageNBTNode = Node.create<NodeOptions>({
	name: "storage_nbt",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): StorageNBTAttributes {
		return {
			nbt: "",
			storage: "",
			interpret: false,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-nbt-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { nbt, storage } = node.attrs;
		console.log(node.attrs);

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-nbt-node": "true",
				contenteditable: "false",
				style: `
            background-color: #555555;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 4px 6px;
            `,
			}),
			["span", {}, `NBT: ${nbt}, ${storage}`],
		];
	},

	addCommands() {
		return {
			insertStorageNBT:
				(attrs: StorageNBTAttributes) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});

export const EntityNBTNode = Node.create<NodeOptions>({
	name: "entity_nbt",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): EntityNBTAttributes {
		return {
			nbt: "",
			entity: "",
			interpret: false,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-nbt-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { nbt, entity } = node.attrs;
		console.log(node.attrs);

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-nbt-node": "true",
				contenteditable: "false",
				style: `
            background-color: #555555;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 4px 6px;
            `,
			}),
			["span", {}, `NBT: ${nbt}, ${entity}`],
		];
	},

	addCommands() {
		return {
			insertEntityNBT:
				(attrs: EntityNBTAttributes) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});

export const BlockNBTNode = Node.create<NodeOptions>({
	name: "block_nbt",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): BlockNBTAttributes {
		return {
			nbt: "",
			block: "",
			interpret: false,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-nbt-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { nbt, block } = node.attrs;
		console.log(node.attrs);

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-nbt-node": "true",
				contenteditable: "false",
				style: `
            background-color: #555555;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 4px 6px;
            `,
			}),
			["span", {}, `NBT: ${nbt}, ${block}`],
		];
	},

	addCommands() {
		return {
			insertBlockNBT:
				(attrs: BlockNBTAttributes) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});

export const KeybindNode = Node.create<NodeOptions>({
	name: "keybind",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): KeybindAttributes {
		return {
			key: "",
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-keybind-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { key } = node.attrs;
		console.log(node.attrs);

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-keybind-node": "true",
				contenteditable: "false",
				style: `
            background-color: #555555;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 4px 6px;
            `,
			}),
			["span", {}, `KEYBIND: ${key}`],
		];
	},

	addCommands() {
		return {
			insertKeybind:
				(attrs: KeybindAttributes) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});

export const SelectorNode = Node.create<NodeOptions>({
	name: "selector",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): SelectorAttributes {
		return {
			selector: "",
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-selector-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { selector } = node.attrs;
		console.log(node.attrs);

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-selector-node": "true",
				contenteditable: "false",
				style: `
            background-color: #555555;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 4px 6px;
            `,
			}),
			["span", {}, `SELECTOR: ${selector}`],
		];
	},

	addCommands() {
		return {
			insertSelector:
				(attrs: SelectorAttributes) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});
