import { outputVersion } from "$lib/stores";
import { translateJSON } from "$lib/text/nbt/export";
import { versions, type TranslateOptions } from "$lib/types";
import type { JSONContent } from "@tiptap/core";
import { expect, it } from "vitest";
import { readTestDataFile, readTestJSONFile } from "../test_utils";

it("should return a basic string", () => {
    const document = {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "test" }] }],
    };
    const snbt = translateJSON(document, {
        exportType: "standard",
        optimise: true,
    });
    expect(snbt).toEqual('"test"');
});

it("should return a basic color string", async () => {
    const document = await readTestDataFile("clean/json/basic_color_tiptap.json");
    const snbt = translateJSON(JSON.parse(document), {
        exportType: "standard",
        optimise: true,
    });
    expect(JSON.parse(snbt)).toEqual(["", { text: "test", color: "dark_red" }]);
});

const baseOptions: TranslateOptions = {
    exportType: "standard",
    optimise: false,
};

it("returns waiting message for empty content", () => {
    const json: JSONContent = {};
    const result = translateJSON(json, baseOptions);
    expect(result).toBeOneOf([
        "waiting for input...",
        "🤓 <- kevin is waiting for you to type something",
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

it("should not apply bold, italic, or obfuscated marks to objects", async () => {
    const json: JSONContent = (await readTestJSONFile(
        "clean/json/illegal_marked_object.json",
    )) as JSONContent;
    outputVersion.set(versions[versions.length - 1]); // Ensure exportVersion is set to a version that supports atlas_object and player_object
    const result = translateJSON(json, baseOptions);
    expect(result).toContain('"object":"player"');
    expect(result).not.toContain('"bold":true');
    expect(result).not.toContain('"italic":true');
    expect(result).not.toContain('"obfuscated":true');
});

it("handles shadowColor mark", async () => {
    const json: JSONContent = (await readTestJSONFile(
        "clean/json/shadow_color.json",
    )) as JSONContent;
    const result = translateJSON(json, baseOptions);
    expect(result).toContain('"shadow_color":4294902015L');
});

it("handles shadowColor transparency", async () => {
    const json: JSONContent = (await readTestJSONFile(
        "clean/json/shadow_color_transparent.json",
    )) as JSONContent;
    const result = translateJSON(json, baseOptions);
    expect(result).toContain('"shadow_color":4294923348L');
});

it("should remove shadow_color if out of range", async () => {
    const json: JSONContent = (await readTestJSONFile(
        "bad/json/too_big_shadow_color.json",
    )) as JSONContent;
    const result = translateJSON(json, baseOptions);
    expect(result).not.toContain('"shadow_color"');
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
