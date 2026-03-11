import { test, expect } from "@playwright/test";

test.describe("Export Data", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();

		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicHIiOiJNMncxY1Q0OFEiLCJwYSI6Ik0ydzFjVDQ4USIsImEiOiJpcEpkNllOMV8iLCJ0IjoiY20zNXB4OHg3MDE5djU4bXZ4bWdmYnV6dyIsInYiOiJjbTM1cHg5MmIwMTl3NThtdmh4djE0MWpqIn0%3D`,
		);
		await page.waitForLoadState("load");
		const response = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});

		expect(response.status()).toBe(201);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Export Data in CSV format", async ({ browser, baseURL }) => {
		await page.getByTestId("export-data").click();
		await page.mouse.click(0, 0);
		const downloadPromise = page.waitForEvent("download");
		await page.getByText("CSV").click();
		const download = await downloadPromise;

		await expect(
			page
				.locator("div")
				.filter({ hasText: "File Download Successfull" })
				.nth(4),
		).toBeVisible();
		await page.keyboard.press("Escape");
	});

	test("Testing Export csv if the network is down", async ({
		browser,
		baseURL,
	}) => {
		// Simulate network offline
		await page.route("**/*", (route) => route.abort());

		// Try to export the data
		await page.getByTestId("export-data").click();
		await page.mouse.click(0, 0);

		await page.getByText("CSV").click();

		// Check for error handling when offline
		await expect(
			page
				.locator("div")
				.filter({ hasText: "Something went wrong" }) // Update based on your app's error message
				.nth(4),
		).toBeVisible();
		await page.keyboard.press("Escape");
		// Restore network if needed
		await page.unroute("**/*");
	});
});
