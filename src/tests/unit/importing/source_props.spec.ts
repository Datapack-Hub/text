import { convertToTextOrEmpty, snbtToDocument } from "$lib/text/nbt/import";
import { expect, it } from "vitest";
import { readTestDataFile } from "../test_utils";

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

it("should properly apply atlas object properties", async () => {
	const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
	const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
	const textNode = document.content![0];
	expect(textNode).toBeDefined();
	expect(textNode.type).toMatch("paragraph");

	const node = textNode.content!;
	const attrs = node[8].attrs!;

	expect(node[8].type).toMatch("atlas_object");
	expect(node[8].attrs).toBeDefined();
	expect(attrs.atlas).toBeDefined();
	expect(attrs.atlas).toMatch("Banana");
	expect(attrs.sprite).toMatch("blah");
});

it("should properly apply player object properties", async () => {
	const sourceSNBT = await readTestDataFile("clean/snbt/source.snbt");
	const document = snbtToDocument(convertToTextOrEmpty(sourceSNBT));
	const textNode = document.content![0];
	expect(textNode).toBeDefined();
	expect(textNode.type).toMatch("paragraph");

	const node = textNode.content!;
	const attrs = node[9].attrs!;

	expect(node[9].type).toMatch("player_object");
	expect(node[9].attrs).toBeDefined();
	expect(attrs.player).toBeDefined();
	expect(attrs.player.name).toBeDefined();
	expect(attrs.player.name).toMatch("Cbble_");
	expect(attrs.hat).toEqual(true);
});
