import { expect } from "@playwright/test";

async function mcqSelectOptionsAndSaveOnEnter({ page }) {
	await page.waitForTimeout(800);
	await page.locator("td:nth-child(3)").first().dblclick();

	await page.getByTestId("oute-ds-advance-label-text").first().click();
	await page.waitForTimeout(800);

	//await page.getByTestId("mcq-editor").click();
	await page.getByTestId("oute-ds-advance-label-text").nth(1).click();
	await page.waitForTimeout(800);

	await page.keyboard.press("Enter");
	await page.locator("tr:nth-child(4) > td").first().click();

	await expect(page.locator("td:nth-child(3)").first()).toHaveText(
		"abhayvedant",
	);
}

async function mcqDeselectOptions({ page }) {
	await page.waitForTimeout(800);
	// Double-click the grid cell containing "abhay vedant"
	await page.getByRole("gridcell", { name: "abhay vedant" }).dblclick();

	// Open the dropdown and deselect "abhay"
	//await page.getByTestId("mcq-editor").click();
	await page.getByTestId("oute-ds-advance-label-text").first().click();
	await page.waitForTimeout(800);

	// Open the dropdown and deselect "vedant"
	//await page.getByTestId("mcq-editor").click();
	await page.getByTestId("oute-ds-advance-label-text").nth(1).click();
	await page.waitForTimeout(800);

	await page.waitForTimeout(800);

	// Click outside the cell to trigger an update
	await page.locator("tr:nth-child(3) > td").first().click();

	// Verify that the cell is now empty
	await expect(page.locator("td:nth-child(3)").first()).toHaveText("");
}

async function mcqNoDuplicateValuesOnSameSelection({ page }) {
	await page.waitForTimeout(800);

	// Click on the initial cell
	await page.locator("td:nth-child(3)").first().dblclick();

	await page.getByTestId("oute-ds-advance-label-text").nth(2).click();
	await page.waitForTimeout(800);

	//await page.getByTestId("mcq-editor").click();
	await page.getByTestId("oute-ds-advance-label-text").nth(3).click();
	await page.waitForTimeout(800);

	// Another interaction with the combobox
	//await page.getByTestId("mcq-editor").click();
	await page.getByTestId("oute-ds-advance-label-text").nth(2).click();
	await page.waitForTimeout(800);

	// Clicking the combobox again to choose the next option
	//await page.getByTestId("mcq-editor").click();
	await page.getByTestId("oute-ds-advance-label-text").nth(3).click();
	await page.waitForTimeout(800);

	// Interact with the next cell
	await page.locator("td:nth-child(4)").first().click();
	// Expect that the previous cell value is empty
	await expect(page.locator("tr:nth-child(2) > td:nth-child(3)")).toHaveText(
		"",
	);
}

async function mcqRemoveOption({ page }) {
	const cell = await page.locator("td:nth-child(3)").first();
	await cell.dblclick();
	for (let i = 1; i < 4; i++) {
		await page.getByTestId("oute-ds-advance-label-text").nth(i).click();
	}
	await page.getByTestId("mcq-editor").locator("div").nth(2).click(); // await page

	await page.locator('//button[@data-testid="ods-icon"]').nth(4).click();
	await page.locator('//button[@data-testid="ods-icon"]').nth(2).click();
	await page.locator('//button[@data-testid="ods-icon"]').nth(2).click();

	await page.locator("tr:nth-child(2) > td:nth-child(3)").click();
	const cellContent = await cell.innerText();
	// Validate that the cell is empty
	expect(cellContent).toBe("");
}

export {
	mcqSelectOptionsAndSaveOnEnter,
	mcqDeselectOptions,
	mcqNoDuplicateValuesOnSameSelection,
	mcqRemoveOption,
};
