import { Mark, mergeAttributes } from "@tiptap/core";

export const ShadowColorMark = Mark.create({
	name: "shadowColor",

	addAttributes() {
		return {
			shadowColor: {
				default: null,
				parseHTML: (element) =>
					element.getAttribute("data-shadow-color") || null,
				renderHTML: (attributes) => {
					if (!attributes.shadowColor) {
						return {};
					}
					return { "data-shadow-color": attributes.shadowColor };
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-shadow-color]",
				getAttrs: (element) => {
					if (typeof element === "string") {
						return false;
					}
					const el = element as HTMLElement;
					const shadowColor = el.getAttribute("data-shadow-color");
					if (!shadowColor) {
						return false;
					}
					return { shadowColor };
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		const shadowColor = HTMLAttributes["data-shadow-color"] || "black";
		return [
			"span",
			mergeAttributes(
				{
					style: `text-shadow: 2px 2px 0 ${shadowColor};`,
				},
				HTMLAttributes,
			),
			0,
		];
	},

	addCommands() {
		return {
			setShadowColor:
				(shadowColor: string) =>
				({ chain }) => {
					return chain().setMark(this.name, { shadowColor }).run();
				},
			unsetShadowColor:
				() =>
				({ chain }) => {
					return chain().unsetMark(this.name).run();
				},
		};
	},
});
