import { Extension } from "@tiptap/core";

export let fontLUT: Map<string, string> = new Map();

export const FontsExtension = Extension.create({
	name: "font",

	addOptions() {
		return {
			types: ["textStyle"],
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					font: {
						default: null,
						parseHTML: (element) =>
							element.style.fontFamily?.replace(/['"]+/g, ""),
						renderHTML: (attributes) => {
							if (!attributes.font) {
								return {};
							}

							let font = "monospace";

							switch (attributes.font.toLowerCase()) {
								case "minecraft:alt":
									font = "MinecraftEnchanting";
									break;
								case "minecraft:illageralt":
									font = "MinecraftIllager";
									break;
							}

							for (const [identifier, alias] of fontLUT) {
								if (attributes.font.toLowerCase() === identifier) {
									font = alias;
								}
							}

							return {
								style: `
									font-family: "${font}";
									font-size: 12pt;
								`,
							};
						},
					},
				},
			},
		];
	},

	addCommands() {
		return {
			setFont:
				(font) =>
				({ chain }) => {
					return chain().setMark("textStyle", { font: font }).run();
				},
			unsetFont:
				() =>
				({ chain }) => {
					return chain()
						.setMark("textStyle", { font: undefined })
						.removeEmptyTextStyle()
						.run();
				},
		};
	},
});
