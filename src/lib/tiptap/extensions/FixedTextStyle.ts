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

// Helper function to convert rgb() to hex
function rgbToHex(rgb: string): string {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/u.exec(rgb);
    return result
        ? "#" +
              [1, 2, 3]
                  .map((n) => parseInt(result[n]).toString(16).padStart(2, "0"))
                  .join("")
                  .toUpperCase()
        : rgb;
}
