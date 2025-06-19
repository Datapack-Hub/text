import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt";
import { describe, it, expect } from "vitest";
import { readTestDataFile } from "./test_utils";
import { translate } from "$lib/text/nbt_or_json";

describe("snbt importing", () => {
	it("should return a basic document", () => {
		const document = snbtToDocument(convertToTextOrEmpty('"test"'));
		expect(document).toEqual({
			type: "doc",
			content: [{ type: "paragraph", content: [{ type: "text", text: "test" }] }],
		});
	});

	it("should apply a color to a text node", async () => {
		const basicColorSNBT = await readTestDataFile("clean/basic_color.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(basicColorSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks).toHaveLength(1);

		const mark = textNode?.marks?.at(0);

		expect(mark?.type).toMatch("textStyle");

		expect(mark?.attrs?.color).toBeDefined();
		expect(mark?.attrs?.color).toMatch("#AA0000");
	});

	it("should apply a hex color to a text node", async () => {
		const basicColorSNBT = await readTestDataFile("clean/hex_color.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(basicColorSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks).toHaveLength(1);

		const mark = textNode?.marks?.at(0);

		expect(mark?.type).toMatch("textStyle");

		expect(mark?.attrs?.color).toBeDefined();
		expect(mark?.attrs?.color).toMatch("#c0bb1e");
	});

	it("should apply all text styles to a text node", async () => {
		const allTextStyleSNBT = await readTestDataFile("clean/all_text_style_marks.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks).toHaveLength(5);
		
		expect(textNode?.marks).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ type: "bold" }),
				expect.objectContaining({ type: "italic" }),
				expect.objectContaining({ type: "strike" }),
				expect.objectContaining({ type: "underline" }),
				expect.objectContaining({ type: "obfuscated" }),
			]),
		);
	});

	it("should return nothing if its an empty string literal", () => {
		const document = snbtToDocument(convertToTextOrEmpty('""'));
		expect(document).toEqual({
			type: "doc",
			content: [],
		});
	})

	it("should return nothing if its an empty string", () => {
		const document = snbtToDocument(convertToTextOrEmpty(''));
		expect(document).toEqual({
			type: "doc",
			content: [],
		});
	});
});

describe("translating mc json", () => {
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

	it("should return a basic color string", () => {
		const document = {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "test",
							marks: [{ type: "textStyle", attrs: { color: "#AA0000" } }],
						},
					],
				},
			],
		};
		const snbt = translate(document, {
			exportType: "standard",
			optimise: true,
		});
		expect(JSON.parse(snbt)).toEqual(["",{"text":"test","color":"#AA0000"}]);
	});
})