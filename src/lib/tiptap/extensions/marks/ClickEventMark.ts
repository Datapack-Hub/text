import { Mark, mergeAttributes } from "@tiptap/core";

import { type ClickEventAttributes } from "../index";

export const ClickEventMark = Mark.create({
	name: "clickEvent",

	addAttributes(): ClickEventAttributes {
		return {
			action: null,
			value: null,
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-click-event-action]",
				getAttrs: (element) => {
					if (typeof element === "string") {
						return false;
					}
					const el = element as HTMLElement;
					const action = el.getAttribute("data-click-event-action");
					const value = el.getAttribute("data-click-event-value");
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
					"data-click-event-action": HTMLAttributes.action,
					"data-click-event-value": HTMLAttributes.value,
					class: "clickEvent", // Optional styling
				},
				HTMLAttributes,
			),
			0,
		];
	},

	addCommands() {
		return {
			setClickEvent:
				(attributes: ClickEventAttributes) =>
				({ chain }) => {
					return chain().setMark(this.name, attributes).run();
				},
			unsetClickEvent:
				() =>
				({ chain }) => {
					return chain().unsetMark(this.name).run();
				},
		};
	},
});
