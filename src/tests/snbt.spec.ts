import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt";
import { describe, it, expect } from "vitest";
import { readTestDataFile, readTestJSONFile } from "./test_utils";
import { translate } from "$lib/text/nbt_or_json";

describe("snbt importing", () => {
	it("should return a basic document", async () => {
		const document = snbtToDocument(convertToTextOrEmpty('"test"'));
		const expectedDocument = await readTestJSONFile("clean/json/simple_text_tiptap.json");
		expect(document).toEqual(expectedDocument);
	});

	it("should apply a color to a text node", async () => {
		const basicColorSNBT = await readTestDataFile(
			"clean/snbt/basic_color.snbt",
		);
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
		const basicColorSNBT = await readTestDataFile("clean/snbt/hex_color.snbt");
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
		const allTextStyleSNBT = await readTestDataFile(
			"clean/snbt/all_text_style_marks.snbt",
		);
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
	});

	it("should return nothing if its an empty string", () => {
		const document = snbtToDocument(convertToTextOrEmpty(""));
		expect(document).toEqual({
			type: "doc",
			content: [],
		});
	});

	it("should handle unicode characters", async () => {
		const unicodeSNBT = await readTestDataFile("clean/snbt/unicode.snbt")
		const document = snbtToDocument(convertToTextOrEmpty(unicodeSNBT));
		const expectedDocument = await readTestJSONFile(
			"clean/json/simple_unicode_tiptap.json",
		);
		expect(document).toEqual(expectedDocument);
	})

	it("should properly apply the font properties", async () => {
		const fontsSNBT = await readTestDataFile("clean/snbt/fonts.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(fontsSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks).toHaveLength(1);

		const mark = textNode?.marks?.at(0);

		expect(mark?.type).toMatch("textStyle");

		expect(mark?.attrs?.font).toBeDefined();
		expect(mark?.attrs?.font).toMatch("minecraft:illageralt");
	});


});

describe("translating mc json", () => {
	it("should return a basic string", () => {
		const document = {
			type: "doc",
			content: [
				{ type: "paragraph", content: [{ type: "text", text: "test" }] },
			],
		};
		const snbt = translate(document, {
			exportType: "standard",
			optimise: true,
		});
		expect(snbt).toEqual('"test"');
	});

	it("should return a basic color string", async () => {
		const document = await readTestDataFile(
			"clean/json/basic_color_tiptap.json",
		);
		const snbt = translate(JSON.parse(document), {
			exportType: "standard",
			optimise: true,
		});
		expect(JSON.parse(snbt)).toEqual(["", { text: "test", color: "#AA0000" }]);
	});
});
