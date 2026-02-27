import { expect } from "@playwright/test";

import { matchScreenShot } from "../../utils/helper";

const numberEditorWithValidInput = async ({ page }) => {
	await page.locator("td:nth-child(4)").first().dblclick();

	await page.getByTestId("number-editor").fill("2909");
	await page.keyboard.press("Enter");

	await page.waitForTimeout(800);
	await page
		.getByRole("gridcell", { name: "2909" })
		.waitFor({ state: "visible" });

	await page.getByRole("gridcell", { name: "2909" }).click();
	await page.keyboard.press("Backspace");

	await page.waitForTimeout(400);
	expect(await page.locator("td:nth-child(4)").first().innerText()).toBe("");
};

const numberEditorWithInvalidInput = async ({ page }) => {
	await page
		.locator(".ht__row_even > td:nth-child(4)")
		.first()
		.waitFor({ state: "visible" });

	await page.waitForTimeout(300);

	await page.locator(".ht__row_even > td:nth-child(4)").first().dblclick();

	await page.getByTestId("number-editor").waitFor({ state: "visible" });
	await page.getByTestId("number-editor").fill("asdasdsda");
	await page.keyboard.press("Enter");

	await page.locator(".ht__row_even > td:nth-child(4)").first().dblclick();
	await page.getByTestId("number-editor").waitFor({ state: "visible" });
	await page.getByTestId("number-editor").fill("9901-19123");
	await page.keyboard.press("Enter");

	await matchScreenShot({
		page,
		locator: page.locator(".ht__row_even > td:nth-child(4)").first(),
		screenShotName: "number-editor-with-incorrect-data.png",
	});

	await page.getByTestId("number-editor").fill("");
	await page.keyboard.press("Enter");

	expect(
		await page
			.locator(".ht__row_even > td:nth-child(4)")
			.first()
			.innerText(),
	).toBe("");
};

export { numberEditorWithInvalidInput, numberEditorWithValidInput };
