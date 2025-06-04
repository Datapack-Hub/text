import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, BlockNBTAttributes } from "..";

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
