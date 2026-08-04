import { optimise } from "$lib/text/nbt/optimiser";
import { describe, expect, it } from "vitest";

// Minimal mock types for test compatibility
type StringyMCText = string | { [key: string]: any };

describe("optimise", () => {
    it("returns empty string array if input is empty", () => {
        expect(optimise([])).toEqual([""]);
    });

    it("returns empty string array if input is just an empty string", () => {
        expect(optimise([""])).toEqual([""]);
    });

    it("should combine with leading empty strings", () => {
        expect(optimise(["", { text: "hello " }, { color: "red", text: "world!" }])).toEqual([
            "hello ",
            { color: "red", text: "world!" },
        ]);
    });

    it("should combine whitespace string to next component", () => {
        expect(optimise(["", { text: "hello" }, " ", { color: "red", text: "world!" }])).toEqual([
            "hello ",
            { color: "red", text: "world!" },
        ]);
    });

    it("removes undefined properties and flattens objects with only text", () => {
        const input: StringyMCText[] = [
            { text: "Hello", color: undefined, bold: undefined },
            { text: "World" },
        ];
        expect(optimise(input)).toEqual(["HelloWorld"]);
    });

    it("merges consecutive strings", () => {
        const input: StringyMCText[] = ["Hello ", "World", "!", { text: "Test" }];
        expect(optimise(input)).toEqual(["Hello World!Test"]);
    });

    it("merges whitespace with previous component", () => {
        const input: StringyMCText[] = [{ text: "Test" }, " ", { text: "World" }];
        expect(optimise(input)).toEqual(["Test World"]);
    });

    it("merges whitespace forwards", () => {
        const input: StringyMCText[] = [" ", { text: "World" }];
        expect(optimise(input)).toEqual([" World"]);
    });

    it("merges whitespace backwards", () => {
        const input: StringyMCText[] = [{ text: "Test" }, " "];
        expect(optimise(input)).toEqual(["Test "]);
    });

    it("groups objects with shared style properties", () => {
        const input: StringyMCText[] = [
            { text: "A", color: "red", bold: true },
            { text: "B", color: "red", bold: true },
            { text: "C", color: "blue" },
        ];
        const result = optimise(input);
        expect(result[1]).toMatchObject({
            color: "red",
            bold: true,
            text: "AB",
        });
        expect(result[2]).toMatchObject({ color: "blue", text: "C" });
    });

    it("removes leading empty string if followed by a string", () => {
        const input: StringyMCText[] = ["foo", "bar"];
        expect(optimise(input)).toEqual(["foobar"]);
    });

    it("removes leading empty string if followed by object without style", () => {
        const input: StringyMCText[] = [{ text: "foo" }];
        expect(optimise(input)).toEqual(["foo"]);
    });

    it("handles item lore mode by prepending lore object", () => {
        const input: StringyMCText[] = [{ text: "lore" }];
        expect(optimise(input, true)).toEqual([
            { italic: false, color: "white", text: "" },
            "lore",
        ]);
    });

    it("merges objects with identical interactivity properties", () => {
        const input: StringyMCText[] = [
            { text: "A", click_event: { action: "run_command", command: "/a" } },
            { text: "B", click_event: { action: "run_command", command: "/a" } },
            { text: "C", click_event: { action: "run_command", command: "/b" } },
        ];
        const result = optimise(input);
        expect(result[1]).toMatchObject({
            click_event: { action: "run_command", command: "/a" },
            text: "AB",
        });
        expect(result[2]).toMatchObject({
            click_event: { action: "run_command", command: "/b" },
            text: "C",
        });
    });

    it("does not merge objects with different style/interactivity", () => {
        const input: StringyMCText[] = [
            { text: "A", color: "red" },
            { text: "B", color: "blue" },
        ];
        const result = optimise(input);
        expect(result[1]).toMatchObject({ color: "red", text: "A" });
        expect(result[2]).toMatchObject({ color: "blue", text: "B" });
    });
});
