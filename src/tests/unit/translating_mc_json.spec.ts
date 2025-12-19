import {
	addTypeSpecificValues,
	translateJSON,
} from "$lib/text/nbt/nbt_or_json";
import {
	versions,
	type MinecraftText,
	type TranslateOptions,
} from "$lib/types";
import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { readTestDataFile, readTestJSONFile } from "./test_utils";
import { outputVersion } from "$lib/stores";

describe("translate", () => {
	it("should return a basic string", () => {
		const document = {
			type: "doc",
			content: [
				{ type: "paragraph", content: [{ type: "text", text: "test" }] },
			],
		};
		const snbt = translateJSON(document, {
			exportType: "standard",
			optimise: true,
		});
		expect(snbt).toEqual('"test"');
	});

	it("should return a basic color string", async () => {
		const document = await readTestDataFile(
			"clean/json/basic_color_tiptap.json",
		);
		const snbt = translateJSON(JSON.parse(document), {
			exportType: "standard",
			optimise: true,
		});
		expect(JSON.parse(snbt)).toEqual(["", { text: "test", color: "dark_red" }]);
	});

	const baseOptions: TranslateOptions = {
		exportType: "standard",
		optimise: false,
		indent: false,
		indentSize: 2,
	};

	it("returns waiting message for empty content", () => {
		const json: JSONContent = {};
		const result = translateJSON(json, baseOptions);
		expect(result).toBeOneOf([
			"waiting for input...",
			"🤓 <- james is waiting for you to type something",
		]);
	});

	it("translates simple text node", () => {
		const json: JSONContent = {
			content: [
				{
					content: [
						{
							type: "text",
							text: "Hello",
							marks: [],
						},
					],
				},
			],
		};
		const result = translateJSON(json, baseOptions);
		expect(result).toContain("Hello");
		expect(result).not.toContain("color");
	});

	it("applies bold and italic marks", () => {
		const json: JSONContent = {
			content: [
				{
					content: [
						{
							type: "text",
							text: "BoldItalic",
							marks: [{ type: "bold" }, { type: "italic" }],
						},
					],
				},
			],
		};
		const result = translateJSON(json, baseOptions);
		expect(result).toContain("BoldItalic");
		expect(result).toContain('"bold":true');
		expect(result).toContain('"italic":true');
	});

	it("handles shadowColor mark", () => {
		const json: JSONContent = {
			content: [
				{
					content: [
						{
							type: "text",
							text: "Shadow",
							marks: [
								{
									type: "shadowColor",
									attrs: { shadowColor: "#ff00ff" },
								},
							],
						},
					],
				},
			],
		};
		const result = translateJSON(json, baseOptions);
		expect(result).toContain('"shadow_color":16711935');
	});

	it("handles multiple paragraphs with newlines", () => {
		const json: JSONContent = {
			content: [
				{
					content: [{ type: "text", text: "First", marks: [] }],
				},
				{
					content: [{ type: "text", text: "Second", marks: [] }],
				},
			],
		};
		const result = translateJSON(json, baseOptions);
		expect(result).toContain("First");
		expect(result).toContain("Second");
		expect(result).toContain("\\n");
	});

	it("optimises output when optimise=true", () => {
		const json: JSONContent = {
			content: [
				{
					content: [
						{ type: "text", text: "A", marks: [] },
						{ type: "text", text: "B", marks: [] },
					],
				},
			],
		};
		const result = translateJSON(json, { ...baseOptions, optimise: true });
		expect(result).toContain("A");
		expect(result).toContain("B");
	});

	it("uses older format output when exportVersion=old", async () => {
		const json: JSONContent = (await readTestJSONFile(
			"clean/json/interactives_tiptap.json",
		)) as JSONContent;
		outputVersion.set(versions[0]);
		const result = translateJSON(json, {
			...baseOptions,
		});
		expect(JSON.parse(result)).toHaveProperty("[1].clickEvent");
		expect(JSON.parse(result)).not.toHaveProperty("[1].click_event");
		expect(JSON.parse(result)).toHaveProperty("[1].hoverEvent");
		expect(JSON.parse(result)).not.toHaveProperty("[1].hover_event");
	});

	it("returns indented JSON when indent=true", () => {
		const json: JSONContent = {
			content: [
				{
					content: [{ type: "text", text: "Indented", marks: [] }],
				},
			],
		};
		const result = translateJSON(json, {
			...baseOptions,
			indent: true,
			indentSize: 4,
		});
		expect(result.includes("\n")).toBe(true);
	});

	it("handles exportType=item_lore", () => {
		const json: JSONContent = {
			content: [
				{
					content: [{ type: "text", text: "Lore", marks: [] }],
				},
			],
		};
		const result = translateJSON(json, {
			...baseOptions,
			exportType: "item_lore",
		});
		expect(result).toContain("Lore");
		expect(result.startsWith("[")).toBe(true);
	});

	it("handles unknown exportType gracefully", () => {
		const json: JSONContent = {
			content: [],
		};
		const result = translateJSON(json, {
			...baseOptions,
			exportType: "unknown" as any,
		});
		expect(result).toBe("[]");
	});
});

describe("adding type props", () => {
	it("should add text property for type 'text'", () => {
		const current: MinecraftText = {};
		const c: JSONContent = { type: "text", text: "hello" };
		const result = addTypeSpecificValues(current, c, false);
		expect(result.text).toBe("hello");
	});

	it("should add score property for type 'score'", () => {
		const current: MinecraftText = {};
		const c: JSONContent = {
			type: "score",
			attrs: { name: "player", objective: "obj" },
		};
		const result = addTypeSpecificValues(current, c, false);
		expect(result.score).toEqual({ name: "player", objective: "obj" });
	});

	it("should add translate, with, and fallback for type 'translate'", () => {
		const current: MinecraftText = {};
		const c: JSONContent = {
			type: "translate",
			attrs: {
				key: "translation.key",
				params: ["param1", "param2"],
				fallback: "fallback text",
			},
		};
		const result = addTypeSpecificValues(current, c, false);
		expect(result.translate).toBe("translation.key");
		expect(result.with).toEqual(["param1", "param2"]);
		expect(result.fallback).toBe("fallback text");
	});

	it("should add nbt, storage, block, entity, interpret for nbt types", () => {
		const current: MinecraftText = {};
		const c: JSONContent = {
			type: "storage_nbt",
			attrs: {
				nbt: "someNbt",
				storage: "someStorage",
				block: "someBlock",
				entity: "someEntity",
				interpret: true,
			},
		};
		const result = addTypeSpecificValues(current, c, false);
		expect(result.nbt).toBe("someNbt");
		expect(result.storage).toBe("someStorage");
		expect(result.block).toBe("someBlock");
		expect(result.entity).toBe("someEntity");
		expect(result.interpret).toBe(true);
	});

	it("should add keybind property for type 'keybind'", () => {
		const current: MinecraftText = {};
		const c: JSONContent = { type: "keybind", attrs: { key: "key.jump" } };
		const result = addTypeSpecificValues(current, c, false);
		expect(result.keybind).toBe("key.jump");
	});

	it("should add selector property for type 'selector'", () => {
		const current: MinecraftText = {};
		const c: JSONContent = { type: "selector", attrs: { selector: "@a" } };
		const result = addTypeSpecificValues(current, c, false);
		expect(result.selector).toBe("@a");
	});
});
