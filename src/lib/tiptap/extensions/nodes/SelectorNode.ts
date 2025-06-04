import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, SelectorAttributes } from "..";

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

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-selector-node": "true",
				contenteditable: "false",
				style: `
            background-color: #3c3c40;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-block;
			user-select: all;
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
