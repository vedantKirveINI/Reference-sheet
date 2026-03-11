import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

import { waitForResponseAndCheckStatus } from "../utils/helper";

async function verifyAndUpdateTableName({ page }) {
	const tableNameContainer = await page.getByTestId("table-name-container-0");
	await expect(tableNameContainer).toBeVisible();
	await tableNameContainer.click();
	const inputField =
		await tableNameContainer.getByTestId("table-name-editor");

	await expect(inputField).toBeVisible();
	await inputField.click();
	const tableName = faker.person.jobTitle();
	await inputField.fill(tableName);

	await page.mouse.click(0, 0);

	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/update_table",
		expectedStatus: 200,
	});

	await expect(page.getByRole("alert")).toBeVisible();
	// Verify that the value has been updated
	await expect(inputField).toContainText(tableName);
	await page.waitForTimeout(2000);
}

async function emptyTableName({ page }) {
	const tableNameContainer = await page.getByTestId("table-name-container-0");

	await expect(tableNameContainer).toBeVisible();

	await tableNameContainer.click();

	const inputField =
		await tableNameContainer.getByTestId("table-name-editor");

	await expect(inputField).toBeVisible();

	await inputField.click();

	await inputField.fill("");

	await page.mouse.click(0, 0);

	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/update_table",
		expectedStatus: 200,
	});
	await expect(page.getByRole("alert")).toBeVisible();

	await expect(inputField).toContainText("Untitled Table");
}

async function verifyTableSettingsRename({ page }) {
	const tableNameContainer = await page.getByTestId("table-name-container-1");

	await expect(tableNameContainer).toBeVisible();

	await tableNameContainer.click();

	const dropDownBtn = await tableNameContainer.locator("svg");

	await expect(dropDownBtn).toBeVisible();

	//await dropDownBtn.click();

	// await expect(page.getByRole("menu")).toBeVisible();
	// await page.getByRole("menuitem", { name: "Rename Table" }).click();
	// await expect(page.getByRole("menu")).not.toBeVisible();
	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(1).click();
	await expect(page.getByRole("menu")).not.toBeVisible();

	await page.waitForTimeout(2000);

	const inputField = tableNameContainer.getByTestId("table-name-editor");

	await expect(inputField).toBeVisible();

	await inputField.click();

	// const tableName = faker.database.table();
	// const tableTitle = `delete table ${tableName}`;
	// await inputField.fill(tableTitle);
	const tableTitle = faker.database.column();

	await inputField.fill(tableTitle);

	await page.mouse.click(0, 0);

	const updateTableName = await page.waitForResponse((res) => {
		return res.url().includes("/table/update_table");
	});

	expect(updateTableName.status()).toBe(200);

	await expect(page.getByRole("alert")).toBeVisible();

	await expect(inputField).toContainText(tableTitle);
}

async function verifyTableSettingsModalCancel({ page }) {
	const tableNameContainer = await page.getByTestId("table-name-container-1");

	await expect(tableNameContainer).toBeVisible();

	await tableNameContainer.click();

	const dropDownBtn = await tableNameContainer.locator("svg");

	await expect(dropDownBtn).toBeVisible();

	const menu = page.getByRole("menu");
	const dialog = page.getByRole("dialog");
	const clearDataMenuItem = page.getByRole("menuitem", {
		name: "Clear Data",
	});
	const deleteTableMenuItem = page.getByRole("menuitem", {
		name: "Delete Table",
	});
	await page.locator('[class*="expand_icon"]').click();
	await expect(menu).toBeVisible();
	await clearDataMenuItem.click();
	await expect(menu).not.toBeVisible();

	await expect(dialog).toBeVisible();
	await expect(
		page.getByTestId("ods-dialog").getByText("Clear Data"),
	).toBeVisible();
	let cancelBtn = page.getByRole("button", { name: "CANCEL" });
	await expect(cancelBtn).toBeVisible();
	await cancelBtn.click();
	await expect(dialog).not.toBeVisible();

	await expect(dropDownBtn).toBeVisible();
	await page.locator('[class*="expand_icon"]').click();
	await expect(menu).toBeVisible();
	await clearDataMenuItem.click();
	await expect(menu).not.toBeVisible();
	await expect(dialog).toBeVisible();
	await expect(
		page.getByTestId("ods-dialog").getByText("Clear Data"),
	).toBeVisible();

	let crossIcon = page
		.getByTestId("ods-dialog-title")
		.getByTestId("ods-icon");
	await expect(crossIcon).toBeVisible();
	await crossIcon.click();
	await expect(page.getByRole("dialog")).not.toBeVisible();

	await expect(dropDownBtn).toBeVisible();
	await page.locator('[class*="expand_icon"]').click();
	await expect(menu).toBeVisible();
	await deleteTableMenuItem.click();
	await expect(menu).not.toBeVisible();
	await expect(dialog).toBeVisible();
	expect(
		page.getByTestId("ods-dialog").getByText("Delete Table"),
	).toBeVisible();
	cancelBtn = page.getByRole("button", { name: "CANCEL" });
	await expect(cancelBtn).toBeVisible();
	await cancelBtn.click();
	await expect(dialog).not.toBeVisible();

	await expect(dropDownBtn).toBeVisible();
	await page.locator('[class*="expand_icon"]').click();
	await expect(menu).toBeVisible();
	await deleteTableMenuItem.click();
	await expect(menu).not.toBeVisible();
	await expect(dialog).toBeVisible();
	expect(
		page.getByTestId("ods-dialog").getByText("Delete Table"),
	).toBeVisible();
	crossIcon = page.getByTestId("ods-dialog-title").getByTestId("ods-icon");
	await expect(crossIcon).toBeVisible();
	await crossIcon.click();
	await expect(page.getByRole("dialog")).not.toBeVisible();
}

