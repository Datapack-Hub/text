import type { FixedTextStyle } from "./FixedTextStyle";

export interface ClickEventAttributes {
	action: string | null;
	value: string | null;
}

export interface HoverEventAttributes {
	action: string | null;
	value: string | null;
}

export interface ScoreAttributes {
	name: string;
	objective: string;
}

export interface TranslateAttributes {
	key: string;
	params: string[];
	fallback?: string;
}

export interface StorageNBTAttributes {
	nbt: string;
	storage: string;
	interpret: boolean;
}
export interface BlockNBTAttributes {
	nbt: string;
	block: string;
	interpret: boolean;
}
export interface EntityNBTAttributes {
	nbt: string;
	entity: string;
	interpret: boolean;
}

export interface KeybindAttributes {
	key: string;
}

export interface SelectorAttributes {
	selector: string;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		marks: {
			setObfuscated: () => ReturnType;
			toggleObfuscated: () => ReturnType;
			unsetObfuscated: () => ReturnType;
			setClickEvent: (attributes: ClickEventAttributes) => ReturnType;
			unsetClickEvent: () => ReturnType;
			setHoverEvent: (attributes: HoverEventAttributes) => ReturnType;
			unsetHoverEvent: () => ReturnType;
			setShadowColor: (shadowColor: string) => ReturnType;
			unsetShadowColor: () => ReturnType;
		};
		scoreNode: {
			insertScore: (attrs: ScoreAttributes) => ReturnType;
		};
		translateNode: {
			insertTranslate: (attrs: TranslateAttributes) => ReturnType;
		};
		NBTNode: {
			insertBlockNBT: (attrs: BlockNBTAttributes) => ReturnType;
			insertStorageNBT: (attrs: StorageNBTAttributes) => ReturnType;
			insertEntityNBT: (attrs: EntityNBTAttributes) => ReturnType;
		};
		keybindNode: {
			insertKeybind: (attrs: KeybindAttributes) => ReturnType;
		};
		selectorNode: {
			insertSelector: (attrs: SelectorAttributes) => ReturnType;
		};
	}
}

export interface NodeOptions {
	HTMLAttributes: Record<string, any>;
}

export { BlockNBTNode } from "./nodes/BlockNBTNode";
export { EntityNBTNode } from "./nodes/EntityNBTNode";
export { StorageNBTNode } from "./nodes/StorageNBTNode";
export { ScoreNode } from "./nodes/ScoreNode";
export { TranslateNode } from "./nodes/TranslateNode";
export { KeybindNode } from "./nodes/KeybindNode";
export { SelectorNode } from "./nodes/SelectorNode";
export { Obfuscation } from "./marks/ObfuscationMark";
export { ClickEventMark } from "./marks/ClickEventMark";
export { HoverEventMark } from "./marks/HoverEventMark";
export { FixedTextStyle } from "./FixedTextStyle";
