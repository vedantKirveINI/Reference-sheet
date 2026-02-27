import { test, expect } from "@playwright/test";

test.describe("Sharing of sheet view/edit", () => {
	let page;

	test.afterAll(async () => {
		await page.close();
	});

	test("Open sheet where user doesn't have access", async ({
		browser,
		baseURL,
	}) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoidU03UjJ1elVKIiwicHIiOiJvQTdTeWQ5R2IiLCJwYSI6Im9BN1N5ZDlHYiIsImEiOiJRdGNIenBhZWYiLCJ0IjoiY2x3cTlueXdxMDF4NHg0eGw5emdwYXpjYSIsInYiOiJjbHdxOW55eWQwMXg1eDR4bHo2bTRqbTN0In0%3D`,
		);
		await page.waitForTimeout(500);
		const response = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});

		expect(response.status()).toBeGreaterThanOrEqual(400);

		await expect(page.getByTestId("ods-alert-container")).toBeVisible();

		await expect(page.locator("body")).toHaveScreenshot(
			"you-dont-have-access.png",
			{
				maxDiffPixelRatio: 0.05,
			},
		);

		await page.close();
	});

	test("Open sheet where user has access to the sheet", async ({
		browser,
		baseURL,
	}) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoidU03UjJ1elVKIiwicHIiOiJSWlctWWtPenEiLCJwYSI6IlJaVy1Za096cSIsImEiOiJHRlMzU2xqWTgiLCJ0IjoiY2x5Y2hvdmtoMDB3czdzMmVsNTdiaG56aCIsInYiOiJjbHljaG92b28wMHd0N3MyZXZrOHhqczN0In0%3D`,
		);

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});

		expect(response.status()).toBe(201);

		await page.waitForSelector(".handsontable");
		await page
			.getByRole("columnheader", { name: "icon Name" })
			.waitFor({ state: "visible" });

		await expect(page.locator("body")).toHaveScreenshot(
			"you-have-access.png",
			{
				maxDiffPixelRatio: 0.05,
			},
		);
	});
});
