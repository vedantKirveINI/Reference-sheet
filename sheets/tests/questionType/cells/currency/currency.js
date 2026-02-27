import { expect } from "@playwright/test";

async function currencyWithValidInput({ page }) {
	await page.waitForTimeout(800);

	await page.locator("td").first().dblclick();

	await page
		.getByTestId("currency-editor")
		.getByPlaceholder("299")
		.fill("123456789");

	await page.getByTestId("country-input").click();

	await page.getByPlaceholder("Search by country or currency").click();
	await page.getByPlaceholder("Search by country or currency").fill("aus");

	await page.getByText("(AUD)Australia$").click();

	await page.keyboard.press("Enter");

	// Target the image inside the grid cell
	const flagImage = await page
		.getByRole("gridcell", { name: "flag AUD $" })
		.getByTestId("flag-img");

	// Scroll the image into view if needed
	await flagImage.scrollIntoViewIfNeeded();

	// Ensure the image has loaded by checking that its `naturalWidth` is not 0
	await expect(flagImage).not.toHaveJSProperty("naturalWidth", 0);

	await expect(
		await page.getByRole("gridcell", { name: "flag AUD $" }),
	).toHaveScreenshot("currency-cell-display.png", {
		maxDiffPixelRatio: 0.05,
	});
}

async function currencyWithOnlyFlagSelected({ page }) {
	await page.waitForTimeout(800);

	await page.locator(".ht__row_even > td").first().dblclick();

	await page.getByTestId("country-input").click();

	await page.getByText("(EUR)Germany€").click();

	await page.locator("tr:nth-child(4) > td").first().click();

	await expect(page.locator(".ht__row_even > td").first()).toHaveText("");
}

async function handleCurrencyCellClearOnOuterClick({ page }) {
	await page.waitForTimeout(800);

	await page.locator("tr:nth-child(3) > td").first().dblclick();

	await page
		.getByTestId("currency-editor")
		.getByPlaceholder("299")
		.fill("8888888");

	await page.keyboard.press("Enter");

	await page.waitForTimeout(800);

	await page.getByRole("gridcell", { name: "flag INR ₹" }).dblclick();

	await page.getByTestId("currency-editor").getByPlaceholder("299").fill("");

	await page.locator("tr:nth-child(2) > td").first().click();

	await expect(
		await page.getByRole("gridcell", { name: "flag INR ₹" }),
	).not.toBeVisible();
}

async function clearCellToAchieveBaseCaseSetup({ page }) {
	await page.locator("td").first().click();
	await page.keyboard.press("Backspace");

	await page.locator("tr:nth-child(2) > td").first().click();
	await page.keyboard.press("Backspace");
}

export {
	currencyWithValidInput,
	currencyWithOnlyFlagSelected,
	handleCurrencyCellClearOnOuterClick,
	clearCellToAchieveBaseCaseSetup,
};
