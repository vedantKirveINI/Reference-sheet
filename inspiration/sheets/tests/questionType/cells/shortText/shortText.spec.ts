import { test, expect } from "@playwright/test";
import {
	shortText,
	shortTextWithLargeNumber,
	shortTextWithLongText,
	shortTextWithNumber,
} from "./shortText";

test.describe("short text", () => {
	let sheetPage;

	test.beforeAll(async ({ browser, baseURL }) => {
		sheetPage = await browser.newPage();
		await sheetPage.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJ5TTYyNF9DUkQiLCJ0IjoiY20zbzFzNnE3MDRlbzNlNW5vdXA5MzRqeSIsInYiOiJjbTNvMXM2dGswNGVwM2U1bmd6bGM1OWtiIn0%3D`,
		);
		await sheetPage.waitForSelector(".handsontable");

		await sheetPage
			.getByRole("columnheader", { name: "icon Name" })
			.getByTestId("column-short-text-0")
			.waitFor({ state: "visible" });
	});

	test.afterAll(async () => {
		await sheetPage.close();
	});

	test("short text: entering small text", async () => {
		await shortText({ page: sheetPage });
	});

	test("short text: entering very long text", async () => {
		await shortTextWithLongText({ page: sheetPage });
	});

	test("short text: entering number", async () => {
		await shortTextWithNumber({ page: sheetPage });
	});

	test("short text: entering large number", async () => {
		await shortTextWithLargeNumber({ page: sheetPage });
	});
});
