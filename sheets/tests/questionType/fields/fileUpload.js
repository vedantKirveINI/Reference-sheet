import { expect } from "@playwright/test";

import scrollRight from "./util/scrollRight";

export async function fileUploadCreateField({ page }) {
	await scrollRight({ page, n: 5 });

	const colBtn = page
		.getByRole("columnheader", { name: "icon Time" })
		.locator("button");

	await expect(colBtn).toBeVisible();
	await colBtn.click();

	await page.getByLabel("Insert column right").click();

	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "SAVE" }).click();

	await expect(page.getByText("Please enter a field name")).toBeVisible();

	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("File Upload");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "File Upload" }).click();

	await page.getByPlaceholder("Enter description (optional)").click();
	await page
		.getByPlaceholder("Enter description (optional)")
		.fill("File Upload: description");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-file-picker-13")
		.locator("span");

	await expect(colName).toHaveText("File Upload");
}
