import { expect } from "@playwright/test";

import scrollRight from "./util/scrollRight";

export async function timeCreateField({ page }) {
	await scrollRight({ page });

	const colBtn = page
		.getByRole("columnheader", { name: "icon Date" })
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
	await page.getByPlaceholder("Enter field name").fill("Time");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "Time" }).click();

	//default value field is removed
	// await expect(page.getByPlaceholder("AM", { exact: true })).toBeVisible();
	// await page.getByPlaceholder("HH:MM").click();
	// await page.getByPlaceholder("HH:MM").fill("12:03");

	await page.getByPlaceholder("Enter description (optional)").click();
	await page
		.getByPlaceholder("Enter description (optional)")
		.fill("time description");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-time-12")
		.locator("span");

	await expect(colName).toHaveText("Time");
}
