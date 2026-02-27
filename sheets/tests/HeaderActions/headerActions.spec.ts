import { test } from "@playwright/test";
import { openUserProfileContextMenu, openReferralPage } from "./userProfile";

test.describe("Header action bar", () => {
	let page;

	test.beforeEach(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicHIiOiJNMncxY1Q0OFEiLCJwYSI6Ik0ydzFjVDQ4USIsImEiOiJ6LU9oaGoyQXIifQ==`,
		);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Open user context menu and access profile page", async () => {
		await openUserProfileContextMenu({ page });
	});

	test("Open user context and access referral & credits page", async () => {
		await openReferralPage({ page });
	});
});
