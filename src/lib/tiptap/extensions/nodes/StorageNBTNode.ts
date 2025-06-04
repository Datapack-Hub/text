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
            background-color: #3c3c40;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 4px 6px;
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
