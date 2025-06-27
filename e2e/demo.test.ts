import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/")
})

test("home page loads", async ({ page }) => {
	const resp = await page.goto("/")
	expect(resp).toBeDefined()
	expect(resp?.ok()).toBe(true);
});

test("blank text updates with formatted output", async ({ page }) => {
	await page.getByLabel("Keybinds").waitFor()
	const textbox = page.getByRole('textbox').nth(1)
	await textbox.click();
	await textbox.fill("lorem ipsum")
	const output = page.locator("#outputbox").first();
	await expect(output).toHaveText(`"lorem ipsum"`);
})

test("does the bold button work", async ({ page }) => {
	const textbox = page.getByRole('textbox').nth(1)
	await textbox.click();
	await textbox.fill("lorem ipsum")
	await textbox.selectText()
	let button = page.getByRole("button", { name: "Bold " })
	await button.click();
	await expect(await textbox.locator("p>strong").count()).toBeGreaterThan(0)
	await expect(textbox.locator("p>strong").first()).toHaveCSS("font-family", "MinecraftBold")
})

test("does the italic button work", async ({ page }) => {
	const textbox = page.getByRole("textbox").nth(1);
	await textbox.click();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	let button = page.getByRole("button", { name: "Italic " });
	await button.click();
	await expect(await textbox.locator("p>em").count()).toBeGreaterThan(0);
	await expect(textbox.locator("p>em").first()).toHaveCSS(
		"font-style",
		"italic",
	);
})