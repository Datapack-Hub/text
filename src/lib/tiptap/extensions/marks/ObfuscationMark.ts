import { Mark, mergeAttributes } from "@tiptap/core";

export const Obfuscation = Mark.create({
	name: "obfuscated",
	renderHTML({ HTMLAttributes }) {
		return [
			"span",
			mergeAttributes(
				{
					class: "obfuscated",
				},
				HTMLAttributes,
			),
			0,
		];
	},
	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addKeyboardShortcuts() {
		return {
			"Mod-o": () => {
				return this.editor.commands.toggleObfuscated();
			},
		};
	},

	addCommands() {
		return {
			setObfuscated:
				() =>
				({ chain }: any) => {
					return chain().setMark(this.name).run();
				},
			toggleObfuscated:
				() =>
				({ chain }: any) => {
					return chain().toggleMark(this.name).run();
				},
			unsetObfuscated:
				() =>
				({ chain }: any) => {
					return chain().unsetMark(this.name).run();
				},
		};
	},
});
