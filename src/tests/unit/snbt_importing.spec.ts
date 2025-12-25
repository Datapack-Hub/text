import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt";
import { describe, expect, it } from "vitest";
import { readTestDataFile, readTestJSONFile } from "./test_utils";

it("should return a basic document", async () => {
	const document = snbtToDocument(convertToTextOrEmpty('"test"'));
	const expectedDocument = await readTestJSONFile(
		"clean/json/simple_text_tiptap.json",
	);
	expect(document).toEqual(expectedDocument);
});

it("should apply a color to a text node", async () => {
	const basicColorSNBT = await readTestDataFile("clean/snbt/basic_color.snbt");
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

it("should throw an error if the format is invalid", async () => {
	const broken = await readTestDataFile("bad/broken.snbt");
	const converted = convertToTextOrEmpty(broken);
	expect(
		JSON.stringify(converted).includes(
			"An error occurred while parsing the SNBT",
		),
	).toBe(true);
});

it("should return a one length array if passed with a single component", async () => {
	const singleComponentSNBT = await readTestDataFile(
		"clean/snbt/single_component.snbt",
	);
	const converted = convertToTextOrEmpty(singleComponentSNBT);
	expect(converted.length).toEqual(1);
	expect(converted[0]).toEqual({ text: "hi", color: "#c0bb1e" });
});

describe("handling text styling marks", () => {
	it("should bold text styling to a text node", async () => {
		const allTextStyleSNBT = await readTestDataFile(
			"clean/snbt/all_text_style_marks.snbt",
		);
		const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

		expect(textNode?.marks).toContainEqual({ type: "bold" });
	});

	it("should italic text styling to a text node", async () => {
		const allTextStyleSNBT = await readTestDataFile(
			"clean/snbt/all_text_style_marks.snbt",
		);
		const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

		expect(textNode?.marks).toContainEqual({ type: "italic" });
	});

	it("should obfuscated text styling to a text node", async () => {
		const allTextStyleSNBT = await readTestDataFile(
			"clean/snbt/all_text_style_marks.snbt",
		);
		const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

		expect(textNode?.marks).toContainEqual({ type: "obfuscated" });
	});

	it("should underline text styling to a text node", async () => {
		const allTextStyleSNBT = await readTestDataFile(
			"clean/snbt/all_text_style_marks.snbt",
		);
		const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

		expect(textNode?.marks).toContainEqual({ type: "underline" });
	});

	it("should strike text styling to a text node", async () => {
		const allTextStyleSNBT = await readTestDataFile(
			"clean/snbt/all_text_style_marks.snbt",
		);
		const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

		expect(textNode?.marks).toContainEqual({ type: "strike" });
	});
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
	const unicodeSNBT = await readTestDataFile("clean/snbt/unicode.snbt");
	const document = snbtToDocument(convertToTextOrEmpty(unicodeSNBT));
	const expectedDocument = await readTestJSONFile(
		"clean/json/simple_unicode_tiptap.json",
	);
	expect(document).toEqual(expectedDocument);
});

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

describe("applying source props", () => {
	it("should properly apply text properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;

		expect(node[0].type).toMatch("text");
		expect(node[0].text).toMatch("hi");
	});

	it("should properly apply translate properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;
		const attrs = node[1].attrs!;

		expect(node[1].type).toMatch("translate");
		expect(node[1].attrs).toBeDefined();
		expect(attrs.key).toBeDefined();
		expect(attrs.key).toMatch("hi");
		expect(attrs.fallback).toBeDefined();
		expect(attrs.fallback).toMatch("hi");
		expect(attrs.params).toBeDefined();
		// TODO: add checks for the `with` array
	});

	it("should properly apply storage NBT properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;
		const attrs = node[2].attrs!;

		expect(node[2].type).toMatch("storage_nbt");
		expect(node[2].attrs).toBeDefined();
		expect(attrs.storage).toBeDefined();
		expect(attrs.storage).toMatch("hi");
		expect(attrs.nbt).toBeDefined();
		expect(attrs.nbt).toMatch("Items[0].id");
		expect(attrs.interpret).toBeDefined();
		expect(attrs.interpret).toEqual(true);
	});

	it("should properly apply block NBT properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;
		const attrs = node[3].attrs!;

		expect(node[3].type).toMatch("block_nbt");
		expect(node[3].attrs).toBeDefined();
		expect(attrs.block).toBeDefined();
		expect(attrs.block).toMatch("blah");
		expect(attrs.nbt).toBeDefined();
		expect(attrs.nbt).toMatch("Items[0].id");
		expect(attrs.interpret).toBeDefined();
		expect(attrs.interpret).toEqual(false);
	});

	it("should properly apply entity NBT properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;
		const attrs = node[4].attrs!;

		expect(node[4].type).toMatch("entity_nbt");
		expect(node[4].attrs).toBeDefined();
		expect(attrs.entity).toBeDefined();
		expect(attrs.entity).toMatch("blah");
		expect(attrs.nbt).toBeDefined();
		expect(attrs.nbt).toMatch("Items[0].id");
		expect(attrs.interpret).toBeDefined();
		expect(attrs.interpret).toEqual(false);
	});

	it("should properly apply score properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;
		const attrs = node[5].attrs!;

		expect(node[5].type).toMatch("score");
		expect(node[5].attrs).toBeDefined();
		expect(attrs.name).toBeDefined();
		expect(attrs.name).toMatch("@s");
		expect(attrs.objective).toBeDefined();
		expect(attrs.objective).toMatch("money");
	});
	it("should properly apply selector properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;
		const attrs = node[6].attrs!;

		expect(node[6].type).toMatch("selector");
		expect(node[6].attrs).toBeDefined();
		expect(attrs.selector).toBeDefined();
		expect(attrs.selector).toMatch("@p");
	});

	it("should properly apply keybind properties", async () => {
		const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
		const textNode = document.content![0];
		expect(textNode).toBeDefined();
		expect(textNode.type).toMatch("paragraph");

		const node = textNode.content!;
		const attrs = node[7].attrs!;

		expect(node[7].type).toMatch("keybind");
		expect(node[7].attrs).toBeDefined();
		expect(attrs.key).toBeDefined();
		expect(attrs.key).toMatch("key.jump");
	});
});

describe("handling extra", () => {
	it("should apply text styling (bold)", async () => {
		const boldSNBT = await readTestDataFile("clean/snbt/extra_test.snbt");
		const document = snbtToDocument(convertToTextOrEmpty(boldSNBT));
		const textNode = document.content?.[0]?.content?.[0];
		expect(textNode?.marks).toBeDefined();
		expect(textNode?.marks).toHaveLength(1);
		expect(textNode?.marks?.[0].type).toMatch("bold");

		const translateNode = document.content?.[0]?.content?.at(-1);
		expect(translateNode?.marks).toBeDefined();
		expect(translateNode?.marks).toHaveLength(1);
		expect(translateNode?.marks?.[0].type).toMatch("bold");
	});
});
