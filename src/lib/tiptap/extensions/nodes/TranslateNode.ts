import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, TranslateAttributes } from "..";

export const TranslateNode = Node.create<NodeOptions>({
	name: "translate",

	inline: true,
	group: "inline",
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes(): TranslateAttributes {
		return {
			key: "",
			fallback: undefined,
			params: [],
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-translate-node]",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const { key } = node.attrs;

		return [
			"span",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				"data-translate-node": "true",
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
			["span", {}, `TRANSLATE: ${key}`],
		];
	},

	addCommands() {
		return {
			insertTranslate:
				(attrs: TranslateAttributes) =>
				({ commands }: CommandProps) => {
					return commands.insertContent({
						type: this.name,
						attrs,
					});
				},
		};
	},
});
