import { expect } from "@playwright/test";

export async function yesNoCreateField({ page }) {
	const colBtn = page
		.getByRole("columnheader", { name: "icon Phone Number" })
		.locator("button");

	await expect(colBtn).toBeVisible();

	await colBtn.click();

	await page.getByLabel("Insert column right").click();

	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "SAVE" }).click();

	await expect(page.getByText("Please enter a field name")).toBeVisible();

	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("yes no");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "Yes/No" }).click();

	// await page.getByRole("checkbox").check();
	// await page.getByPlaceholder("Select default value (").click();
	// await page.getByRole("option", { name: "Other" }).click();

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-yes-no-7")
		.locator("span");

	await expect(colName).toHaveText("yes no");
}
