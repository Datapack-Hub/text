import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, ScoreAttributes } from "..";

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
          background-color: #3c3c40;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.9em;
          display: inline-flex;
          align-items: center;
          gap: 4px 6px;
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
