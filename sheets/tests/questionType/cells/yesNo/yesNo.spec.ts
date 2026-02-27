import { expect, test } from "@playwright/test";

import {
	verifyYesNoOptionsVisibility,
	verifyYesNoOtherOptionsVisibility,
	verifyYesNoOptionSelection,
	verifyYesNoOtherOptionSelection,
	verifyNoMultiSelectOnSameOption,
	verifyNoMultiSelectOnDifferentOptions,
} from "./yesNo";

test.describe("yesno", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicHIiOiJWNTU2YnA3QjIiLCJwYSI6IlY1NTZicDdCMiIsImEiOiJVLXJwSE14YloiLCJ0IjoiY20xa29kanZrMDUxbTEwbGRlMnhzMHB4ayIsInYiOiJjbTFrb2RqeWgwNTFuMTBsZHJtMXQ3c2h1In0%3D`,
		);

		await page.waitForSelector(".handsontable");

		await page
			.getByRole("columnheader", { name: "icon Yes No", exact: true })
			.getByTestId("column-yes-no-6")
			.waitFor({ state: "visible" });

		await page
			.getByRole("columnheader", { name: "icon Yes No Other" })
			.getByTestId("column-yes-no-7")
			.waitFor({ state: "visible" });
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Yes No: 'Other' option should be hidden, 'Yes', 'No' option should be visible", async () => {
		await verifyYesNoOptionsVisibility({ page });
	});

	// test("Yes No Other: 'Yes', 'No', 'Other' option should be visible", async () => {
	// 	await verifyYesNoOtherOptionsVisibility({ page });
	// });

	test("Yes No: selecting option", async () => {
		await verifyYesNoOptionSelection({ page });
	});

	test("Yes No Other: selecting option", async () => {
		await verifyYesNoOtherOptionSelection({ page });
	});

	test("Yes No common: should not allow multi-select on repeated clicks on same option", async () => {
		await verifyNoMultiSelectOnSameOption({ page });
	});

	test("Yes No common: should not allow multi-select on repeated clicks on different option", async () => {
		await verifyNoMultiSelectOnDifferentOptions({ page });
	});
});
