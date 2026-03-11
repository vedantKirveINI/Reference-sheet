import { expect, test } from "@playwright/test";
import {
	clearDateField,
	invalidDate,
	leapYear,
	saveDateField,
	validDate,
} from "./date";

test.describe("Date", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicHIiOiJNMncxY1Q0OFEiLCJwYSI6Ik0ydzFjVDQ4USIsImEiOiJVVjd0OHFVazUiLCJ0IjoiY20zZmllODExMDBjZ2NtcnR1OGp4MTRxNyIsInYiOiJjbTNmaWU4M28wMGNoY21ydG05aHRibnR3In0%3D`,
		);

		const getSheetReponse = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});

		expect(getSheetReponse.status()).toBe(201);

		await page.waitForSelector(".handsontable");

		await page
			.getByRole("row", { name: "icon Name icon Date: ddmmyyyy" })
			.getByTestId("column-date-3")
			.waitFor({ state: "visible" });

		await page
			.getByRole("row", { name: "icon Name icon Date: ddmmyyyy" })
			.getByTestId("column-date-4")
			.waitFor({ state: "visible" });

		await page
			.getByRole("row", { name: "icon Name icon Date: ddmmyyyy" })
			.getByTestId("column-date-5")
			.waitFor({ state: "visible" });
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Date: Invalid Date", async () => {
		await invalidDate({ page });
	});

	test("Date: Valid Date", async () => {
		await validDate({ page });
	});

	test("Date: Leap Year", async () => {
		await leapYear({ page });
	});

	test("Date: clear date field on blur and enter press", async () => {
		await clearDateField({ page });
	});

	// test("Date: saving date field", async () => {
	// 	await saveDateField({ page });
	// });
});
