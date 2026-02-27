import { expect } from "@playwright/test";

const timeWithInputIn12hrFormatOnOuterClick = async ({ page }) => {
	await page.waitForTimeout(1000);
	await page.locator("(//td[@aria-colindex='9'])[1]").click();
	await page.locator("(//td[@aria-colindex='9'])[1]").dblclick();

	await page
		.getByTestId("time-editor")
		.getByPlaceholder("HH:MM")
		.fill("09:30");

	await page.getByTestId("set-meridiem").click();
	//await page.locator('[class*="meridiem"]').first().click();
	await page.locator('[class*="meridiem_option"]').first().click(); ///changes

	//await page.getByTestId("time-editor").getByText("AM").click();
	await page.locator("tr:nth-child(4) > td:nth-child(9)").click();

	await expect(
		await page.getByRole("gridcell", { name: "09:30 AM" }),
	).toHaveScreenshot("time-cell-display.png", {
		maxDiffPixelRatio: 0.05, // Allow up to 5% pixel difference
	});
};

const timeWithInvalidInputIn12hrFormat = async ({ page }) => {
	await page.waitForTimeout(800);
	await page.locator("tr:nth-child(2) > td:nth-child(9)").dblclick();

	await page
		.getByTestId("time-editor")
		.getByPlaceholder("HH:MM")
		.fill("99:30");

	await page.getByTestId("set-meridiem").click();
	await page.locator('[class*="meridiem_option"]').nth(1).click();

	await page.waitForTimeout(800);
	await page.locator("tr:nth-child(3) > td:nth-child(8)").click();

	expect(
		await page.locator("tr:nth-child(2) > td:nth-child(9)").innerText(),
	).toBe("");

	await page.waitForTimeout(800);
	await page.locator("tr:nth-child(2) > td:nth-child(9)").dblclick();

	await page
		.getByTestId("time-editor")
		.getByPlaceholder("HH:MM")
		.fill("23:45");

	await page.getByTestId("set-meridiem").click();

	await page.locator('[class*="meridiem_option"]').first().click();

	await page.keyboard.press("Enter");

	expect(
		await page.locator("tr:nth-child(2) > td:nth-child(9)").innerText(),
	).toBe("");
};

const timeWithOnlyMeridiemSelected = async ({ page }) => {
	await page.waitForTimeout(800);
	await page.locator("tr:nth-child(2) > td:nth-child(9)").dblclick();

	await page.getByTestId("set-meridiem").click();

	await page.locator('[class*="meridiem_option"]').nth(1).click();

	await page.keyboard.press("Enter");

	expect(
		await page.locator("tr:nth-child(2) > td:nth-child(9)").innerText(),
	).toBe("");

	await page.waitForTimeout(800);

	await page.locator("tr:nth-child(2) > td:nth-child(9)").dblclick();

	await page.getByTestId("set-meridiem").click();

	await page.locator('[class*="meridiem_option"]').first().click();

	await page.locator("tr:nth-child(3) > td:nth-child(9)").click();

	expect(
		await page.locator("tr:nth-child(2) > td:nth-child(9)").innerText(),
	).toBe("");
};

const timeWithInputIn24hrFormat = async ({ page }) => {
	await page.waitForTimeout(800);
	await page.locator("td:nth-child(10)").first().dblclick();
	await page
		.getByTestId("time-editor")
		.getByPlaceholder("HH:MM")
		.fill("12:45");
	await page.locator("td:nth-child(10)").nth(1).dblclick();
	await expect(
		page.locator("td:nth-child(10)").first().locator("input"),
	).toHaveAttribute("value", "12:45");
};

const timeWithInvalidInputIn24hrFormat = async ({ page }) => {
	await page.waitForTimeout(800);
	await page.locator("tr:nth-child(2) > td:nth-child(10)").dblclick();

	await page
		.getByTestId("time-editor")
		.getByPlaceholder("HH:MM")
		.fill("24:00");

	await page.keyboard.press("Enter");

	await expect(page.locator("tr:nth-child(2) > td:nth-child(10)")).toHaveText(
		"",
	);
};

const timeWhenInputIsClearedOnEnterClick = async ({ page }) => {
	// Function to clear input for a given cell
	const clearTimeInput = async (cell) => {
		await cell.dblclick();

		await page
			.getByTestId("time-editor")
			.getByPlaceholder("HH:MM")
			.fill("");

		await page.keyboard.press("Enter");
		await page.waitForTimeout(800);
	};

	// Select the two cells
	const cell1 = page.locator("td:nth-child(9)").first();
	const cell2 = page.locator("td:nth-child(10)").first();

	await page.waitForTimeout(800);
	// Clear input for the first cell
	await clearTimeInput(cell1);

	// Clear input for the second cell
	await clearTimeInput(cell2);

	// Verify that both cells have empty content after clearing
	const cell1Content = await cell1.textContent();
	const cell2Content = await cell2.textContent();

	expect(cell1Content).toBe("");
	expect(cell2Content).toBe("");
};

const timeSaveOnEnterClick = async ({ page }) => {
	await page.locator("td:nth-child(9)").first().dblclick();
	await page
		.getByTestId("time-editor")
		.getByPlaceholder("HH:MM")
		.fill("10:22");

	await page.getByTestId("set-meridiem").click();

	await page.locator('[class*="meridiem_option"]').nth(1).click();

	await page.locator("td:nth-child(9)").nth(1).dblclick();

	await expect(
		page.locator("td:nth-child(9)").first().locator("input"),
	).toHaveAttribute("value", "10:22");
};

const timeWhenInputIsClearedOnOuterClick = async ({ page }) => {
	await page.waitForTimeout(800);
	await page.getByRole("gridcell", { name: ":22 PM" }).dblclick();

	await page.getByTestId("time-editor").getByPlaceholder("HH:MM").fill("");

	await page.locator("tr:nth-child(2) > td:nth-child(8)").click();

	expect(await page.locator("td:nth-child(9)").first().innerText()).toBe("");
};

export {
	timeWithInputIn12hrFormatOnOuterClick,
	timeWithInvalidInputIn12hrFormat,
	timeWithOnlyMeridiemSelected,
	timeWithInputIn24hrFormat,
	timeWithInvalidInputIn24hrFormat,
	timeWhenInputIsClearedOnEnterClick,
	timeWhenInputIsClearedOnOuterClick,
	timeSaveOnEnterClick,
};
