import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, ObjectAttributes } from "../index";

export const ObjectNode = Node.create<NodeOptions>({
	name: "object",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): ObjectAttributes {
		return {
			atlas: "",
			sprite: "",
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-object-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { atlas, sprite } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-object-node": "true",
				contenteditable: "false",
				style: `
            background-color: #18181b;
            padding: 0px 5px;
            border-radius: 4px;
            font-size: 0.9rem;
            display: inline-block;
			vertical-align: var(--custom-source-align, middle);
			text-decoration: inherit;
        `,
			}),
			["span", {}, `OBJECT: [${sprite}@${atlas}]`],
		];
	},

	addCommands() {
		return {
			insertObject:
				(attrs) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});
