import { expect } from "@playwright/test";

import scrollRight from "./util/scrollRight";

export async function mcqCreateField({ page }) {
	await scrollRight({ page });

	const colBtn = page
		.getByRole("columnheader", { name: "icon SCQ" })
		.locator("button");

	await expect(colBtn).toBeVisible();

	await colBtn.click();

	await expect(page.getByRole("table")).toBeVisible();

	await page.getByLabel("Insert column right").click();
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "SAVE" }).click();

	await expect(page.getByText("Please enter a field name")).toBeVisible();
	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("MCQ");

	await page.getByTestId("ods-autocomplete").locator("input").nth(1).click();
	await page
		.getByRole("option", { name: "Multiple Choice Question" })
		.click();

	await page.getByPlaceholder("Enter option").click();
	await page.getByPlaceholder("Enter option").fill("MCQ: opt 1");
	await page.getByRole("button", { name: "Add Choice" }).click();
	await page.getByPlaceholder("Enter option").nth(1).click();
	await page.getByPlaceholder("Enter option").nth(1).fill("MCQ: opt 2");
	await page.getByRole("button", { name: "Add Choice" }).click();
	await page.getByPlaceholder("Enter option").nth(2).click();
	await page.getByPlaceholder("Enter option").nth(2).fill("MCQ: opt 3");

	//defalut field is not there in UI
	// await page.getByPlaceholder("Select default value (optional)").nth(1).click();
	// await page.getByRole("option", { name: "MCQ: opt 1" }).click();
	// await page.getByPlaceholder("Select default value (optional)").nth(1).click();
	// await page.getByRole("option", { name: "MCQ: opt 3" }).click();

	await page.getByPlaceholder("Enter description (optional)").click();
	await page
		.getByPlaceholder("Enter description (optional)")
		.fill("MCQ: description");

	await page.getByRole("button", { name: "SAVE" }).click();

	const response = await page.waitForResponse((resp) => {
		return resp.url().includes("/field/create_field");
	});

	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);

	const colName = page
		.locator(".ht_clone_top")
		.getByTestId("column-mcq-9")
		.locator("span");

	await expect(colName).toHaveText("MCQ");
}
