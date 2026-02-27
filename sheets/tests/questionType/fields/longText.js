import { expect } from "@playwright/test";

export async function longTextCreateField({ page }) {
	const colBtn = page
		.getByRole("columnheader", { name: "icon Short Text" })
		.locator("button");

	await expect(colBtn).toBeVisible();

	await colBtn.click();

	await page.getByLabel("Insert column right").click();

	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "SAVE" }).click();

	await expect(page.getByText("Please enter a field name")).toBeVisible();

	await page.getByPlaceholder("Enter field name").fill("Long Text");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "Long Text" }).click();

	// await page.getByPlaceholder("Enter default value (optional)").click();
	// await page
	// 	.getByPlaceholder("Enter default value (optional)")
	// 	.fill("Long Text Default Value");

	await page.getByPlaceholder("Enter description (optional)").click();
	await page
		.getByPlaceholder("Enter description (optional)")
		.fill("Long Text Description");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	await expect(
		page.getByRole("columnheader", { name: "icon Long Text" }),
	).toBeVisible();

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-long-text-2")
		.locator("span");

	await expect(colName).toHaveText("Long Text");
}
