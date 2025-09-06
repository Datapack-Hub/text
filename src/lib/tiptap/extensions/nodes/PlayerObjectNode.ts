import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, PlayerObjectAttributes } from "../index";

export const PlayerObjectNode = Node.create<NodeOptions>({
	name: "player_object",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): PlayerObjectAttributes {
		return {
			player: {
				name: ""
			},
			hat: true
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
		const { player, hat } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-player-object-node": "true",
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
