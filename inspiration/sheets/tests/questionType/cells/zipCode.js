import { expect } from "@playwright/test";

async function zipCodeWithValidInputSaveOnEnterClick({ page }) {
	await page.locator("td:nth-child(12)").first().scrollIntoViewIfNeeded();

	await page.waitForTimeout(800);
	await page.locator("td:nth-child(12)").first().dblclick();

	// Fill the zip code field
	await page
		.getByTestId("zip-code-editor")
		.getByRole("textbox")
		.fill("999-456");

	// Select a country from the dropdown
	await page.getByTestId("country-input").click();
	await page.getByPlaceholder("Search Country").click();
	await page.getByPlaceholder("Search Country").fill("united");
	await page.getByText("United Kingdom").click();

	// Press Enter to save the changes
	await page.keyboard.press("Enter");

	await page.waitForTimeout(800);

	// Ensure the cell displays correctly and compare the screenshot
	await expect(
		page.getByRole("gridcell", { name: "icon 999-" }),
	).toHaveScreenshot("zip-code-cell-display.png", {
		maxDiffPixelRatio: 0.05, // Allow up to 5% pixel difference
	});
}

async function zipCodeWithValidInputSaveOnOuterClick({ page }) {
	await page
		.locator("tr:nth-child(2) > td:nth-child(12)")
		.scrollIntoViewIfNeeded();

	await page.waitForTimeout(800);
	await page.locator("tr:nth-child(2) > td:nth-child(12)").dblclick();

	await page
		.getByTestId("zip-code-editor")
		.getByRole("textbox")
		.fill("400-028");

	await page.locator("tr:nth-child(3) > td:nth-child(12)").click();

	await expect(
		page.locator("tr:nth-child(2) > td:nth-child(12)"),
	).toHaveScreenshot("zip-code-cell-display-2.png", {
		maxDiffPixelRatio: 0.05,
	});
}

async function zipCodeInputClearedWithoutFlagSelection({ page }) {
	await page.waitForTimeout(800);

	// Double-click to activate the zip code editor
	await page.locator("tr:nth-child(2) > td:nth-child(12)").dblclick();

	// Clear the zip code input
	await page.getByTestId("zip-code-editor").getByRole("textbox").fill("");

	// Click elsewhere to trigger the save or focus-out event
	await page.locator("tr:nth-child(3) > td:nth-child(12)").click();

	await expect(
		page.getByRole("gridcell", { name: "icon 400-" }),
	).not.toBeVisible();
}

async function zipCodeWithInvalidInput({ page }) {
	await page.waitForTimeout(800);
	await page.getByRole("gridcell", { name: "icon 999-" }).dblclick();

	await page.getByTestId("zip-code-editor").getByRole("textbox").fill("");

	await page.locator("tr:nth-child(2) > td:nth-child(12)").click();

	await expect(
		page.getByRole("gridcell", { name: "icon 999-" }),
	).not.toBeVisible();
}

export {
	zipCodeWithValidInputSaveOnEnterClick,
	zipCodeWithValidInputSaveOnOuterClick,
	zipCodeInputClearedWithoutFlagSelection,
	zipCodeWithInvalidInput,
};
