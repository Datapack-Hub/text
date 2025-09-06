import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, AtlasObjectAttributes } from "../index";

export const AtlasObjectNode = Node.create<NodeOptions>({
	name: "atlas_object",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): AtlasObjectAttributes {
		return {
			atlas: "",
			sprite: "",
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-atlas-object-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { atlas, sprite } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-atlas-object-node": "true",
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
			insertAtlasObject:
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
