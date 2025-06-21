import { translate } from "$lib/text/nbt_or_json";
import { describe, expect, it } from "vitest";
import { readTestDataFile, readTestJSONFile } from "./test_utils";
import type { TranslateOptions } from "$lib/types";
import type { JSONContent } from "@tiptap/core";

describe("translate", () => {
	it("should return a basic string", () => {
		const document = {
			type: "doc",
			content: [{ type: "paragraph", content: [{ type: "text", text: "test" }] }],
		};
		const snbt = translate(document, {
			exportType: "standard",
			optimise: true,
		});
		expect(snbt).toEqual('"test"');
	});

	it("should return a basic color string", async () => {
		const document = await readTestDataFile("clean/json/basic_color_tiptap.json");
		const snbt = translate(JSON.parse(document), {
			exportType: "standard",
			optimise: true,
		});
		expect(JSON.parse(snbt)).toEqual(["", { text: "test", color: "#AA0000" }]);
	});

	const baseOptions: TranslateOptions = {
		exportType: "standard",
		exportVersion: "new",
		optimise: false,
		indent: false,
		indentSize: 2,
	};

	it("returns waiting message for empty content", () => {
		const json: JSONContent = {};
		const result = translate(json, baseOptions);
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
		const result = translate(json, baseOptions);
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
		const result = translate(json, baseOptions);
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
		const result = translate(json, baseOptions);
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
		const result = translate(json, baseOptions);
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
		const result = translate(json, { ...baseOptions, optimise: true });
		expect(result).toContain("A");
		expect(result).toContain("B");
	});

	it("uses older format output when exportVersion=old", async () => {
		const json: JSONContent = await readTestJSONFile("clean/json/interactives_tiptap.json") as JSONContent
		const result = translate(json, { ...baseOptions, exportVersion: "old" });
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
		const result = translate(json, {
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
		const result = translate(json, { ...baseOptions, exportType: "item_lore" });
		expect(result).toContain("Lore");
		expect(result.startsWith("[")).toBe(true);
	});

	it("handles unknown exportType gracefully", () => {
		const json: JSONContent = {
			content: [],
		};
		const result = translate(json, {
			...baseOptions,
			exportType: "unknown" as any,
		});
		expect(result).toBe("[]");
	});
});