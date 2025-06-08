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
            background-color: #18181b;
            padding: 0px 5px;
            border-radius: 4px;
			vertical-align: text-top;
            font-size: 0.9rem;
            display: inline-block;
			border: inherit;
			text-decoration: inherit;
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
