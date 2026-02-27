import { test } from "@playwright/test";
import {
	importCSVInNewTableBreakingLimit,
	importCSVWithFirstRowAsColHeader,
	importCSVWithoutFirstRowAsColHeader,
	importCSVCheckingFlowBackward,
	importCSVUsingOptionOnTableName,
	importCSVDataTypeOptionCheck,
	importCSVRemainingFieldShow,
	importCSVMapDataTypeError,
	existingTableCreateNewColWithColheader,
	existingTableCreateNewColWithoutColheader,
	existingTableList,
	importCSVInOfflineEnvironment,
} from "./importCSV";

test.describe("Import CSV file in tiny table", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJuTnVKOWppQUsiLCJ0IjoiY20zbzFiYzc1MDQ0aTNlNW5lNTJ6Y3huZyIsInYiOiJjbTNvMWJjYW0wNDRqM2U1bjVyc3pjcWltIn0%3D`,
		);
		await page.waitForLoadState("load");
		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Import CSV in an existing table with breaking limit", async () => {
		await importCSVInNewTableBreakingLimit({ page });
	});

	test("Import CSV with first row as column header", async () => {
		await importCSVWithFirstRowAsColHeader(page);
	});

	test("Import CSV without first row as column header", async () => {
		await importCSVWithoutFirstRowAsColHeader({ page });
	});

	test("Import CSV checking flow backward", async () => {
		await importCSVCheckingFlowBackward({ page });
	});

	// test("Existing table select map data type", async () => {
	// 	await existingTableSelectMapDataType({ page });
	// });

	test("Import CSV using option on table name", async () => {
		await importCSVUsingOptionOnTableName({ page });
	});

	test("Import CSV data type option check", async () => {
		await importCSVDataTypeOptionCheck({ page });
	});

	test("Import CSV remaining field show", async () => {
		await importCSVRemainingFieldShow({ page });
	});

	test("Import CSV map data type error", async () => {
		await importCSVMapDataTypeError({ page });
	});

	test("Existing table create new col with col header", async () => {
		await existingTableCreateNewColWithColheader({ page });
	});

	test("Existing table create new col without col header", async () => {
		await existingTableCreateNewColWithoutColheader({ page });
	});

	test("Existing table list", async () => {
		//test.setTimeout(60000);

		await existingTableList({ page });
	});

	test("Import CSV in offline environment", async () => {
		await importCSVInOfflineEnvironment({ page });
	});
});
