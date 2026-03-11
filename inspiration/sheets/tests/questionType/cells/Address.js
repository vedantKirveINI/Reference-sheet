import { expect } from "@playwright/test";

export async function cancellingEditFields({ page }) {
	// await page.waitForTimeout(2000); // Optional, depending on your application's behavior

	// Open the row for editing
	await page
		.getByRole("gridcell", { name: "B-201,Divay Deep, Vazira Raka" })
		.dblclick();

	// Clear the input fields
	await page.locator('input[name="addressLineOne"]').fill("");
	await page.locator('input[name="addressLineTwo"]').fill("");
	await page.getByRole("spinbutton").fill("");
	await page.locator('input[name="city"]').fill("");
	await page.locator('input[name="state"]').fill("");
	await page.locator('input[name="country"]').fill("");

	// Cancel the action
	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();

	// Verify the original data is retained
	const cellValue = await page
		.getByText("B-201,Divay Deep, Vazira Raka")
		.textContent();

	expect(cellValue).toBe(
		"B-201,Divay Deep, Vazira Raka, 400095, Mmbai, Maharashtraa, India",
	);
}

export async function clearAll({ page }) {
	await page
		.getByRole("gridcell", { name: "B-201,Divay Deep, Vazira Raka" })
		.dblclick();

	await page.getByRole("button", { name: "CLEAR ALL" }).click();

	// Testing that the input fields are empty
	const addressLineOne = await page
		.locator('input[name="addressLineOne"]')
		.inputValue();
	const addressLineTwo = await page
		.locator('input[name="addressLineTwo"]')
		.inputValue();
	const spinButtonValue = await page.getByRole("spinbutton").inputValue();
	const cityValue = await page.locator('input[name="city"]').inputValue();
	const stateValue = await page.locator('input[name="state"]').inputValue();
	const countryValue = await page
		.locator('input[name="country"]')
		.inputValue();

	// Validate each field is empty
	expect(addressLineOne).toBe("");
	expect(addressLineTwo).toBe("");
	expect(spinButtonValue).toBe(""); // Adjust based on how the spinbutton value is displayed
	expect(cityValue).toBe("");
	expect(stateValue).toBe("");
	expect(countryValue).toBe("");

	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();
}

export async function savingEmptyValue({ page }) {
	// Open the row for editing
	await page.getByText("B-201,Divay Deep, Vazira Raka").dblclick();

	// Clear the input fields
	await page.locator('input[name="addressLineOne"]').fill("");
	await page.locator('input[name="addressLineTwo"]').fill("");
	await page.getByRole("spinbutton").fill("");
	await page.locator('input[name="city"]').fill("");
	await page.locator('input[name="state"]').fill("");
	await page.locator('input[name="country"]').fill("");

	// Click the SAVE button to apply changes
	await page.getByRole("button", { name: "SAVE" }).click();

	// Wait for a moment to ensure the UI updates
	await page.waitForTimeout(1000); // Optional, depending on your application's behavior

	// Assert that the value in the grid cell is now empty
	const cellValue = await page
		.locator("td:nth-child(7)")
		.first()
		.textContent();
	expect(cellValue).toBe(""); // Adjust if the cell shows a different representation for empty
}

export async function editingOfCellOfAddressType({ page }) {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell = await getCell(2, 7);

	await cell.dblclick();

	await page.locator('input[name="addressLineOne"]').fill("B-201,Divay Deep");
	await page.locator('input[name="addressLineTwo"]').fill("Vazira Raka");
	await page.getByRole("spinbutton").fill("400095");
	await page.locator('input[name="city"]').fill("Mmbai");
	await page.locator('input[name="state"]').fill("Maharashtraa");
	await page.locator('input[name="country"]').fill("India");
	await page.getByRole("button", { name: "SAVE" }).click();

	await page.waitForTimeout(2000); // Optional, depending on your application's behavior

	await page
		.getByRole("columnheader", { name: "icon Address" })
		.locator("div")
		.first()
		.click();

	await page.locator(".manualColumnResizer").dblclick();

	await page
		.getByRole("columnheader", { name: "icon Address" })
		.locator("div")
		.first()
		.click();

	await page.waitForTimeout(1000); // Optional, depending on your application's behavior

	await expect(
		page.getByRole("gridcell", {
			name: "B-201,Divay Deep, Vazira Raka",
		}),
	).toHaveScreenshot("address-cell-display.png", {
		maxDiffPixelRatio: 0.05, // Allow up to 5% pixel difference
	});
}
