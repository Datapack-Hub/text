import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { appSettings } from "$lib/settings";
import { get } from "svelte/store";

// Define the shape of configuration options for type safety
export interface ExportButtonOptions {
    onClick: () => void;
}

export const ExportButtonExtension = Extension.create<ExportButtonOptions>({
    name: "ExportButton",

    addOptions() {
        return {
            onClick: () => {},
        };
    },

    addProseMirrorPlugins() {
        const { onClick } = this.options;
        let buttonDom: HTMLButtonElement | null = null;

        return [
            new Plugin({
                key: new PluginKey("ExportButton"),
                view(editorView: EditorView) {
                    return {
                        update(view: EditorView) {
                            if (get(appSettings).hideSelectionExport == true) {
                                return;
                            }

                            const { state } = view;
                            const { selection } = state;

                            const parentNode = view.dom.parentNode as HTMLElement | null;
                            if (!parentNode) return;

                            if ((selection.empty || !view.hasFocus()) && buttonDom) {
                                buttonDom.style.display = "none";
                                return;
                            }

                            if (!buttonDom) {
                                buttonDom = document.createElement("button");
                                buttonDom.innerText = "↪ Export this";
                                buttonDom.className = "export-button";
                                buttonDom.style.position = "absolute";
                                buttonDom.style.zIndex = "10";

                                buttonDom.addEventListener("mousedown", (e: MouseEvent) =>
                                    e.preventDefault(),
                                );
                                buttonDom.addEventListener("click", onClick);

                                parentNode.appendChild(buttonDom);
                            }

                            const coords = view.coordsAtPos(selection.to);
                            const top = coords.top + 19;
                            const left = coords.left - 90;

                            buttonDom.style.display = "block";
                            buttonDom.style.top = `${top}px`;
                            buttonDom.style.left = `${left + 5}px`;
                        },

                        destroy() {
                            if (buttonDom) {
                                buttonDom.remove();
                                buttonDom = null;
                            }
                        },
                    };
                },
            }),
        ];
    },
});
