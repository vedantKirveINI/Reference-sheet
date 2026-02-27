import { expect } from "@playwright/test";

async function openFilter({ page }) {
	await page
		.locator("div")
		.filter({ hasText: /^Filter$/ })
		.first()
		.click();
}

async function addCondition({ page, buttonName = "Add condition" }) {
	await page.getByRole("button", { name: buttonName, exact: true }).click();
}

async function selectField({ page, fieldName }) {
	await page.getByLabel("Open").first().click();
	await page.getByRole("option", { name: fieldName, exact: true }).click();
}

async function selectCondition({ page, condition }) {
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: condition, exact: true }).click();
}

async function enterFilterValue({ page, value }) {
	await page.getByPlaceholder("Enter Value").click();
	await page.getByPlaceholder("Enter Value").fill("");
	await page.getByPlaceholder("Enter Value").fill(value);
}

async function applyFilter({ page }) {
	await page.getByRole("button", { name: "APPLY FILTER" }).click();
}

async function takeScreenshot({ page, screenshotName }) {
	await expect(page).toHaveScreenshot(screenshotName, {
		fullPage: true,
		maxDiffPixelRatio: 0.03,
	});
}

export {
	openFilter,
	addCondition,
	selectField,
	selectCondition,
	enterFilterValue,
	applyFilter,
	takeScreenshot,
};
