import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt/import";
import { describe, expect, it } from "vitest";
import { readTestDataFile, readTestJSONFile } from "../test_utils";

it("should return a basic document", async () => {
    const document = snbtToDocument(convertToTextOrEmpty('"test"'));
    const expectedDocument = await readTestJSONFile("clean/json/simple_text.json");
    expect(document).toEqual(expectedDocument);
});

it("should return a basic document (empty str)", () => {
    const document = snbtToDocument(convertToTextOrEmpty(""));
    const expectedDocument = { content: [], type: "doc" };
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

it("should apply a decimal shadow color to a text node", async () => {
    const basicColorSNBT = await readTestDataFile("clean/snbt/base10_shadow_color.snbt");
    const document = snbtToDocument(convertToTextOrEmpty(basicColorSNBT));
    const textNode = document.content?.[0]?.content?.[0];
    expect(textNode?.marks).toBeDefined();
    expect(textNode?.marks).toHaveLength(1);

    const mark = textNode?.marks?.at(0);

    expect(mark?.type).toMatch("shadowColor");

    expect(mark?.attrs?.shadowColor).toBeDefined();
    expect(mark?.attrs?.shadowColor).toMatch("#ffff84ff");
});

it("should apply a hexadecimal shadow color to a text node", async () => {
    const basicColorSNBT = await readTestDataFile("clean/snbt/base16_shadow_color.snbt");
    const document = snbtToDocument(convertToTextOrEmpty(basicColorSNBT));
    const textNode = document.content?.[0]?.content?.[0];
    expect(textNode?.marks).toBeDefined();
    expect(textNode?.marks).toHaveLength(1);

    const mark = textNode?.marks?.at(0);

    expect(mark?.type).toMatch("shadowColor");

    expect(mark?.attrs?.shadowColor).toBeDefined();
    expect(mark?.attrs?.shadowColor).toMatch("#ff0000ff");
});

it("should apply an array-based shadow color to a text node", async () => {
    const basicColorSNBT = await readTestDataFile("clean/snbt/shadow_color_array.snbt");
    const document = snbtToDocument(convertToTextOrEmpty(basicColorSNBT));
    const textNode = document.content?.[0]?.content?.[0];
    expect(textNode?.marks).toBeDefined();
    expect(textNode?.marks).toHaveLength(1);

    const mark = textNode?.marks?.at(0);

    expect(mark?.type).toMatch("shadowColor");

    expect(mark?.attrs?.shadowColor).toBeDefined();
    // Would be #FF8000FF, but ARGB to RGBA conversion is applied, so it becomes #8000FFFF
    expect(mark?.attrs?.shadowColor).toMatch("#ff8000ff");
});

it("should successfully blank out an array-based shadow color if it is invalid", async () => {
    const basicColorSNBT = await readTestDataFile("bad/shadow_color_array_invalid.snbt");
    const document = snbtToDocument(convertToTextOrEmpty(basicColorSNBT));
    const textNode = document.content?.[0]?.content?.[0];
    expect(textNode?.marks).toBeDefined();
    expect(textNode?.marks).toHaveLength(1);

    const mark = textNode?.marks?.at(0);

    expect(mark?.type).toMatch("shadowColor");

    expect(mark?.attrs?.shadowColor).toBeDefined();
    expect(mark?.attrs?.shadowColor).toMatch("#008000ff");
});

it("should throw an error if the format is invalid", async () => {
    const broken = await readTestDataFile("bad/broken.snbt");
    const converted = convertToTextOrEmpty(broken);
    expect(JSON.stringify(converted).includes("An error occurred while parsing the SNBT")).toBe(
        true,
    );
});

it("should return a one length array if passed with a single component", async () => {
    const singleComponentSNBT = await readTestDataFile("clean/snbt/single_component.snbt");
    const converted = convertToTextOrEmpty(singleComponentSNBT);
    expect(converted.length).toEqual(1);
    expect(converted[0]).toEqual({ text: "hi", color: "#c0bb1e" });
});

it("should return valid interactive components", async () => {
    const interactiveSNBT = await readTestDataFile("clean/snbt/interactives.snbt");
    const document = snbtToDocument(convertToTextOrEmpty(interactiveSNBT));
    const textNode = document.content?.[0]?.content?.[0];
    expect(textNode?.marks?.[0]).toBeDefined();
    expect(textNode?.marks?.[0].type).toBe("clickEvent");
});

it("should return valid interactive components with old formats", async () => {
    const interactiveSNBT = await readTestDataFile("clean/snbt/interactives_old.snbt");
    const document = snbtToDocument(convertToTextOrEmpty(interactiveSNBT));
    const textNode = document.content?.[0]?.content?.[0];
    expect(textNode?.marks?.[0]).toBeDefined();
    expect(textNode?.marks?.[0].type).toBe("clickEvent");
});

describe("handling text styling marks", () => {
    it("should bold text styling to a text node", async () => {
        const allTextStyleSNBT = await readTestDataFile("clean/snbt/all_text_style_marks.snbt");
        const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
        const textNode = document.content?.[0]?.content?.[0];
        expect(textNode?.marks).toBeDefined();
        expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

        expect(textNode?.marks).toContainEqual({ type: "bold" });
    });

    it("should italic text styling to a text node", async () => {
        const allTextStyleSNBT = await readTestDataFile("clean/snbt/all_text_style_marks.snbt");
        const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
        const textNode = document.content?.[0]?.content?.[0];
        expect(textNode?.marks).toBeDefined();
        expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

        expect(textNode?.marks).toContainEqual({ type: "italic" });
    });

    it("should obfuscated text styling to a text node", async () => {
        const allTextStyleSNBT = await readTestDataFile("clean/snbt/all_text_style_marks.snbt");
        const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
        const textNode = document.content?.[0]?.content?.[0];
        expect(textNode?.marks).toBeDefined();
        expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

        expect(textNode?.marks).toContainEqual({ type: "obfuscated" });
    });

    it("should underline text styling to a text node", async () => {
        const allTextStyleSNBT = await readTestDataFile("clean/snbt/all_text_style_marks.snbt");
        const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
        const textNode = document.content?.[0]?.content?.[0];
        expect(textNode?.marks).toBeDefined();
        expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

        expect(textNode?.marks).toContainEqual({ type: "underline" });
    });

    it("should strike text styling to a text node", async () => {
        const allTextStyleSNBT = await readTestDataFile("clean/snbt/all_text_style_marks.snbt");
        const document = snbtToDocument(convertToTextOrEmpty(allTextStyleSNBT));
        const textNode = document.content?.[0]?.content?.[0];
        expect(textNode?.marks).toBeDefined();
        expect(textNode?.marks?.length).toBeGreaterThanOrEqual(1);

        expect(textNode?.marks).toContainEqual({ type: "strike" });
    });

    it("should handle unicode characters", async () => {
        const unicodeSNBT = await readTestDataFile("clean/snbt/unicode.snbt");
        const document = snbtToDocument(convertToTextOrEmpty(unicodeSNBT));
        const expectedDocument = await readTestJSONFile("clean/json/simple_unicode.json");
        expect(document).toEqual(expectedDocument);
    });
});

describe("handling invalid cases", () => {
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
