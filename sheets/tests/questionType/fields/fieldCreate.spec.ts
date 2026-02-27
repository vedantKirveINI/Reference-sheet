import { test, expect } from "@playwright/test";
import { shortTextFieldCreation } from "./shortText";
import { longTextCreateField } from "./longText";
import { numberCreateField } from "./number";
import { emailCreateField } from "./email";
import { dateCreateField } from "./date";
import { currencyCreateField } from "./currency";
import { phoneNumberCreateField } from "./phoneNumber";
import { yesNoCreateField } from "./yesNo";
import { scqCreateField } from "./scq";
import { mcqCreateField } from "./mcq";
import { dropdownCreateField } from "./dropdown";
import { timeCreateField } from "./time";
import { fileUploadCreateField } from "./fileUpload";
import { zipCodeCreateField } from "./zipCode";

test.describe("Field Creation", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJWNTU2YnA3QjIiLCJwciI6IlY1NTZicDdCMiIsImEiOiJFZjRCV2dzQm0iLCJ0IjoiY20xc3h3aXQwMGMxYjEwbGRmZjBndzV4MCIsInYiOiJjbTFzeHdpdnAwYzFjMTBsZGgwb3Rtb3RlIn0%3D`,
		);

		await page.waitForSelector(".handsontable");
		await page.getByText("Add or Import").click();

		await page.getByRole("menuitem", { name: "Add Table" }).click();
		const inputField = await page
			.getByTestId("ods-dialog")
			.getByRole("textbox");

		await inputField.click();

		await inputField.fill("table 14");

		await page.getByRole("button", { name: "ADD" }).click();

		// await page.getByTestId("table-name-container-1").waitFor({
		// 	state: "visible",
		// });
		// await page.getByTestId("table-name-container-1").click();
	});

	test.afterAll(async () => {
		await page.setViewportSize({
			width: 2430,
			height: 1080,
		});
		// const header = await page.locator(
		// 	"(//tr[@role='row' and @aria-rowindex='1'])[2]",
		// );
		const table = await page.locator(".ht_master.handsontable");
		await expect(table).toHaveScreenshot("rowheader.png", {
			maxDiffPixelRatio: 0.05,
		});
		await page.setViewportSize({
			width: 1324,
			height: 620,
		});
		await page.locator('[class*="expand_icon"]').click();
		await page.getByTestId("ods-context-menu-item").nth(3).click();
		await page.getByText("DELETE").nth(4).click();
		await page.close();
	});

	test("create field: short text", async () => {
		await shortTextFieldCreation({ page });
	});

	test("create field: long text", async () => {
		await longTextCreateField({ page });
	});

	test("create field: number", async () => {
		await numberCreateField({ page });
	});

	test("create field: email", async () => {
		await emailCreateField({ page });
	});

	test("create field: currency", async () => {
		await currencyCreateField({ page });
	});

	test("create field: phone number", async () => {
		await phoneNumberCreateField({ page });
	});

	test("create field: yes no", async () => {
		await yesNoCreateField({ page });
	});
	test("create field: scq", async () => {
		await scqCreateField({ page });
	});
	test("create field: mcq", async () => {
		await mcqCreateField({ page });
	});
	test("create field: dropdown", async () => {
		await dropdownCreateField({ page });
	});
	test("create field: date", async () => {
		await dateCreateField({ page });
	});

	test("create field: time", async () => {
		await timeCreateField({ page });
	});

	test("create field: file upload", async () => {
		await fileUploadCreateField({ page });
	});

	test("create field: zipCode", async () => {
		await zipCodeCreateField({ page });
	});
});
