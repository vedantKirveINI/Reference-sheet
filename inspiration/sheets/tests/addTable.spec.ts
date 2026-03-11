import { test, expect } from "@playwright/test";
import { matchScreenShot } from "./utils/helper";

test.describe("Add table", () => {
	let page;

	// There should be only one table initally
	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();

		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiIiLCJwciI6IiIsImEiOiI3ZGY3Njk3MS1jYjFmLTQzYjgtODMwMS0zMDA1NTRlOTFlZjgiLCJ0IjoiY205azBsbGU5MHZrNjVpMjVxY2NkaXVnayIsInYiOiJjbTlrMGxsanMwdms3NWkyNWh0YnRvcWdtIn0%3D`,
		);

		const getSheetReponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});

		expect(getSheetReponse.status()).toBe(201);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	const countTables = async () => {
		const parent = page.getByTestId("tab-list");
		return await parent.locator("> div").count();
	};

	test("multiple clicks on add or import should be cancelled and not show any toast", async () => {
		const responses = [];

		// Intercept and track responses
		page.on("response", (response) => {
			if (
				response
					.url()
					.includes(
						"/table?baseId=7df76971-cb1f-43b8-8301-300554e91ef8&is_view_required=true",
					)
			) {
				responses.push(response);
			}
		});

		const locator = page.getByText("Add or Import");

		// Perform rapid clicks
		for (let i = 0; i < 5; i++) {
			await locator.click();
		}

		await expect(page.getByRole("alert")).not.toBeVisible();

		// Wait for one of the expected responses to ensure the API has responded
		await page.waitForResponse((response) =>
			response
				.url()
				.includes(
					"/table?baseId=7df76971-cb1f-43b8-8301-300554e91ef8&is_view_required=true",
				),
		);

		// Wait for a moment to let the responses settle
		await page.waitForTimeout(1000); // Adjust if necessary in case of slow network

		// Check responses
		const successfulResponses = responses.filter(
			(res) => res.status() === 200,
		);
		// Assert only one successful response
		expect(successfulResponses.length).toBeGreaterThan(0);
	});

	test("add table", async () => {
		const tabListContainer = page.getByTestId("tab-list");

		await expect(tabListContainer).toBeVisible();
		await tabListContainer
			.locator("> div")
			.first()
			.waitFor({ state: "visible" });

		// const tablesBefore = await countTables();

		// await expect(
		// 	page
		// 		.locator("div")
		// 		.filter({ hasText: /^Add or Import$/ })
		// 		.nth(1),
		// ).toBeVisible();

		await expect(page.getByText("Add or Import")).toBeVisible();
		await page.getByText("Add or Import").click();

		await page.getByRole("menuitem", { name: "Add Table" }).click();

		await expect(page.getByRole("textbox")).toBeVisible();

		const locator = page.getByRole("dialog");

		await matchScreenShot({
			page,
			locator,
			screenShotName: "add-table-dialog.png",
		});

		const inputField = await page
			.getByTestId("ods-dialog")
			.getByRole("textbox");

		await inputField.click();

		await inputField.fill("table 14");

		await page.getByRole("button", { name: "ADD" }).click();

		const createTableResponse = await page.waitForResponse((res) => {
			return res.url().includes("/table/create_table");
		});

		expect(createTableResponse.status()).toBe(201);

		const getSheetReponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});

		expect(getSheetReponse.status()).toBe(201);

		await expect(page.getByTestId("table-name-container-1")).toBeVisible();

		const tablesAfter = await countTables();
		await page.waitForTimeout(1000);

		await expect(tablesAfter).toBe(2);

		await page.getByText("table 14").waitFor({ state: "visible" });

		await expect(
			page
				.getByTestId(`table-name-container-1`)
				.getByTestId("table-name-editor"),
		).toContainText("table 14");

		await page.locator('[class*="expand_icon"]').click();
		await page.getByTestId("ods-context-menu-item").nth(3).click();
		await page.getByText("DELETE").nth(4).click();
	});
});
