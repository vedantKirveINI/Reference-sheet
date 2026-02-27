import { expect } from "@playwright/test";

export const ddAddOptions = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell23 = await getCell(2, 3);
	const cell43 = await getCell(4, 3);

	await cell23.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell23.dblclick();
	// await page.waitForTimeout(800);

	await expect(page.getByLabel("Open").nth(1)).toBeVisible();
	await page.getByLabel("Open").nth(1).click();

	await expect(page.getByTestId("ods-autocomplete-listbox")).toBeVisible();

	// await page.waitForTimeout(500); // Adjust if necessary

	await page.getByRole("option", { name: "dd: opt 1" }).click();
	await expect(page.getByTestId("ods-chip")).toBeVisible();

	await cell43.click();
	await page.waitForTimeout(800); // Adjust if necessary

	await cell23.dblclick();

	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "dd: opt 3" }).click();
	await page.keyboard.press("Enter");
	await expect(page.getByText("dd: opt 3")).toBeVisible();
};

export const ddRemoveOptions = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell23 = await getCell(2, 3);
	const cell43 = await getCell(4, 3);

	const dropdownRenderer = await cell23.getByTestId("dropdown-renderer");
	await expect(dropdownRenderer.getByText("dd: opt 1")).toBeVisible();
	await expect(dropdownRenderer.getByText("dd: opt 3")).toBeVisible();

	await page.waitForTimeout(800);

	await cell23.dblclick();

	await expect(page.getByRole("button", { name: "dd: opt 1" })).toBeVisible();

	await page
		.getByRole("button", { name: "dd: opt 1" })
		.getByTestId("ods-icon")
		.click();

	await page.waitForTimeout(200);

	await cell43.click();

	await expect(dropdownRenderer.getByText("dd: opt 3").first()).toBeVisible();
	await expect(dropdownRenderer.getByText("dd: opt 1")).not.toBeVisible();

	await page.waitForTimeout(1000);

	await cell23.dblclick();

	await page.getByLabel("Open").nth(1).click();

	const checkbox3 = page
		.getByRole("option", { name: "dd: opt 3" })
		.getByRole("checkbox");

	await expect(checkbox3).toBeChecked();

	await checkbox3.click();

	await expect(page.getByPlaceholder("Select Option")).toBeVisible();

	await page.locator("tr:nth-child(3) > td:nth-child(3)").click();

	expect(await cell23.innerText()).toBe("");
	await page.waitForTimeout(1000);
};

export const ddNoDuplicateValuesOnSameSelection = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};
	const cell23 = await getCell(2, 3);

	await cell23.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell23.dblclick();
	await page.getByPlaceholder("Select Option").click();
	await expect(page.getByTestId("ods-autocomplete-listbox")).toBeVisible();

	// await page.waitForTimeout(1000); // Adjust if necessary

	await page.getByRole("option", { name: "dd: opt 1" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "dd: opt 2" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "dd: opt 2" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "dd: opt 2" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "dd: opt 4" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "dd: opt 4" }).click();

	await page.locator("tr:nth-child(3) > td:nth-child(3)").click();

	const updatedValue = await cell23.innerText();

	// Split the cell value into an array of options
	const selectedOptions = updatedValue
		.split("\n")
		.map((option) => option.trim());

	expect(
		selectedOptions.filter((option) => option === "dd: opt 2").length,
	).toBe(1);
	expect(
		selectedOptions.filter((option) => option === "dd: opt 4").length,
	).toBe(0);

	// Verify the total number of selected options is 2
	expect(selectedOptions.length).toBe(2);
};
