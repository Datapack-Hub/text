export type BaseMinecraftText = Pick<
	MinecraftText,
	| "text"
	| "color"
	| "font"
	| "bold"
	| "italic"
	| "underlined"
	| "strikethrough"
	| "obfuscated"
>;
export type StringyMCText = string | (MinecraftText & OldMinecraftText);
export type MinecraftText = {
	translate?: string;
	with?: string[];
	fallback?: string;

	text?: string;

	score?: {
		name: string;
		objective: string;
	};

	nbt?: string;
	interpret?: string;
	storage?: string;
	block?: string;
	entity?: string;

	keybind?: string;

	selector?: string;

	color?: string;
	shadow_color?: number | number[];
	font?: string;
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	strikethrough?: boolean;
	obfuscated?: boolean;
	click_event?: {
		action: string;
		url?: string;
		command?: string;
		value?: string;
		page?: string;
		dialog?: string;
	};
	hover_event?: {
		action: string;

		value?: BaseMinecraftText | BaseMinecraftText[];

		id?: string;
		count?: number;
		components?: {}[];

		name?: BaseMinecraftText | BaseMinecraftText[];
		uuid?: string | number[];
	};

	extra?: StringyMCText[];
};
export type OldMinecraftText = Omit<
	MinecraftText,
	"hover_event" | "click_event"
> & {
	clickEvent?: {
		action: string;
		value: string;
	};

	hoverEvent?: {
		action: string;
		contents: any;
	};
};
export type ExternalSources = {
	score: {
		objective: string;
		name: string;
	};
	translate: {
		key: string;
		params: string[];
		fallback?: string;
	};
	nbt: {
		sourceType: string;
		storage: string;
		entity: string;
		block: string;
		path: string;
		interpret: boolean;
	};
	keybind: {
		key: string;
	};
	selector: {
		selector: string;
	};
};

export type MCTextKey = keyof MinecraftText;
export type TranslateOptions = Partial<{
	indent: boolean;
	indentSize: number;
	exportVersion: "old" | "new";
	optimise: boolean;
	exportType: "standard" | "item_lore";
}>;
