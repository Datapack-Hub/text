export type Version = {
	friendly: string;
	description: string;
	index: number;
};
export const versions = [
	{
		friendly: "pre-1.21.5",
		description: "uses json text components",
		index: 0,
	},
	{
		friendly: "1.21.5-8",
		description: "uses nbt as text components, changes to syntax and names",
		index: 1,
	},
	{
		friendly: "1.21.9+",
		description:
			"'object' type added, allowing you to use non-character sprites",
		index: 2,
	},
];
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
export type StringyMCText = string | VersionAgnosticText;
export type VersionAgnosticText = MinecraftText & OldMinecraftText;
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

	object?: string;
	atlas?: string;
	sprite?: string;
	player?: {
		name: string;
	};
	hat?: string;

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
	object: {
		// can be omitted for only atlas objects ONLY
		object?: string;
		atlas: string;
		sprite: string;
		player: {
			name: string;
			id: string;
		};
		hat: boolean;
	};
};

export type TranslateOptions = Partial<{
	optimise: boolean;
	exportType: "standard" | "item_lore";
}>;
