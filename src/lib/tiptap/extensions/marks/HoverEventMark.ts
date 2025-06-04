import { Mark, mergeAttributes } from "@tiptap/core";
import type { HoverEventAttributes } from "..";

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
					const action = el.getAttribute("data-hover-event-action");
					const value = el.getAttribute("data-hover-event-value");
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
			mergeAttributes(
				{
					"data-hover-event-action": HTMLAttributes.action,
					"data-hover-event-value": HTMLAttributes.value,
					class: "hoverEvent",
				},
				HTMLAttributes,
			),
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
