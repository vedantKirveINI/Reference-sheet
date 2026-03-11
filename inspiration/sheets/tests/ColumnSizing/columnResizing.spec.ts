import { test } from "@playwright/test";
import {
	addOrDeleteFieldWithColumnResize,
	resizeColumnWidthsWithImportCSV,
} from "./columnResizing";

test.describe("Column Resizing", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJGYmFjc3AtcVEiLCJ0IjoiY202Z2V5cXl6MDAwc3dvcW9sbGdpc2hkYyIsInYiOiJjbTZnZXlyMWcwMDB0d29xb3B0NGZ2Njd4In0%3D`,
		);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("resize column and import csv", async () => {
		await resizeColumnWidthsWithImportCSV({ page });
	});

	test("resize column and add or remove columns with different widths", async () => {
		await addOrDeleteFieldWithColumnResize({ page });
	});
});
