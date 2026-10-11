import { rgbToHex } from "#lib/text/utils.js";
import { TextStyle } from "@tiptap/extension-text-style";

export const FixedTextStyle = TextStyle.extend({
    parseHTML() {
        return [
            {
                style: "color",
                getAttrs: (value) => {
                    const hex = rgbToHex(value as string);
                    return { color: hex };
                },
            },
        ];
    },
});
