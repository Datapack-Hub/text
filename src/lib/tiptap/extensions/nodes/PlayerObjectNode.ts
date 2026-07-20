import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import {
	markSchema,
	type NodeOptions,
	type PlayerObjectAttributes,
} from "../index";

export const PlayerObjectNode = Node.create<NodeOptions>({
	name: "player_object",

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

	addAttributes(): PlayerObjectAttributes {
		return {
			player: {
				name: "",
			},
			hat: true,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-player-object-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { player } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-player-object-node": "",
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
			text-decoration: inherit;
        `,
			}),
			["span", {}, `OBJECT: [player ${player.name}]`],
		];
	},

	addCommands() {
		return {
			insertPlayerObject:
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
