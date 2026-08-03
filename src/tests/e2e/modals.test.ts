import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

test("the font button should work", async ({ page }) => {
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	const button = page.getByLabel("Font", { exact: true });
	await button.click();
	await page.getByTestId("modal-title-set font").waitFor({ timeout: 1000 });
	await expect(page.getByTestId("modal-title-set font")).toBeVisible();
	const fontButton = page.getByTestId("font-button-illageralt");
	await fontButton.click();
	await expect(textbox.locator("p>span")).toHaveCSS(
		"font-family",
		"MinecraftIllager, monospace",
	);
	await textbox.screenshot({ path: "screenshots/font-button-illageralt.png" });
    await expect(page.getByTestId("modal-title-set font")).not.toBeVisible();
});
