import { expect } from "@playwright/test";

import scrollRight from "./util/scrollRight";

export async function dropdownCreateField({ page }) {
	await scrollRight({ page });

	const colBtn = page
		.getByRole("columnheader", { name: "icon MCQ" })
		.locator("button");

	await expect(colBtn).toBeVisible();
	await colBtn.click();

	await page.getByLabel("Insert column right").click();
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "SAVE" }).click();

	await expect(page.getByText("Please enter a field name")).toBeVisible();
	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("dropdown");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page.getByRole("option", { name: "Dropdown" }).click();

	await page.getByPlaceholder("Enter option").click();
	await page.getByPlaceholder("Enter option").fill("dd: opt 1");
	await page.getByRole("button", { name: "Add Choice" }).click();
	await page.getByPlaceholder("Enter option").nth(1).click();
	await page.getByPlaceholder("Enter option").nth(1).fill("dd: opt 2");
	await page.getByRole("button", { name: "Add Choice" }).click();
	await page.getByPlaceholder("Enter option").nth(2).click();
	await page.getByPlaceholder("Enter option").nth(2).fill("dd: opt 3");

	// await page.getByPlaceholder("Select default value (").click();
	// await page.getByRole("option", { name: "dd: opt 1" }).click();
	// await page.getByPlaceholder("Select default value (").click();
	// await page.getByRole("option", { name: "dd: opt 3" }).click();

	await page.getByPlaceholder("Enter description (optional)").click();
	await page
		.getByPlaceholder("Enter description (optional)")
		.fill("dd description");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-drop-down-static-10")
		.locator("span");

	await expect(colName).toHaveText("dropdown");
}
