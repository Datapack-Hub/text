import tippy from "tippy.js";

export function tooltip(e: HTMLElement) {
    const tip = tippy(e, {
        placement: "bottom",
        animation: "scale-subtle",
        arrow: true,
        theme: "dph",
        content: e.ariaLabel || e.title || e.textContent || "",
    });

    return () => {
        tip.destroy();
    };
}

export function tooltip_right(e: HTMLElement) {
    const tip = tippy(e, {
        placement: "right",
        animation: "scale-subtle",
        arrow: true,
        theme: "dph",
        content: e.ariaLabel || e.title || e.textContent || "",
    });

    return () => {
        tip.destroy();
    };
}
