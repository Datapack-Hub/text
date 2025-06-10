import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, ScoreAttributes } from "../index";

export const ScoreNode = Node.create<NodeOptions>({
	name: "score",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): ScoreAttributes {
		return {
			name: "",
			objective: "",
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-score-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { name, objective } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-score-node": "true",
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
			["span", {}, `SCORE: ${name} - ${objective}`],
		];
	},

	addCommands() {
		return {
			insertScore:
				(attrs: { name: string; objective: string }) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});
