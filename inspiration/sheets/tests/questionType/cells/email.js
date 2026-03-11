import { expect } from "@playwright/test";

import { matchScreenShot } from "../../utils/helper";

async function emailEditorWithValidInput({ page }) {
	const cell = await page.locator("td:nth-child(5)").first();
	await cell.dblclick();

	await page.locator("textarea").first().fill("abhay.g@gmail.com");

	await page.keyboard.press("Enter");

	// Wait for the table to reflect the updated value (optional but may help with timing)
	await page.waitForTimeout(500);

	// Get the updated cell text
	const cellContent = await cell.textContent();

	// Assert that the cell contains the updated email value
	await expect(cellContent).toBe("abhay.g@gmail.com");
}

async function emailEditorWithInvalidInput({ page }) {
	await page
		.locator(".ht__row_even > td:nth-child(5)")
		.first()
		.waitFor({ state: "visible" });

	await page.locator(".ht__row_even > td:nth-child(5)").first().dblclick();

	await page.getByTestId("email-editor").waitFor({
		state: "visible",
	});

	await page.getByTestId("email-editor").fill("abhay123.iipl.com");
	await page.keyboard.press("Enter");

	// Assert that the error message is visible
	await matchScreenShot({
		page,
		locator: page.locator(".ht__row_even > td:nth-child(5)").first(),
		screenShotName: "email-editor-with-invalid-input.png",
	});

	await page.getByTestId("email-editor").fill("");
	await page.keyboard.press("Enter");

	// Assert that the cell content is empty
	expect(
		await page
			.locator(".ht__row_even > td:nth-child(5)")
			.first()
			.innerText(),
	).toBe("");
}

export { emailEditorWithValidInput, emailEditorWithInvalidInput };
