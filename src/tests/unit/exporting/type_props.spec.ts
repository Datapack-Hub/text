import { outputVersion } from "$lib/stores";
import { addTypeSpecificValues } from "$lib/text/nbt/export";
import { versions, type MinecraftText } from "$lib/types";
import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";

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

describe("object types", () => {
	it("should add atlas and sprite for type 'atlas_object'", () => {
		outputVersion.set(versions[versions.length - 1]); // Ensure exportVersion is set to a version that supports atlas_object
		const current: MinecraftText = {};
		const c: JSONContent = {
			type: "atlas_object",
			attrs: {
				atlas: "someAtlas",
				sprite: "someSprite",
			},
		};

		const result = addTypeSpecificValues(current, c, false);
		expect(result.atlas).toBe("someAtlas");
		expect(result.sprite).toBe("someSprite");
	});

	it("should add object, player, and hat for type 'player_object'", () => {
		outputVersion.set(versions[versions.length - 1]); // Ensure exportVersion is set to a version that supports player_object
		const current: MinecraftText = {};
		const c: JSONContent = {
			type: "player_object",
			attrs: { player: { name: "Cbble_" }, hat: true },
		};
		const result = addTypeSpecificValues(current, c, false);
		expect(result.object).toBe("player");
		expect(result.player).toEqual({ name: "Cbble_" });
		expect(result.hat).toBe(true);
	});

	it("should be empty if version does not support 'atlas_object'", () => {
		outputVersion.set(versions[0]);
		const current: MinecraftText = {};
		const c: JSONContent = {
			type: "atlas_object",
			attrs: {
				atlas: "someAtlas",
				sprite: "someSprite",
			},
		};

		const result = addTypeSpecificValues(current, c, false);
		expect(result).toEqual({ text: "" });
	});

	it("should be empty if version does not support 'player_object'", () => {
		outputVersion.set(versions[0]);
		const current: MinecraftText = {};
		const c: JSONContent = {
			type: "player_object",
			attrs: { player: { name: "Cbble_" }, hat: true },
		};
		const result = addTypeSpecificValues(current, c, false);
		expect(result).toEqual({ text: "" });
	});
});
