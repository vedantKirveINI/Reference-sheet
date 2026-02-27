import { expect } from "@playwright/test";

export async function phoneNumberCreateField({ page }) {
	const colBtn = page
		.getByRole("columnheader", { name: "icon Currency" })
		.locator("button");

	await expect(colBtn).toBeVisible();
	await colBtn.click();

	await page.getByLabel("Insert column right").click();

	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "SAVE" }).click();
	await expect(page.getByText("Please enter a field name")).toBeVisible();

	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("Phone Number");

	// await page.getByRole("button", { name: "SAVE" }).click();       // not in new version
	// await expect(page.locator("div").filter({ hasText: "Please select a field type." }).nth(3),
	// ).toBeVisible();

	// await page.getByPlaceholder("Select a field type").click();
	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "Phone Number" }).click();

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-phone-number-6")
		.locator("span");

	await expect(colName).toHaveText("Phone Number");
}
