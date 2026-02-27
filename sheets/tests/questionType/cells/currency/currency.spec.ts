import { test } from "@playwright/test";
import {
	clearCellToAchieveBaseCaseSetup,
	handleCurrencyCellClearOnOuterClick,
	currencyWithOnlyFlagSelected,
	currencyWithValidInput,
} from "./currency";

test.describe("Editing of currency cell", () => {
	let page;

	// Cells should be empty and field type should be Currency.
	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJ4VzduVV9LbkkiLCJwciI6InhXN25VX0tuSSIsImEiOiJDV3YxaWNJZmEiLCJ0IjoiY20xc3pxeG5jMGM4czEwbGRmYnY4bXQ2YiIsInYiOiJjbTFzenF4cTMwYzh0MTBsZDYzZW1uYWU0In0%3D`,
		);
		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Currency cell with a valid input", async () => {
		await currencyWithValidInput({ page });
	});

	test("Currency cell with only flag selected as input should become empty", async () => {
		await currencyWithOnlyFlagSelected({ page });
	});

	test("Currency cell when input is cleared without flag selection", async () => {
		await handleCurrencyCellClearOnOuterClick({
			page,
		});
	});

	test("Clear currency cell to attain initial state", async () => {
		await clearCellToAchieveBaseCaseSetup({
			page,
		});
	});
});
