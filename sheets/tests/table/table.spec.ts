import { test, expect } from "@playwright/test";
import {
	verifyAndUpdateTableName,
	verifyTableSettingsClearData,
	verifyTableSettingsDeleteTable,
	verifyTableSettingsRename,
	verifyTableSettingsModalCancel,
	emptyTableName,
} from "./table";

test.describe("Table", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicHIiOiJNMncxY1Q0OFEiLCJwYSI6Ik0ydzFjVDQ4USIsImEiOiJFZjRCV2dzQm0iLCJ0IjoiY205aWhqYWcxMG1jNjVpMjU3Zjl4bnB4MCIsInYiOiJjbTlpaGphamwwbWM3NWkyNWczbWFha3hqIn0%3D`,
		);

		//await page.waitForSelector(".handsontable");

		//await expect(page.getByTestId("table-name-container-1")).toBeVisible();

		await page.getByText("ADD OR IMPORT").click();
		await page.getByText("Add Table").click();
		await page.getByPlaceholder("Enter Table Name").click();
		await page.getByPlaceholder("Enter Table Name").fill("Test Table");
		await page.getByRole("button", { name: "ADD" }).click();
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Check and update table name", async () => {
		await verifyAndUpdateTableName({ page });
	});

	test("Empty table name should have default name on blur", async () => {
		await emptyTableName({ page });
	});

	test("Table Settings: Rename", async () => {
		await verifyTableSettingsRename({ page });
	});

	test("Table Settings (Modal Cancel)", async () => {
		await verifyTableSettingsModalCancel({ page });
	});

	test("Table Settings:Clear Data", async () => {
		await verifyTableSettingsClearData({ page });
	});

	test("Table Settings:Delete Table", async () => {
		await verifyTableSettingsDeleteTable({ page });
	});
});
