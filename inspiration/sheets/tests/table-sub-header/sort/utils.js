import { expect } from "@playwright/test";

async function openSort({ page }) {
	await page.getByTestId("sort-option").click();
}

async function selectFieldToSort({ page, fieldName }) {
	await page.getByLabel("Open").first().click();
	await page.getByRole("option", { name: fieldName }).click();
}

// Helper function to select sorting order
async function selectOrderOfSort({ page, orderName }) {
	await page.getByLabel("Open").nth(1).click();
	await page
		.getByRole("option", { name: orderName, exact: true })
		.first()
		.click();
}

// Helper function to apply sort and take a screenshot
async function applySortAndTakeScreenshot({
	page,
	screenshotName,
	maxDiffPixelRatio = 0.03,
}) {
	await page.getByRole("button", { name: "SORT", exact: true }).click();
	await expect(page).toHaveScreenshot(screenshotName, {
		fullPage: true,
		maxDiffPixelRatio: maxDiffPixelRatio,
	});
}

async function clearSort({ page }) {
	await page
		.locator("div")
		.filter({ hasText: /^Sort$/ })
		.first()
		.click();

	await page.locator("form svg").nth(2).click();
	await page.locator("form svg").nth(2).click();

	await page.getByRole("button", { name: "SORT", exact: true }).click();

	await expect(page).toHaveScreenshot("remove-sort.png", {
		fullPage: true,
		maxDiffPixelRatio: 0.03,
	});
}

export {
	openSort,
	selectFieldToSort,
	selectOrderOfSort,
	applySortAndTakeScreenshot,
	clearSort,
};
