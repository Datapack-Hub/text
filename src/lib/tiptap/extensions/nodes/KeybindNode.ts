import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, KeybindAttributes } from "../index";

export const KeybindNode = Node.create<NodeOptions>({
    name: "keybind",

    inline: true,
    group: "inline",
    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes(): KeybindAttributes {
        return {
            key: "",
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-keybind-node]",
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const { key } = node.attrs;

        return [
            "span",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                "data-keybind-node": "true",
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
            ["span", {}, `KEYBIND: ${key}`],
        ];
    },

    addCommands() {
        return {
            insertKeybind:
                (attrs: KeybindAttributes) =>
                ({ commands }: CommandProps) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs,
                    });
                },
        };
    },
});
