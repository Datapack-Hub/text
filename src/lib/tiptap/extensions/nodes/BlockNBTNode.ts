import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, BlockNBTAttributes } from "../index";

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
			background-color: #18181b;
			padding: 1px 5px;
			border-radius: 4px;
			font-size: 1rem;
			display: inline-block;
			vertical-align: var(--custom-source-align, middle);
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
