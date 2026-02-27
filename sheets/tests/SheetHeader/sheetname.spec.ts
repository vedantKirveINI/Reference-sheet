import { test, expect } from "@playwright/test";
import { waitForResponseAndCheckStatus } from "../utils/helper";

test.describe("Sheet", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJ6LU9oaGoyQXIiLCJ0IjoiY20yYmxyeTJrMDUyajJvb201OXZnZWJiZSIsInYiOiJjbTJibHJ5NHEwNTJrMm9vbWZuaWJ0Nno3In0%3D`,
		);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Check UI of sheet header", async () => {
		await page.getByTestId("sheet-header").waitFor({ state: "visible" });
		await page.getByRole("alert").waitFor({ state: "hidden" });

		await expect(page.getByTestId("sheet-header")).toHaveScreenshot(
			"sheet-header.png",
			{ maxDiffPixelRatio: 0.05 },
		);
	});

	test("Check and update title of sheet", async () => {
		const inputField = page
			.getByTestId("sheet-title-input")
			.getByRole("textbox");

		await expect(inputField).toBeVisible();

		await inputField.click();
		await inputField.fill("Sheet name and Delete row");
		await page.locator('[class*="tablist_container"]').click();

		//inputField.blur();

		await waitForResponseAndCheckStatus({
			page,
			urlSubstring: "/base/update_base_sheet_name",
			expectedStatus: 200,
		});
		await expect(page.getByRole("alert")).toBeVisible();

		await expect(inputField).toHaveValue("Sheet name and Delete row");
	});

	test("Empty sheet name should show default name on outside click", async () => {
		const inputField = page
			.getByTestId("sheet-title-input")
			.getByRole("textbox");

		await inputField.waitFor({ state: "visible" });

		await inputField.click();
		await inputField.fill("");

		inputField.blur();
		await waitForResponseAndCheckStatus({
			page,
			urlSubstring: "/base/update_base_sheet_name",
			expectedStatus: 200,
		});
		await expect(page.getByRole("alert")).toBeVisible();

		await expect(inputField).toHaveValue("Untitled Sheet");
	});

	test("Same sheet name should not make api call to backend", async () => {
		const inputField = page
			.getByTestId("sheet-title-input")
			.getByRole("textbox");

		await expect(inputField).toBeVisible();

		await inputField.click();
		await inputField.fill("Untitled Sheet");

		inputField.blur();
		await expect(page.getByRole("alert")).not.toBeVisible();

		await expect(inputField).toHaveValue("Untitled Sheet");
	});
});
