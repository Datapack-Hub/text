import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import {
	markSchema,
	type AtlasObjectAttributes,
	type NodeOptions,
} from "../index";

export const AtlasObjectNode = Node.create<NodeOptions>({
	name: "atlas_object",

	inline: true,
	group: "inline",
	atom: true,

	marks() {
		const blocklist = new Set(["bold", "italic", "obfuscated"]);
		const allMarks = Object.keys(markSchema.marks || {});
		return allMarks.filter((mark) => !blocklist.has(mark)).join(" ");
	},

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
		let { atlas, sprite } = node.attrs;
		if (!atlas) {
			atlas = "minecraft:blocks";
		}

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-atlas-object-node": "",
				contenteditable: "false",
				style: `
            background-color: #18181b;
            padding: 0px 5px;
            border-radius: 4px;
            font-size: 0.9rem;
            display: inline-block;
			vertical-align: var(--custom-source-align, middle);
			font-style: normal !important;
			font-weight: normal !important;
			font-family: Minecraft !important;
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
