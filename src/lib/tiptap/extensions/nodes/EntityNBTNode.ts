import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, EntityNBTAttributes } from "..";

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

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-nbt-node": "true",
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
