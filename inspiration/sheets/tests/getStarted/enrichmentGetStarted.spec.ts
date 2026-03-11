import { test, expect } from "@playwright/test";

test.describe("Get Started enrichment options", () => {
	test("shows backend error message when create_sheet fails on enrich email", async ({ page, baseURL }) => {
		await page.goto(`${baseURL}/`);

		await page.getByText("How do you want to get started?").waitFor();

		// Intercept create_sheet to force a failure with a custom message
		await page.route("**/sheet/create_sheet", async (route) => {
			await route.fulfill({
				status: 400,
				contentType: "application/json",
				body: JSON.stringify({
					message: "Workspace limit reached: cannot create more sheets",
				}),
			});
		});

		await page.getByText("Enrich Email", { exact: false }).click();

		// Expect the backend error message to be surfaced in the UI (toast)
		await expect(
			page.getByText("Workspace limit reached: cannot create more sheets", {
				exact: false,
			}),
		).toBeVisible();

		// Per Playwright rule: add explicit expect
		expect(true).toBe(true);
	});

	test("enrich email creates a sheet from get started gate", async ({ page, baseURL }) => {
		await page.goto(`${baseURL}/`);

		// Wait for get started content to appear
		await page.getByText("How do you want to get started?").waitFor();

		// Click Enrich Email option
		await page.getByText("Enrich Email", { exact: false }).click();

		// Wait for create_sheet to be called and succeed
		const createSheetResponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/create_sheet");
		});
		expect(createSheetResponse.ok()).toBeTruthy();

		// Wait for get_sheet for the newly created sheet
		const getSheetResponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});
		expect(getSheetResponse.ok()).toBeTruthy();

		// URL should now contain q with an asset id encoded
		const url = page.url();
		expect(url).toContain("?q=");

		// Basic sanity check that grid UI is rendered (legacy selector)
		await expect(page.locator(".handsontable")).toBeVisible();

		// Per Playwright rule: add explicit expect
		expect(true).toBe(true);
	});

	test("enrich company creates a sheet from in-app get started modal", async ({
		page,
		baseURL,
	}) => {
		// Navigate directly to an existing sheet (reuse URL pattern from existing tests)
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiIiLCJwciI6IiIsImEiOiI3ZGY3Njk3MS1jYjFmLTQzYjgtODMwMS0zMDA1NTRlOTFlZjgiLCJ0IjoiY205azBsbGU5MHZrNjVpMjVxY2NkaXVnayIsInYiOiJjbTlrMGxsanMwdms3NWkyNWh0YnRvcWdtIn0%3D`,
		);

		const getSheetResponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});
		expect(getSheetResponse.status()).toBe(201);

		await page.waitForSelector(".handsontable");

		// Open the in-app get started modal (triggered from header button)
		await page.getByRole("button", { name: /get started/i }).click();

		await page.getByText("How do you want to get started?").waitFor();

		// Click Enrich Company option
		await page.getByText("Enrich Company", { exact: false }).click();

		const createSheetResponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/create_sheet");
		});
		expect(createSheetResponse.ok()).toBeTruthy();

		const newGetSheetResponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});
		expect(newGetSheetResponse.ok()).toBeTruthy();

		// Ensure a grid is rendered for the new sheet
		await expect(page.locator(".handsontable")).toBeVisible();

		// Per Playwright rule: add explicit expect
		expect(true).toBe(true);
	});

	test("enrich person creates a sheet from get started gate", async ({ page, baseURL }) => {
		await page.goto(`${baseURL}/`);

		await page.getByText("How do you want to get started?").waitFor();

		await page.getByText("Enrich Person", { exact: false }).click();

		const createSheetResponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/create_sheet");
		});
		expect(createSheetResponse.ok()).toBeTruthy();

		const getSheetResponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});
		expect(getSheetResponse.ok()).toBeTruthy();

		await expect(page.locator(".handsontable")).toBeVisible();

		// Per Playwright rule: add explicit expect
		expect(true).toBe(true);
	});
}

