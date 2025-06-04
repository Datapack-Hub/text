import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, KeybindAttributes } from "..";

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

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-keybind-node": "true",
				contenteditable: "false",
				style: `
            background-color: #3c3c40;
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
