import type { MinecraftText, StringyMCText, TranslateOptions } from "$lib/types";
import type { JSONContent } from "@tiptap/core";
import { defaultCodeBedrockLUT, trueMarkOrUndefined } from "./general";
import { addTypeSpecificValues, optimise } from "./nbt_or_json";

/**
 * Converts the JSON content of the editor to a Minecraft JSON string.
 */
export function translateBedrockJSON(
    json: JSONContent,
    options: TranslateOptions,
): string {
    const paragraphs = json.content ?? [];

    if (options.exportType === "standard") {
        let data: StringyMCText[] = [];

        for (const [i, p] of paragraphs.entries()) {
            const content = p.content ?? [];
            for (const c of content) {
                let current: MinecraftText = {
                    bold: trueMarkOrUndefined(c, "bold"),
                    italic: trueMarkOrUndefined(c, "italic"),
                    obfuscated: trueMarkOrUndefined(c, "obfuscated"),
                    font: c.marks?.at(0)?.attrs?.font || undefined,
                };

                const shadowColorMark = c.marks?.find((m) => m.type === "shadowColor");
                if (shadowColorMark) {
                    current.shadow_color = parseInt(
                        shadowColorMark.attrs?.shadowColor.replace(/^#/, ""),
                        16,
                    );
                }

                current = addTypeSpecificValues(
                    current,
                    c,
                    true,
                    options.exportVersion,
                );

                if (current.text) {
                    current.text = "\u00a7" + defaultCodeBedrockLUT(c.marks?.at(0)?.attrs?.color) + current.text; 
                }

                data.push(current);
            }
            if (i < paragraphs.length - 1) data.push("\n");
        }

        if (data.length === 0) {
            return Math.random() < 0.002
                ? "🤓 <- james is waiting for you to type something"
                : "waiting for input...";
        }

        return options.indent
            ? JSON.stringify({rawtext: data}, null, options.indentSize)
            : JSON.stringify({rawtext: data});
    } else if (options.exportType === "item_lore") {
        // TODO finish conversion for lore

        let data: (StringyMCText[] | StringyMCText)[] = [];

        for (const p of paragraphs) {
            const content = p.content ?? [];
            let currentLine: StringyMCText[] = [];

            for (const [_, c] of content.entries()) {
                let currentComponent: MinecraftText = {
                    color: defaultCodeBedrockLUT(c.marks?.at(0)?.attrs?.color),
                    bold: trueMarkOrUndefined(c, "bold"),
                    italic: trueMarkOrUndefined(c, "italic"),
                    obfuscated: trueMarkOrUndefined(c, "obfuscated"),
                    font: c.marks?.at(0)?.attrs?.font || undefined,
                };

                currentComponent = addTypeSpecificValues(
                    currentComponent,
                    c,
                    false,
                    options.exportVersion,
                );
                currentLine.push(currentComponent);
            }

            data.push(currentLine);
        }

        if (Array.isArray(data) && options.optimise) {
            data = data.map((d) => (Array.isArray(d) ? optimise(d, true) : d));
        }

        return options.indent
            ? JSON.stringify(data, null, options.indentSize)
            : JSON.stringify(data);
    }

    return "[]";
}