import { welcomeScreenFormat } from "$lib/globals";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState();

    await page.evaluate((format) => {
        localStorage.setItem('hasSeenWelcome', format); 
    }, welcomeScreenFormat);

    await page.reload();
});

test("home page loads", async ({ page }) => {
    const resp = await page.goto("/");
    expect(resp).toBeDefined();
    expect(resp?.ok()).toBe(true);
});

test("blank text updates with formatted output", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    const output = page.locator("#outputbox").first();
    await expect(output).toHaveText(`"lorem ipsum"`);
});

test("the bold button should work", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    await textbox.selectText();
    const button = page.getByTestId("bold-button");
    await button.click();
    await expect(button).toHaveClass(/bg-zinc-800/);
    await expect(textbox.locator("p>strong")).toHaveCount(1);
    await expect(textbox.locator("p>strong").first()).toHaveCSS("font-family", "MinecraftBold");
});

test("the italic button should work", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    await textbox.selectText();
    const button = page.getByTestId("italic-button");
    await button.click();
    await expect(button).toHaveClass(/bg-zinc-800/);
    await expect(textbox.locator("p>em")).toHaveCount(1);
    await expect(textbox.locator("p>em").first()).toHaveCSS("font-style", "italic");
});

test("the strikethrough button should work", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    await textbox.selectText();
    const button = page.getByTestId("strikethrough-button");
    await button.click();
    await expect(button).toHaveClass(/bg-zinc-800/);
    await expect(textbox.locator("p>s")).toHaveCount(1);
    await expect(textbox.locator("p>s").first()).toHaveCSS("text-decoration-line", "line-through");
});

test("the underline button should work", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    await textbox.selectText();
    const button = page.getByTestId("underline-button");
    await button.click();
    await expect(button).toHaveClass(/bg-zinc-800/);
    await expect(textbox.locator("p>u")).toHaveCount(1);
    await expect(textbox.locator("p>u").first()).toHaveCSS("text-decoration-line", "underline");
});

test("the obfuscation button should work", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    await textbox.selectText();
    const button = page.getByTestId("obfuscation-button");
    await button.click();
    await expect(button).toHaveClass(/bg-zinc-800/);
    await expect(textbox.locator("p>span.obfuscated")).toHaveCount(1);
});

test("the shadow color button should work", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    await textbox.selectText();
    const button = page.getByTestId("shadow-color-button");
    await button.click();
    await page.locator('input[aria-label="hex color"]').waitFor({ timeout: 1000 });
    const colorInput = page.locator('input[aria-label="hex color"]');
    await colorInput.fill("#ff0000");
    await expect(textbox.locator("p>span[data-shadow-color]")).toHaveCount(1);
    await expect(textbox.locator("p>span[data-shadow-color]")).toHaveAttribute(
        "data-shadow-color",
        "#ff0000",
    );
});

test("the shortcut keys should work", async ({ page }) => {
    await page.locator("#wysiwyg-box>[role=textbox]").first().press("ControlOrMeta+Shift+K");
    await page.getByTestId("modal-title-keybinds").waitFor({ timeout: 1000 });
    await expect(page.getByTestId("modal-title-keybinds")).toBeVisible();
});

test("the color buttons should work", async ({ page }) => {
    const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
    await textbox.fill("lorem ipsum");
    await textbox.selectText();
    const colorButtons = await page.locator("#colorBtns>button").all();
    const output = page.locator("#outputbox").first();

    // check colors
    for (const button of colorButtons) {
        await button.click();
        const color = await button.getAttribute("style");
        const colorName = (await button.getAttribute("aria-label"))
            ?.toLowerCase()
            .replace(" ", "_");
        await Promise.all([
            expect(button).toHaveClass(/bg-zinc-800/),
            expect(textbox.locator("p>span[style*='color']")).toHaveCSS(
                "color",
                /rgb\(\d+, \d+, \d+\)/,
            ),
            expect(textbox.locator("p>span[style*='color']")).toHaveAttribute("style", color!),
            expect(output).toContainText(colorName!),
        ]);
    }

    // check unsetting color

    await textbox.selectText();

    // should be visible, being that it should still have color applied from the last button click
    await page.getByTestId("unset-color-button").click();

    await expect(textbox.locator("p>span[style*='color']")).toHaveCount(0);
    await expect(output).not.toContainText("color");
});
