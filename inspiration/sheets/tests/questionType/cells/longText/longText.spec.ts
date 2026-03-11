import { test, expect } from "@playwright/test";
import {
	longText,
	longTextWithLargeNumber,
	longTextWithLongText,
	longTextWithNumber,
} from "./longText";

test.describe("long text", () => {
	let sheetPage;

	test.beforeAll(async ({ browser, baseURL }) => {
		sheetPage = await browser.newPage();
		await sheetPage.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJ5TTYyNF9DUkQiLCJ0IjoiY20zbzFzNnE3MDRlbzNlNW5vdXA5MzRqeSIsInYiOiJjbTNvMXM2dGswNGVwM2U1bmd6bGM1OWtiIn0%3D`,
		);
		await sheetPage.waitForSelector(".handsontable");

		await sheetPage
			.getByRole("columnheader", { name: "icon Long Text" })
			.getByTestId("column-long-text-1")
			.waitFor({ state: "visible" });
	});

	test.afterAll(async () => {
		await sheetPage.close();
	});

	test("long text: entering small text", async () => {
		await longText({ page: sheetPage });
	});

	test("long text: entering very long text", async () => {
		await longTextWithLongText({ page: sheetPage });
	});

	test("long text: entering number", async () => {
		await longTextWithNumber({ page: sheetPage });
	});

	test("long text: entering large number", async () => {
		await longTextWithLargeNumber({ page: sheetPage });
	});
});
