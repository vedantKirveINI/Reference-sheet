import { expect } from "@playwright/test";

async function scqTestToChooseAnOption({ page }) {
	await page.waitForLoadState("load");
	await page.waitForTimeout(1000);
	const cellLocator = await page.locator("td:nth-child(6)").first();
	await cellLocator.waitFor({ state: "visible" });
	await expect(cellLocator).toBeVisible();

	await cellLocator.dblclick({ force: true });

	const editorLocator = await page.locator('[data-testid="scq-editor"]');
	await editorLocator.waitFor({ state: "visible" });
	await expect(editorLocator).toBeVisible();

	// await page.getByTestId("scq-editor").getByLabel("Open").click();

	// const optionsLocator = await page
	// 	.locator('[data-testid="ods-autocomplete-listbox"]')
	// 	.first();

	// await optionsLocator.waitFor({ state: "visible" });
	// expect(optionsLocator).toBeVisible();

	const listOfOptions = await page
		.locator('[data-testid="ods-radio-label"]')
		.nth(1);
	await listOfOptions.waitFor({ state: "visible" });
	expect(listOfOptions).toBeVisible();
	await listOfOptions.click({ force: true });

	await expect(
		await page.getByTestId("fixed-tags-demo").locator("div").nth(1),
	).toHaveScreenshot("scq-cell-editor-display.png", {
		maxDiffPixelRatio: 0.05,
	});

	await page
		.locator('//span[text()="Verstappen"]')
		.waitFor({ state: "visible" });

	await page.keyboard.press("Enter");

	const finalCell = await page.locator("tr:nth-child(3) > td:nth-child(5)");
	await finalCell.waitFor({ state: "visible" });
	expect(finalCell).toBeVisible();
	await finalCell.click({ force: true });

	await page.waitForTimeout(800);
}

async function scqTestSaveOptionOnOuterClick({ page }) {
	await page.waitForLoadState("load");

	const cellLocator = await page
		.locator(".ht__row_even > td:nth-child(6)")
		.first();
	//const cellLocator = await page.locator("td:nth-child(6)").first();

	await cellLocator.waitFor({ state: "visible" });
	await expect(cellLocator).toBeVisible();

	await cellLocator.dblclick({ force: true });

	const editorLocator = await page.locator('[data-testid="scq-editor"]');
	await editorLocator.waitFor({ state: "visible" });
	await expect(editorLocator).toBeVisible();

	//await page.getByTestId("scq-editor").getByLabel("Open").click();

	// const optionsLocator = await page
	// 	.getByTestId("ods-autocomplete-listbox")
	// 	.nth(0);
	// await optionsLocator.waitFor({ state: "visible" });
	// expect(optionsLocator).toBeVisible();

	const currentOption = await page
		.locator('[data-testid="ods-radio-label"]')
		.nth(0);
	await currentOption.waitFor({ state: "visible" });

	expect(currentOption).toBeVisible();
	await currentOption.click({ force: true });

	await page.getByText("Hamilton").first().waitFor({ state: "visible" });

	const finalCell = await page.locator("tr:nth-child(3) > td:nth-child(5)");
	await finalCell.waitFor({ state: "visible" });
	expect(finalCell).toBeVisible();
	await finalCell.click({ force: true });

	await page.getByText("Hamilton").waitFor({ state: "visible" });

	// Verify that the selected value is correct
	await expect(
		page.locator(".ht__row_even > td:nth-child(6)").first(),
	).toHaveText("Hamilton");

	await page.waitForTimeout(800);
}

async function scqShouldHaveOnlyOneOption({ page }) {
	await page.waitForLoadState("load");

	// Step 1: Open the grid cell editor
	const cellLocator = page.getByRole("gridcell", { name: "Hamilton" });
	await cellLocator.waitFor({ state: "visible" });
	await expect(cellLocator).toBeVisible();
	await cellLocator.dblclick({ force: true });

	// Step 2: Ensure editor is visible
	const editorLocator = page.locator('[data-testid="scq-editor"]').first();
	await editorLocator.waitFor({ state: "visible" });
	await expect(editorLocator).toBeVisible();

	await editorLocator.click();

	// Helper function to select a dropdown option by index
	const selectDropdownOption = async (index) => {
		const option = page
			.locator('[data-testid="ods-radio-label"]')
			.nth(index);
		await option.waitFor({ state: "visible" });
		expect(option).toBeVisible();
		await option.click({ force: true });
	};

	for (let i = 2; i <= 4; i++) {
		await editorLocator.click();
		await selectDropdownOption(i);
	}

	// Step 4: Finalize and verify
	await page.keyboard.press("Enter");
	await expect(
		page.getByRole("gridcell", { name: "Alonso" }),
	).toHaveScreenshot("scq-cell-display.png", {
		maxDiffPixelRatio: 0.05,
	});
}

async function clearScqData({ page }) {
	await page.locator("td:nth-child(6)").first().click();
	await page.keyboard.press("Backspace");

	await page.locator(".ht__row_even > td:nth-child(6)").first().click();
	await page.keyboard.press("Backspace");
}

export {
	scqTestToChooseAnOption,
	scqTestSaveOptionOnOuterClick,
	scqShouldHaveOnlyOneOption,
	clearScqData,
};
