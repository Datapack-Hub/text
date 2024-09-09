import { Extension, Mark, mergeAttributes } from "@tiptap/core";

export const colorMap = [
	{ name: "dark_green", value: "#00AA00" },
	{ name: "green", value: "#55FF55" },
	{ name: "aqua", value: "#55FFFF" },
	{ name: "dark_aqua", value: "#00AAAA" },
	{ name: "dark_blue", value: "#0000AA" },
	{ name: "blue", value: "#5555FF" },
	{ name: "light_purple", value: "#FF55FF" },
	{ name: "dark_purple", value: "#AA00AA" },
	{ name: "white", value: "#FFFFFF" },
	{ name: "gray", value: "#AAAAAA" },
	{ name: "dark_gray", value: "#555555" },
	{ name: "black", value: "#000000" },
];

// Create a type that replicates the Minecraft JSON text format
export type MinecraftText = {
	// Text OR translation
	translate?: string;
	text?: string;
	color?: string;
	font?: string;
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	strikethrough?: boolean;
	obfuscated?: boolean;
	clickEvent?: {
		action: string;
		value: string;
	};
	hoverEvent?: {
		action: string;
		value: string;
	};
};


export const Obfuscation = Mark.create({
	name: "obfuscated",
	renderHTML({ HTMLAttributes }) {
		return ["blink", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
	},
	addOptions() {
		return {
			HTMLAttributes: {}
		}
	},

	// @ts-ignore
	addCommands() {
		return {
			setObfuscated: () => ({ chain }: any) => {
				return chain().setMark(this.name).run()
			},
			toggleObfuscated: () => ({ chain }: any) => {
				return chain().toggleMark(this.name).run()
			},
			unsetObfuscated: () => ({ chain }: any) => {
				return chain().unsetMark(this.name).run()
			},
		}
	},
})

export const Fonts = Extension.create({
  name: 'font',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          font: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.font) {
                return {}
              }

              return {
                style: `font-family: monospace;`,
              }
            },
          },
        },
      },
    ]
  },

  //@ts-ignore
  addCommands() {
    return {
      setFont: font => ({ chain }) => {
        return chain()
          .setMark('textStyle', { font: font })
          .run()
      },
      unsetFont: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { font: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
