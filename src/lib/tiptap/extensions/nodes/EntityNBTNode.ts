import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import type { NodeOptions, EntityNBTAttributes } from "../index";

export const EntityNBTNode = Node.create<NodeOptions>({
    name: "entity_nbt",

    inline: true,
    group: "inline",
    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes(): EntityNBTAttributes {
        return {
            nbt: "",
            entity: "",
            interpret: false,
        };
    },

    parseHTML() {
        return [
            {
                tag: "p[data-nbt-node]",
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const { nbt, entity } = node.attrs;

        return [
            "p",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                "data-nbt-node": "true",
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
            ["p", {}, `NBT: ${nbt}, ${entity}`],
        ];
    },

    addCommands() {
        return {
            insertEntityNBT:
                (attrs: EntityNBTAttributes) =>
                ({ commands }: CommandProps) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs,
                    });
                },
        };
    },
});
