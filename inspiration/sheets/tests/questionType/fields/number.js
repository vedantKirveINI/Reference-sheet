import { expect } from "@playwright/test";

export async function numberCreateField({ page }) {
	const colBtn = page
		.getByRole("columnheader", { name: "icon Long Text" })
		.locator("button");

	await expect(colBtn).toBeVisible();

	await colBtn.click();

	await page.getByLabel("Insert column right").click();

	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "SAVE" }).click();

	await expect(page.getByText("Please enter a field name")).toBeVisible();

	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("Number");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();

	await page.getByRole("option", { name: "Number", exact: true }).click();

	//await page.getByTestId("oute-ds-tab-1").click();

	//await page.getByPlaceholder("Enter default value (optional)").click();

	// await page
	// 	.getByPlaceholder("Enter default value (optional)")
	// 	.fill("Number Default Value");

	//await page.getByRole("button", { name: "SAVE" }).click();

	//await expect(page.getByText("Only numeric values are allowed")).toBeVisible();

	// await page.getByPlaceholder("Enter default value (optional)").click();
	// await page.getByPlaceholder("Enter default value (optional)").fill("24");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-number-3")
		.locator("span");

	await expect(colName).toHaveText("Number");
}
