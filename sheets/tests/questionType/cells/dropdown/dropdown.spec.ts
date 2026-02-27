import { test, expect } from "@playwright/test";
import {
	ddAddOptions,
	ddNoDuplicateValuesOnSameSelection,
	ddRemoveOptions,
} from "./dropdown";

test.describe("dropdown", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicHIiOiJWNTU2YnA3QjIiLCJwYSI6IlY1NTZicDdCMiIsImEiOiJVLXJwSE14YloiLCJ0IjoiY20xa29kanZrMDUxbTEwbGRlMnhzMHB4ayIsInYiOiJjbTFrb2RqeWgwNTFuMTBsZHJtMXQ3c2h1In0%3D`,
		);
		await page.waitForSelector(".handsontable");

		await page
			.getByRole("columnheader", { name: "icon Drop Down" })
			.getByTestId("column-drop-down-1")
			.click();
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("dropdown: adding options", async () => {
		await ddAddOptions({ page: page });
	});

	test("dropdown: removing options", async () => {
		await ddRemoveOptions({ page: page });
	});

	test("dropdown: no duplicate value on same selection", async () => {
		await ddNoDuplicateValuesOnSameSelection({ page: page });
	});
});
