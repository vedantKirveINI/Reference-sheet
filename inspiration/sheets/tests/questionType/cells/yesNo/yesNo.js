import { expect } from "@playwright/test";

export const verifyYesNoOptionsVisibility = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell28 = await getCell(2, 8);
	const cell38 = await getCell(3, 8);

	await cell28.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell28.dblclick();

	await expect(page.getByRole("combobox").last()).toBeVisible();
	await page.getByRole("combobox").last().click();

	// await expect(page.getByPlaceholder("Select option")).toBeVisible();
	// await page.getByPlaceholder("Select option").click();

	await expect(page.getByTestId("ods-autocomplete-listbox")).toBeVisible();

	await expect(page.getByRole("option", { name: "Yes" })).toBeVisible();

	await expect(page.getByRole("option", { name: "No" })).toBeVisible();

	await expect(page.getByRole("option", { name: "Other" })).not.toBeVisible();

	// await page.getByPlaceholder("Select option").click();
	await page.getByRole("combobox").last().click();

	await cell38.click();
};

export const verifyYesNoOtherOptionsVisibility = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell29 = await getCell(2, 9);
	const cell39 = await getCell(3, 9);
	await page.waitForTimeout(800);

	await cell29.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell29.dblclick();

	// await expect(page.getByPlaceholder("Select option")).toBeVisible();
	// await page.getByPlaceholder("Select option").click();

	await expect(page.getByRole("combobox")).toBeVisible();
	await page.getByRole("combobox").click();

	await expect(page.getByTestId("ods-autocomplete-listbox")).toBeVisible();

	await expect(page.getByRole("option", { name: "Yes" })).toBeVisible();

	await expect(page.getByRole("option", { name: "No" })).toBeVisible();

	await expect(page.getByRole("option", { name: "Other" })).toBeVisible();

	// await page.getByPlaceholder("Select option").click();
	await page.getByRole("combobox").click();

	await cell39.click();
};

export const verifyYesNoOptionSelection = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell28 = await getCell(2, 8);
	const cell38 = await getCell(3, 8);

	await cell28.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell28.dblclick();

	// await expect(page.getByPlaceholder("Select option")).toBeVisible();
	// await page.getByPlaceholder("Select option").click();

	await expect(page.getByRole("combobox").last()).toBeVisible();
	await page.getByRole("combobox").last().click();

	await expect(page.getByTestId("ods-autocomplete-listbox")).toBeVisible();

	await expect(page.getByRole("option", { name: "Yes" })).toBeVisible();
	await page.getByRole("option", { name: "Yes" }).click();

	await expect(page.getByTestId("ods-chip").getByText("Yes")).toBeVisible();

	await cell38.click();
	let cellValue = await cell28.textContent();

	expect(cellValue).toBe("Yes");

	await page.waitForTimeout(800);
	await cell28.dblclick();

	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "No" }).click();
	await expect(page.getByTestId("ods-chip").getByText("No")).toBeVisible();

	await cell38.click();

	cellValue = await cell28.textContent();

	expect(cellValue).toBe("No");
};

export const verifyYesNoOtherOptionSelection = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell29 = await getCell(2, 9);
	const cell39 = await getCell(3, 9);

	await cell29.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell29.dblclick();

	// await expect(page.getByPlaceholder("Select option")).toBeVisible();
	// await page.getByPlaceholder("Select option").click();

	await expect(page.getByRole("combobox").last()).toBeVisible();
	await page.getByRole("combobox").last().click();

	await expect(page.getByTestId("ods-autocomplete-listbox")).toBeVisible();

	await expect(page.getByRole("option", { name: "Yes" })).toBeVisible();
	await page.getByRole("option", { name: "Yes" }).click();

	await expect(page.getByTestId("ods-chip").getByText("Yes")).toBeVisible();

	await cell39.click();

	let cellValue = await cell29.textContent();

	expect(cellValue).toBe("Yes");

	await page.waitForTimeout(800);
	await cell29.dblclick();

	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "No" }).click();
	await expect(page.getByTestId("ods-chip").getByText("No")).toBeVisible();

	await cell39.click();

	cellValue = await cell29.textContent();

	expect(cellValue).toBe("No");

	// await page.waitForTimeout(800);
	// await cell29.dblclick();

	// await page.getByLabel("Open").click();
	// await page.getByRole("option", { name: "Other" }).click();
	// await expect(page.getByTestId("ods-chip").getByText("Other")).toBeVisible();

	// await cell39.click();

	// cellValue = await cell29.textContent();

	// expect(cellValue).toBe("Other");
};

export const verifyNoMultiSelectOnSameOption = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell28 = await getCell(2, 8);
	const cell38 = await getCell(3, 8);

	await cell28.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell28.dblclick();

	// await expect(page.getByPlaceholder("Select option")).toBeVisible();
	// await page.getByPlaceholder("Select option").click();

	await expect(page.getByRole("combobox").last()).toBeVisible();
	await page.getByRole("combobox").last().click();

	await page.getByRole("option", { name: "Yes" }).click();
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Yes" }).click();
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Yes" }).click();
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Yes" }).click();
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Yes" }).click();

	await expect(page.getByTestId("ods-chip").getByText("Yes")).toBeVisible();

	await cell38.click();
	let cellValue = await cell28.textContent();
	expect(cellValue).toBe("Yes");
};

export const verifyNoMultiSelectOnDifferentOptions = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell29 = await getCell(2, 9);
	const cell39 = await getCell(3, 9);

	await cell29.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800);

	await cell29.dblclick();

	// await expect(page.getByPlaceholder("Select option")).toBeVisible();
	// await page.getByPlaceholder("Select option").click();

	await expect(page.getByRole("combobox").last()).toBeVisible();
	await page.getByRole("combobox").last().click();

	await page.getByRole("option", { name: "Yes" }).click();
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "No" }).click();
	// await page.getByLabel("Open").click();
	// await page.getByRole("option", { name: "Other" }).click();
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Yes" }).click();
	// await page.getByLabel("Open").click();
	// await page.getByRole("option", { name: "Other" }).click();

	await expect(page.getByTestId("ods-chip").getByText("Yes")).toBeVisible();

	await cell39.click();
	let cellValue = await cell29.textContent();
	expect(cellValue).toBe("Yes");
};
