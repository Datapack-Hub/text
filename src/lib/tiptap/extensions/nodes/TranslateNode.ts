import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, TranslateAttributes } from "../index";

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
            background-color: var(--source-background, #18181b);
            padding: 0px 5px;
            border-radius: 4px;
            font-size: var(--source-size, 0.9rem);
            display: inline-block;
			vertical-align: var(--custom-source-align, middle);
			text-decoration: inherit;
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
