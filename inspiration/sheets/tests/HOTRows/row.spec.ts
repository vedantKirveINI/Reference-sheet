import { test, expect } from "@playwright/test";
import { getByText } from "@testing-library/react";

test.describe("HOT ROW related Test cases", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		//intially the test case should have 6 rows 5 row should have Vedant and 6 row should have Shubham
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiItQ0Q0NnlPNWEiLCJ0IjoiY20yYmxwOThzMDUxdDJvb20ybTFqN2wwYSIsInYiOiJjbTJibHA5YXkwNTF1Mm9vbXR4cGxxcWR1In0%3D`,
		);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Insert a Row by clicking add Icon", async () => {
		await page.getByText("Add or Import").click();

		await page.getByRole("menuitem", { name: "Add Table" }).click();

		await expect(page.getByRole("textbox")).toBeVisible();

		const inputField = await page
			.getByTestId("ods-dialog")
			.getByRole("textbox");

		await inputField.click();

		await inputField.fill("New Table");

		await page.getByRole("button", { name: "ADD" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/table/create_table");
		});

		expect(response.status()).toBe(201);

		await expect(page.getByRole("alert")).toBeVisible();
		await page
			.getByRole("columnheader", { name: "icon Name" })
			.getByTestId("column-short-text-0")
			.waitFor({ state: "visible" });

		const rowsBefore = 7;
		await page.getByRole("rowheader", { name: "Add Row Icon" }).click();
		await page.waitForTimeout(800);

		await page.getByRole("rowheader", { name: "Add Row Icon" }).click();
		await page.waitForTimeout(800);

		await page.getByRole("rowheader", { name: "Add Row Icon" }).click();
		await page.waitForTimeout(800);

		await expect(
			page.locator("tr:nth-child(5) > td").first(),
		).toBeVisible();

		await page.waitForTimeout(800);

		await page.locator("tr:nth-child(5) > td").first().dblclick();
		expect(await page.getByTestId("text-editor")).toBeVisible();
		await page.getByTestId("text-editor").fill("Vedant");

		await page.locator("tr:nth-child(3) > td").first().click();

		await expect(
			page.getByRole("gridcell", { name: "Vedant" }),
		).toBeVisible();

		await expect(
			page.locator("tr:nth-child(6) > td").first(),
		).toBeVisible();

		await page.waitForTimeout(800);
		await page.locator("tr:nth-child(6) > td").first().dblclick();
		expect(await page.getByTestId("text-editor")).toBeVisible();
		await page.getByTestId("text-editor").fill("Shubham");

		await page.locator("tr:nth-child(3) > td").first().click();

		await expect(
			page.getByRole("gridcell", { name: "Shubham" }),
		).toBeVisible();

		await page
			.getByRole("row", { name: "Add Row Icon" })
			.locator("div")
			.click();

		await page.waitForTimeout(800);
		await page.getByRole("gridcell", { name: "Vedant" }).click();

		const rowsAfter = await page
			.locator(
				'.ht_clone_inline_start > .wtHolder > .wtHider > .wtSpreader > .htCore > tbody[role="rowgroup"] > tr',
			)
			.count();

		expect(rowsAfter).toBe(rowsBefore + 1);
	});

	test("Delete a Row by clicking delete Icon", async () => {
		await page.getByTestId("table-name-container-2").click();

		await page.getByRole("rowheader", { name: "7" }).click({
			button: "right",
		});

		await page.getByTestId("remove-row").click();

		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const deleteResponse = await page.waitForResponse((res) => {
			return res.url().includes("/record/update_records_status");
		});

		expect(deleteResponse.status()).toBe(200);

		// Check for the success alert message
		const alert = page.getByRole("alert");

		await expect(alert).toBeVisible();
		await expect(page.getByText("Successfully deleted rows")).toContainText(
			"Successfully deleted rows",
		);
	});

	test("Insert Below a Row", async () => {
		await page.getByTestId("table-name-container-2").click();
		await page.getByRole("gridcell", { name: "Vedant" }).click({
			button: "right",
		});

		await page.getByText("Insert row below").click();
		await page.waitForTimeout(2000);

		await expect(
			page.locator('div.wtHider[role="presentation"]').first(),
		).toHaveScreenshot("insert-below.png", {
			maxDiffPixelRatio: 0.05,
		});
	});

	test("Insert Above a Row", async () => {
		await page.getByTestId("table-name-container-2").click();
		await page.getByRole("gridcell", { name: "Shubham" }).click();
		await page.getByRole("gridcell", { name: "Shubham" }).click({
			button: "right",
		});
		await page.getByText("Insert row above").click();

		await page.waitForTimeout(2000);

		await expect(
			page.locator('div.wtHider[role="presentation"]').first(),
		).toHaveScreenshot("insert-row.png", {
			maxDiffPixelRatio: 0.05,
		});
	});

	test("Deleting Multiple Records", async () => {
		await page.getByTestId("table-name-container-2").click();
		await page.locator("div").filter({ hasText: /^6$/ }).nth(1).click();
		await page.locator("div").filter({ hasText: /^7$/ }).nth(1).click();

		await page
			.locator("tbody")
			.filter({ hasText: "12345678" })
			.locator("#checkbox_5")
			.first()
			.click({
				button: "right",
			});

		// Click the delete option from context menu
		await page.getByTestId("remove-row").click();

		// Confirm deletion
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const deleteResponse = await page.waitForResponse((res) => {
			return res.url().includes("/record/update_records_status");
		});

		expect(deleteResponse.status()).toBe(200);

		// Verify the success message
		const alert = page.getByRole("alert");
		await expect(alert).toBeVisible();
		await expect(alert).toHaveText("Successfully deleted rows");
	});

	test("Deleting Mutlipler Records with shift select", async () => {
		await page.getByTestId("table-name-container-2").click();
		await page
			.getByRole("row", { name: "Add Row Icon" })
			.locator("div")
			.click();

		//	await page.waitForTimeout(1000);

		await page
			.getByRole("row", { name: "Add Row Icon" })
			.locator("div")
			.click();

		await page.locator("div").filter({ hasText: /^7$/ }).nth(1).click();
		await page
			.locator("div")
			.filter({ hasText: /^8$/ })
			.nth(1)
			.click({
				modifiers: ["Shift"],
			});

		await page
			.locator("tbody")
			.filter({ hasText: "12345678" })
			.locator("#checkbox_7")
			.first()
			.click({
				button: "right",
			});

		// Click the delete option from context menu
		await page.getByTestId("remove-row").click();

		// Confirm deletion
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/record/update_records_status");
		});

		expect(response.status()).toBe(200);

		await expect(page.getByText("Successfully deleted rows")).toBeVisible();

		await page.locator('[class*="expand_icon"]').click();
		await page.getByTestId("ods-context-menu-item").nth(3).click();
		await page.getByText("DELETE").nth(4).click();

		const deleteTableresponse = await page.waitForResponse((resp) => {
			return (
				resp.url().includes("/table/update_tables") &&
				resp.status() === 200
			);
		});

		expect(deleteTableresponse.status()).toBe(200);
	});
});
