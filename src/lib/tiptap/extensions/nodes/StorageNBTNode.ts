import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, StorageNBTAttributes } from "..";

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

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-nbt-node": "true",
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
