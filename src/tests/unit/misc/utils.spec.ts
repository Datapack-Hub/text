import {
    defaultColorLUT,
    defaultColorReverseLUT,
    isDefinedTextObject,
    findMarkType,
    trueMarkOrUndefined,
    unescapeUnicode,
    mapToHexByte,
    stripTypeSuffixes,
    rgbaToArgbHex,
    argbToRgbaHex,
    rgbToHex,
} from "$lib/text/utils";
import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";

describe("isDefinedTextObject", () => {
    it("should report defined object with minimal object", () => {
        const obj = { text: "Hello" };
        const result = isDefinedTextObject(obj);
        expect(result).toBe(true);
    });

    it("should report false with minimal object", () => {
        const obj = "Hello";
        const result = isDefinedTextObject(obj);
        expect(result).toBe(false);
    });

    it("should report false with object missing text", () => {
        const obj = { color: "red" };
        const result = isDefinedTextObject(obj);
        expect(result).toBe(false);
    });

    it("should report true with object having extra properties", () => {
        const obj = { text: "Hello", color: "blue", bold: true };
        const result = isDefinedTextObject(obj);
        expect(result).toBe(true);
    });
});

describe("unescapeUnicode", () => {
    it("should unescape unicode sequences", () => {
        const input = "Hello \\u0041\\u0042\\u0043";
        const output = unescapeUnicode(input);
        expect(output).toBe("Hello ABC");
    });
    it("should handle strings without unicode sequences", () => {
        const input = "Hello World!";
        const output = unescapeUnicode(input);
        expect(output).toBe("Hello World!");
    });
    it("should handle mixed content", () => {
        const input = "Smile: \\u263A and Heart: \\u2764";
        const output = unescapeUnicode(input);
        expect(output).toBe("Smile: ☺ and Heart: ❤");
    });
    it("should handle consecutive unicode sequences", () => {
        const input = "\\u0048\\u0045\\u004C\\u004C\\u004F";
        const output = unescapeUnicode(input);
        expect(output).toBe("HELLO");
    });
    it("should correctly handle invalid unicode sequences", () => {
        const input = "\\uXXXX";
        const output = unescapeUnicode(input);
        expect(output).toBe("\\uXXXX");
    });
});

describe("trueMarkOrUndefined", () => {
    it("should return true for true input", () => {
        expect(
            trueMarkOrUndefined({ type: "text", marks: [{ type: "bold" }], text: "hello" }, "bold"),
        ).toBe(true);
    });

    it("should return undefined for false input", () => {
        expect(
            trueMarkOrUndefined(
                { type: "text", marks: [{ type: "italic" }], text: "hello" },
                "bold",
            ),
        ).toBeUndefined();
    });
});

describe("defaultColorReverseLUT", () => {
    it("should return hex code for known color name", () => {
        expect(defaultColorReverseLUT("red")).toBe("#FF5555");
    });

    it("should return input for unknown color name", () => {
        expect(defaultColorReverseLUT("unknown_color")).toBe("unknown_color");
    });
    it("should return undefined for null or empty input", () => {
        expect(defaultColorReverseLUT("")).toBeUndefined();
        expect(defaultColorReverseLUT("null")).toBeUndefined();
    });
});

describe("defaultColorLUT", () => {
    it("should return color name for known hex code", () => {
        expect(defaultColorLUT("#FF5555")).toBe("red");
    });
    it("should return input for unknown hex code", () => {
        expect(defaultColorLUT("#123456")).toBe("#123456");
    });
    it("should return undefined for null or empty input", () => {
        expect(defaultColorLUT("")).toBeUndefined();
        expect(defaultColorLUT("null")).toBeUndefined();
    });
});

it("findMarkType finds the correct mark", () => {
    const contentWithMarks: JSONContent = {
        type: "text",
        marks: [{ type: "bold" }, { type: "italic" }],
        text: "Sample Text",
    };
    expect(findMarkType(contentWithMarks, "bold")).toBeDefined();
    expect(findMarkType(contentWithMarks, "italic")).toBeDefined();
    expect(findMarkType(contentWithMarks, "underline")).toBeUndefined();
});

it("should convert number to hex byte string", () => {
    expect(mapToHexByte(0)).toBe("00");
    expect(mapToHexByte(1 / 255)).toBe("01");
    expect(mapToHexByte(1 / 16)).toBe("10");
    expect(mapToHexByte(1)).toBe("ff");
    expect(mapToHexByte(1.2)).toBe("00");
});

it("should strip type suffixes from inputs correctly", () => {
    const map = new Map([
        ["1L", "1"],
        ["1l", "1"],
        ["1.0F", "1.0"],
        ["1.0f", "1.0"],
        ["1.0D", "1.0"],
        ["1.0d", "1.0"],
        ["1B", "1"],
        ["1b", "1"],
        ["1S", "1"],
        ["1s", "1"],
        ["1I", "1"],
        ["1i", "1"],
        ["1.0", "1.0"],
        ["1", "1"],
        [
            JSON.stringify("really cool string, give me 1s"),
            JSON.stringify("really cool string, give me 1s"),
        ],
        [JSON.stringify("1l 1f 1.0d 1b 1s 1i"), JSON.stringify("1l 1f 1.0d 1b 1s 1i")],
    ]);
    for (const [input, expected] of map) {
        expect(stripTypeSuffixes(`{test:${input}}`)).toBe(`{test:${expected}}`);
        expect(stripTypeSuffixes(`{test :${input}}`)).toBe(`{test :${expected}}`);
        expect(stripTypeSuffixes(`{test: ${input}}`)).toBe(`{test: ${expected}}`);
        expect(stripTypeSuffixes(`{test    : ${input}}`)).toBe(`{test    : ${expected}}`);
    }
});

it("should convert rgba hex to argb hex", () => {
    expect(rgbaToArgbHex("#FF0000FF")).toBe("#FFFF0000");
    expect(rgbaToArgbHex("#00FF00FF")).toBe("#FF00FF00");
    expect(rgbaToArgbHex("#0000FFFF")).toBe("#FF0000FF");
    expect(rgbaToArgbHex("FFFFFFFF")).toBe("#FFFFFFFF");
    expect(rgbaToArgbHex("00000000")).toBe("#00000000");
});

it("should convert argb hex to rgba hex", () => {
    expect(argbToRgbaHex("#FFFF0000")).toBe("#FF0000FF");
    expect(argbToRgbaHex("#FF00FF00")).toBe("#00FF00FF");
    expect(argbToRgbaHex("FF0000FF")).toBe("#0000FFFF");
    expect(argbToRgbaHex("FFFFFFFF")).toBe("#FFFFFFFF");
    expect(argbToRgbaHex("00000000")).toBe("#00000000");
});

it("should convert rgb to hex (no alpha)", () => {
    expect(rgbToHex("rgb(255, 0, 0)")).toBe("#FF0000");
    expect(rgbToHex("rgb(0, 255, 0)")).toBe("#00FF00");
    expect(rgbToHex("rgb(0, 0, 255)")).toBe("#0000FF");
    expect(rgbToHex("rgb(255, 255, 255)")).toBe("#FFFFFF");
    expect(rgbToHex("rgb(0, 0, 0)")).toBe("#000000");
});
