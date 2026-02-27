import { expect } from "@playwright/test";

import scrollRight from "./util/scrollRight";

export async function dateCreateField({ page }) {
	await scrollRight({ page });

	const colBtn = page
		.getByRole("columnheader", { name: "icon dropdown" })
		.locator("button");

	await expect(colBtn).toBeVisible();
	await colBtn.click();

	await page.getByLabel("Insert column right").click();
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "SAVE" }).click();

	// await expect(
	// 	page
	// 		.locator("div")
	// 		.filter({ hasText: "Please enter a field name." })
	// 		.nth(3),
	// ).toBeVisible();

	await expect(page.getByText("Please enter a field name")).toBeVisible();
	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("Date");

	// await page.getByRole("button", { name: "SAVE" }).click();
	// await expect(
	// 	page
	// 		.locator("div")
	// 		.filter({ hasText: "Please select a field type." })
	// 		.nth(3),
	// ).toBeVisible();

	// await page.getByPlaceholder("Select a field type").click();

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "Date" }).click();

	await page.getByPlaceholder("Select date format").click();
	await page.getByRole("option", { name: "MMDDYYYY" }).click();
	await page.getByPlaceholder("Enter description (optional)").click();
	await page
		.getByPlaceholder("Enter description (optional)")
		.fill("date description");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-date-11")
		.locator("span");

	await expect(colName).toHaveText("Date");
}
