import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

test("home page loads", async ({ page }) => {
	const resp = await page.goto("/");
	expect(resp).toBeDefined();
	expect(resp?.ok()).toBe(true);
});

test("blank text updates with formatted output", async ({ page }) => {
	await page.getByLabel("Keybinds").waitFor();
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	const output = page.locator("#outputbox").first();
	await expect(output).toHaveText(`"lorem ipsum"`);
});

test("the bold button should work", async ({ page }) => {
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	let button = page.getByRole("button", { name: "Bold " });
	await button.click();
	expect(await textbox.locator("p>strong").count()).toBeGreaterThan(0);
	await expect(textbox.locator("p>strong").first()).toHaveCSS(
		"font-family",
		"MinecraftBold",
	);
});

test("the italic button should work", async ({ page }) => {
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	let button = page.getByRole("button", { name: "Italic " });
	await button.click();
	expect(await textbox.locator("p>em").count()).toBeGreaterThan(0);
	await expect(textbox.locator("p>em").first()).toHaveCSS(
		"font-style",
		"italic",
	);
});

test("the strikethrough button should work", async ({ page }) => {
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	let button = page.getByRole("button", { name: "Strikethrough " });
	await button.click();
	expect(await textbox.locator("p>s").count()).toBeGreaterThan(0);
	await expect(textbox.locator("p>s").first()).toHaveCSS(
		"text-decoration-line",
		"line-through",
	);
});

test("the underline button should work", async ({ page }) => {
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	let button = page.getByRole("button", { name: "Underline " });
	await button.click();
	expect(await textbox.locator("p>u").count()).toBeGreaterThan(0);
	await expect(textbox.locator("p>u").first()).toHaveCSS(
		"text-decoration-line",
		"underline",
	);
});

test("the obfuscation button should work", async ({ page }) => {
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	let button = page.getByRole("button", { name: "Obfuscated " });
	await button.click();
	expect(await textbox.locator("p>span.obfuscated").count()).toBeGreaterThan(0);
});

test("the shadow color button should work", async ({ page }) => {
	const textbox = page.locator("#wysiwyg-box>[role=textbox]").first();
	await textbox.fill("lorem ipsum");
	await textbox.selectText();
	let button = page.getByRole("button", { name: "Shadow Color" });
	await button.click();
	const colorInput = page.locator('input[aria-label="hex color"]');
	await colorInput.fill("#ff0000");
	await colorInput.press("Enter");
	expect(
		await textbox.locator('p>span[style*="text-shadow"]').count(),
	).toBeGreaterThan(0);
	await expect(
		textbox.locator('p>span[style*="text-shadow"]').first(),
	).toHaveAttribute("style", "text-shadow: rgb(255, 0, 0) 2px 2px 0px;");
});
