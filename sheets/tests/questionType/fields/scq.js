import { expect } from "@playwright/test";

export async function scqCreateField({ page }) {
	const colBtn = page
		.getByRole("columnheader", { name: "icon yes no" })
		.locator("button");
	//const colBtn = page.locator(".changeType").nth(2);

	await expect(colBtn).toBeVisible();
	await colBtn.click();

	await page.getByLabel("Insert column right").click();
	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "SAVE" }).click();

	await expect(page.getByText("Please enter a field name")).toBeVisible();

	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("SCQ");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "Single Choice Question" }).click();

	await page.getByPlaceholder("Enter option").fill("scq: opt 1");
	await page.getByRole("button", { name: "Add Choice" }).click();

	await page.getByPlaceholder("Enter option").nth(1).fill("scq: opt 2");
	await page.getByRole("button", { name: "Add Choice" }).click();

	await page.getByPlaceholder("Enter option").nth(2).fill("scq: opt 3");

	// await page.getByPlaceholder("Select default value (optional)").click();
	// await page.getByRole("option", { name: "scq: opt 2" }).click();
	// await expect(page.getByPlaceholder("Select default value (optional)")).toHaveValue(
	// 	"scq: opt 2",
	// );

	await page.getByPlaceholder("Enter description (optional)").click();
	await page
		.getByPlaceholder("Enter description (optional)")
		.fill("SCQ description");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-scq-8")
		.locator("span");

	await expect(colName).toHaveText("SCQ");
}