async function verifyTableSettingsClearData({ page }) {
	const tableNameContainer = await page.getByTestId("table-name-container-1");

	await expect(tableNameContainer).toBeVisible();

	await tableNameContainer.click();

	// const countRows = async () => {
	// 	return page
	// 		.locator(
	// 			'.ht_clone_inline_start > .wtHolder > .wtHider > .wtSpreader > .htCore > tbody[role="rowgroup"] > tr',
	// 		)
	// 		.count();
	// };
	// await page.waitForTimeout(1000);

	// const rowsBefore = await countRows();

	const dropDownBtn = await tableNameContainer.locator("svg");

	await expect(dropDownBtn).toBeVisible();

	const menu = page.getByRole("menu");
	const dialog = page.getByRole("dialog");
	const clearDataMenuItem = page.getByRole("menuitem", {
		name: "Clear Data",
	});

	await page.locator('[class*="expand_icon"]').click();
	await expect(menu).toBeVisible();
	await clearDataMenuItem.click();
	await expect(menu).not.toBeVisible();

	await expect(dialog).toBeVisible();
	await expect(
		page.getByTestId("ods-dialog").getByText("Clear Data"),
	).toBeVisible();

	const submitBtn = page.getByRole("button", { name: "CLEAR" });

	await submitBtn.click();

	const response = await page.waitForResponse((resp) => {
		return (
			resp.url().includes("/record/update_records_status") &&
			resp.status() === 200
		);
	});

	expect(response.status()).toBe(200);

	await page
		.locator("div")
		.filter({ hasText: "Successfully deleted rows" })
		.nth(3)
		.waitFor({ state: "visible" });

	// const rowsAfter = await countRows();

	// await page.waitForTimeout(1000);
	// expect(rowsAfter).toBe(1);

	await expect(page.locator(".wtHolder").first()).toHaveScreenshot(
		"table-data-clear.png",
		{ maxDiffPixelRatio: 0.05 },
	);
}

async function verifyTableSettingsDeleteTable({ page }) {
	const tableNameContainer = await page.getByTestId("table-name-container-1");

	await expect(tableNameContainer).toBeVisible();

	await tableNameContainer.click();

	const dropDownBtn = tableNameContainer.locator("svg");

	await expect(dropDownBtn).toBeVisible();

	const menu = page.getByRole("menu");
	const dialog = page.getByRole("dialog");

	const deleteTableMenuItem = page.getByRole("menuitem", {
		name: "Delete Table",
	});

	await page.locator('[class*="expand_icon"]').click();
	await expect(menu).toBeVisible();
	await deleteTableMenuItem.click();
	await expect(menu).not.toBeVisible();
	await expect(dialog).toBeVisible();
	expect(
		page.getByTestId("ods-dialog").getByText("Delete Table"),
	).toBeVisible();

	const submitBtn = page.getByRole("button", { name: "DELETE" });

	await submitBtn.click();

	const response = await page.waitForResponse((resp) => {
		return (
			resp.url().includes("/table/update_tables") && resp.status() === 200
		);
	});

	expect(response.status()).toBe(200);

	const firstTableBar = await page.getByTestId("table-name-container-0");
	const firstTableBarEditor =
		await firstTableBar.getByTestId("table-name-editor");

	await expect(firstTableBarEditor).toBeVisible();
}

export {
	verifyAndUpdateTableName,
	emptyTableName,
	verifyTableSettingsRename,
	verifyTableSettingsModalCancel,
	verifyTableSettingsClearData,
	verifyTableSettingsDeleteTable,
};
