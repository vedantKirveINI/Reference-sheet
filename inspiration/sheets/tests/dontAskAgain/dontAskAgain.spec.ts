import { test, expect } from "@playwright/test";
import getCell from "./utils/getCell";

test.describe("Dont ask again functionality", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiIyNE5qZjBjOVciLCJ0IjoiY200aWZzMDVwMDY4cTMwY2owdWsxeDc2aiIsInYiOiJjbTRpZnMwODUwNjhyMzBjanV1cXcwYnZzIn0%3D`,
		);

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/sheet/get_sheet");
		});

		expect(response.status()).toBe(201);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await expect(page.getByTestId("table-name-container-1")).toBeVisible();
		await page.locator('[class*="expand_icon"]').click();
		await page.getByTestId("ods-context-menu-item").nth(3).click();
		await page.getByText("DELETE").nth(4).click();

		const response = await page.waitForResponse((resp) => {
			return (
				resp.url().includes("/table/update_tables") &&
				resp.status() === 200
			);
		});

		expect(response.status()).toBe(200);
		await page.close();
	});

	test("prerequiste", async () => {
		//initially there should be 3 rows only

		await page.getByText("Add or Import").click();
		await page.getByRole("menuitem", { name: "Add Table" }).click();
		await page.getByPlaceholder("Enter Table Name").click();
		await page.getByPlaceholder("Enter Table Name").fill("New Table");
		await page.getByRole("button", { name: "ADD" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/table/create_table");
		});

		expect(response.status()).toBe(201);

		await page
			.getByRole("columnheader", { name: "icon Name" })
			.getByTestId("column-short-text-0")
			.waitFor({ state: "visible" });

		await page
			.getByRole("img", { name: "Add Row Icon" })
			.waitFor({ state: "visible" });

		await page.getByRole("img", { name: "Add Row Icon" }).click();
		await page.waitForTimeout(500);

		await page.getByRole("img", { name: "Add Row Icon" }).click();
		await page.waitForTimeout(500);

		await page.getByRole("img", { name: "Add Row Icon" }).click();
		await page.waitForTimeout(500);

		await page.getByRole("img", { name: "Add Row Icon" }).click();
		await page.waitForTimeout(500);

		const cell12 = await getCell({ page, row: 2, col: 2 });

		const cell52 = await getCell({ page, row: 5, col: 2 });

		const cell62 = await getCell({ page, row: 6, col: 2 });

		const cell72 = await getCell({ page, row: 7, col: 2 });

		const cell82 = await getCell({ page, row: 8, col: 2 });

		await page.waitForTimeout(500);

		await cell52.dblclick();
		expect(await page.getByTestId("text-editor")).toBeVisible();

		await page
			.locator(".ht_clone_master")
			.getByTestId("text-editor")
			.fill("John Snow");
		await cell12.click();

		await page.getByText("John Snow").waitFor({ state: "visible" });
		await page.waitForTimeout(800);

		await cell62.dblclick();
		expect(await page.getByTestId("text-editor")).toBeVisible();

		await page
			.locator(".ht_clone_master")
			.getByTestId("text-editor")
			.fill("Danerys");
		await cell12.click();

		await page.getByText("Danerys").waitFor({ state: "visible" });
		await page.waitForTimeout(800);

		await cell72.dblclick();
		expect(await page.getByTestId("text-editor")).toBeVisible();

		await page
			.locator(".ht_clone_master")
			.getByTestId("text-editor")
			.fill("Night King");
		await cell12.click();

		await page.getByText("Night King").waitFor({ state: "visible" });
		await page.waitForTimeout(800);

		await cell82.dblclick();
		expect(await page.getByTestId("text-editor")).toBeVisible();
		await page
			.locator(".ht_clone_master")
			.getByTestId("text-editor")
			.fill("Tyrion");
		await cell12.click();

		await page.getByText("Tyrion").waitFor({ state: "visible" });
		await page.waitForTimeout(800);
	});

	test("checking checkbox state after clicking cancel", async () => {
		await page.locator("div").filter({ hasText: /^4$/ }).nth(1).click();
		await page
			.locator(".ht_clone_left")
			.locator("tbody")
			.locator("#checkbox_3")
			.click({
				button: "right",
			});

		await expect(page.getByTestId("remove-row")).toBeVisible();

		await page.getByTestId("remove-row").click();

		await expect(page.getByRole("dialog")).toBeVisible();

		await expect(
			page.getByRole("button", { name: "CANCEL" }),
		).toBeVisible();

		await page.getByRole("button", { name: "CANCEL" }).click();

		await expect(page.getByRole("checkbox").nth(1)).toBeVisible();
		await expect(page.getByRole("checkbox").nth(1)).toBeChecked();
	});

	test("dont ask again value to be true", async () => {
		await page.evaluate(() => {
			window.localStorage.setItem(
				"permissionMeta",
				JSON.stringify({ record_dont_ask: true }),
			);
		});

		await page.locator("div").filter({ hasText: /^4$/ }).nth(1).click();
		await page
			.locator(".ht_clone_left")
			.locator("tbody")
			.locator("#checkbox_3")
			.click({
				button: "right",
			});

		await expect(page.getByTestId("remove-row")).toBeVisible();

		await page.getByTestId("remove-row").click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/record/update_records_status");
		});

		expect(response.status()).toBeGreaterThanOrEqual(200);
		expect(response.status()).toBeLessThan(300);

		const permissionMeta = await page.evaluate(() => {
			try {
				return (
					JSON.parse(window.localStorage.getItem("permissionMeta")) ||
					{}
				);
			} catch (e) {
				return {};
			}
		});

		const { record_dont_ask } = permissionMeta || {};

		expect(record_dont_ask).toBe(true);
	});

	test("dont ask again value to be false", async () => {
		await page.evaluate(() => {
			window.localStorage.setItem(
				"permissionMeta",
				JSON.stringify({ record_dont_ask: false }),
			);
		});

		await page.locator("div").filter({ hasText: /^4$/ }).nth(1).click();
		await page
			.locator(".ht_clone_left")
			.locator("tbody")
			.locator("#checkbox_3")
			.click({
				button: "right",
			});

		await expect(page.getByTestId("remove-row")).toBeVisible();

		await page.getByTestId("remove-row").click();

		await expect(page.getByRole("dialog")).toBeVisible();

		let deleteBtn = await page.getByRole("button", {
			name: "DELETE",
			exact: true,
		});
		await expect(deleteBtn).toBeVisible();
		await deleteBtn.click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/record/update_records_status");
		});

		expect(response.status()).toBeGreaterThanOrEqual(200);
		expect(response.status()).toBeLessThan(300);

		const permissionMeta = await page.evaluate(() => {
			try {
				return (
					JSON.parse(window.localStorage.getItem("permissionMeta")) ||
					{}
				);
			} catch (e) {
				return {};
			}
		});

		const { record_dont_ask } = permissionMeta || {};

		expect(record_dont_ask).toBe(false);
	});

	test("setting dont ask again from false to true", async () => {
		await page.evaluate(() => {
			window.localStorage.setItem(
				"permissionMeta",
				JSON.stringify({ record_dont_ask: false }),
			);
		});
		await page.locator("div").filter({ hasText: /^4$/ }).nth(1).click();
		await page
			.locator(".ht_clone_left")
			.locator("tbody")
			.locator("#checkbox_3")
			.click({
				button: "right",
			});

		await expect(page.getByTestId("remove-row")).toBeVisible();

		await page.getByTestId("remove-row").click();

		await expect(page.getByRole("dialog")).toBeVisible();

		await expect(
			page
				.getByTestId("ods-dialog-actions")
				.locator("div")
				.filter({ hasText: "Don’t show this message again" })
				.nth(1),
		).toBeVisible();
		await page.getByRole("checkbox").check();

		let deleteBtn = await page.getByRole("button", {
			name: "DELETE",
			exact: true,
		});
		await expect(deleteBtn).toBeVisible();
		await deleteBtn.click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/record/update_records_status");
		});

		expect(response.status()).toBeGreaterThanOrEqual(200);
		expect(response.status()).toBeLessThan(300);

		const permissionMeta = await page.evaluate(() => {
			try {
				return (
					JSON.parse(window.localStorage.getItem("permissionMeta")) ||
					{}
				);
			} catch (e) {
				return {};
			}
		});

		const { record_dont_ask } = permissionMeta || {};

		expect(record_dont_ask).toBe(true);

		await page.locator("div").filter({ hasText: /^4$/ }).nth(1).click();
		await page
			.locator(".ht_clone_left")
			.locator("tbody")
			.locator("#checkbox_3")
			.click({
				button: "right",
			});

		//await page.waitForTimeout(30000);
		await expect(page.getByTestId("remove-row")).toBeVisible();

		await page.getByTestId("remove-row").click();
		await expect(page.getByRole("dialog")).not.toBeVisible();

		const response2 = await page.waitForResponse((res) => {
			return res.url().includes("/record/update_records_status");
		});

		expect(response2.status()).toBeGreaterThanOrEqual(200);
		expect(response2.status()).toBeLessThan(300);
	});

	test("dont ask again checkbox should not be visible in clear and delete column", async () => {
		const dropDownBtn = await page
			.getByRole("columnheader", { name: "icon Name" })
			.locator("button");
		await expect(dropDownBtn).toBeVisible();
		await dropDownBtn.click();

		await expect(page.getByRole("table")).toBeVisible();
		await expect(page.getByTestId("clear-column")).toBeVisible();
		await page.getByTestId("clear-column").click();

		await expect(page.getByRole("dialog")).toBeVisible();

		await expect(
			page
				.getByTestId("ods-dialog-actions")
				.locator("div")
				.filter({ hasText: "Don’t show this message again" })
				.nth(1),
		).not.toBeVisible();

		await page
			.getByTestId("ods-dialog-title")
			.getByTestId("ods-icon")
			.click();

		await page
			.getByRole("columnheader", { name: "icon Add" })
			.getByTestId("column-add-1")
			.click();
		//await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("test");
		await page
			.getByTestId("ods-autocomplete")
			.locator("input")
			.nth(1)
			.click();

		await page.getByRole("option", { name: "Long Text" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		await page.waitForTimeout(1000);

		await page
			.getByRole("columnheader", { name: "icon test" })
			.locator("button")
			.click();
		await page.getByTestId("remove-column").click();

		await expect(
			page
				.getByTestId("ods-dialog-actions")
				.locator("div")
				.filter({ hasText: "Don’t show this message again" })
				.nth(1),
		).not.toBeVisible();

		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_fields_status");
		});

		expect(response.status()).toBeGreaterThanOrEqual(200);
		expect(response.status()).toBeLessThan(300);
	});
});
