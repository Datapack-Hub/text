import { Mark, mergeAttributes } from "@tiptap/core";
import type { HoverEventAttributes } from "../index";

export const HoverEventMark = Mark.create({
	name: "hoverEvent",

	addAttributes(): HoverEventAttributes {
		return {
			action: null,
			value: null,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-hover-event-action]",
				getAttrs: (element) => {
					if (typeof element === "string") {
						return false;
					}
					const el = element as HTMLElement;
					const action = el.dataset.hoverEventAction;
					const value = JSON.parse(el.dataset.hoverEventValue!);
					if (!action) {
						return false;
					}
					return {
						action,
						value,
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"span",
			mergeAttributes({
				"data-hover-event-action": HTMLAttributes.action,
				"data-hover-event-value": JSON.stringify(HTMLAttributes.value),
				class: "hoverEvent",
			}),
			0,
		];
	},

	addCommands() {
		return {
			setHoverEvent:
				(attributes: HoverEventAttributes) =>
				({ chain }) => {
					return chain().setMark(this.name, attributes).run();
				},
			unsetHoverEvent:
				() =>
				({ chain }) => {
					return chain().unsetMark(this.name).run();
				},
		};
	},
});
