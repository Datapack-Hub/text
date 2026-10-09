
export const fontIds = [
    "minecraft:default",
    "minecraft:illageralt",
    "minecraft:alt"
] as const

export type FontId = typeof fontIds[number];

export const fontNames = [
    "Minecraft",
    "MinecraftIllager",
    "MinecraftEnchanting",

    "MinecraftBold",
    "MinecraftIllagerBold",
    "MinecraftEnchantingBold",
] as const;

export type FontName = typeof fontNames[number];

/**
 *  Converts a font id to it's css font name.
 * 
 * @param id minecraft font id
 * @param isBold 
 * @returns css font name
 */
export function convertFont(id: FontId, isBold: boolean): FontName | undefined {
    return  fontNames[fontIds.indexOf(id) + (isBold ? fontNames.length / 2 : 0)]
}