import { test } from "@playwright/test";
import {
	addRecordWhenSortApplied,
	changeOrderOfRowsWhenSortApplied,
	deleteRecordsWhenSortApplied,
	multiSortRecords,
	showErrorIfEmptySortField,
	sortDateDDMMYYYYAsc,
	sortDateDDMMYYYYDesc,
	sortDateMMDDYYYYAsc,
	sortDateMMDDYYYYDesc,
	sortDateYYYYMMDDAsc,
	sortDateYYYYMMDDDesc,
	sortDropdownAsc,
	sortDropdownDesc,
	sortEmailAsc,
	sortEmailDesc,
	sortLongTextAsc,
	sortLongTextDesc,
	sortMcqAsc,
	sortMcqDesc,
	sortNumberAsc,
	sortNumberDesc,
	sortPhoneNumberAsc,
	sortPhoneNumberDesc,
	sortScqAsc,
	sortScqDesc,
	sortShortTextAsc,
	sortShortTextDesc,
	sortYesNoAsc,
	sortYesNoDesc,
	sortZipCodeAsc,
	sortZipCodeDesc,
} from "./sort";
import { clearSort } from "./utils";

/*
	Base setup for sort: 
	1 .Initially no sort shoudl be applied.
	2. Table 1 should have fields "Name", "description", "Age", "email ids", "_is verified", "fav footballer", "Your Hobbies", and "Colours" in this order.
	3. Table 2 shoudl have fields "Mobile Number", "Postal Code", "Net Income", "Date of Birth (DD/MM/YYYY)", "mm-dd-yyyy", "yyyy-mm-dd" in this order.
	4. At least 6-7 rows with sane data.
 */

// test.describe("Sorting question types", () => {
// 	let page;

// 	test.beforeAll(async ({ browser, baseURL }) => {
// 		page = await browser.newPage();
// 		await page.goto(
// 			`http://localhost:3000/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiI0ZTFQVmRPM3MiLCJ0IjoiY20yZDliZDdzMHI4MzJvb211dmQyeXptYiIsInYiOiJjbTJkOWJkYXgwcjg0Mm9vbWNkamNwa3lyIn0%3D`,
// 		);
// 		await page.waitForSelector(".handsontable");
// 	});

// 	test.afterAll(async () => {
// 		await page.close();
// 	});

// 	// Sort Test Cases
// 	test("Sort records of short text field in ascending order", async () => {
// 		await sortShortTextAsc({ page });
// 	});

// 	test("Sort records of short text field in descending order", async () => {
// 		await sortShortTextDesc({ page });
// 	});

// 	test("Sort records of long text field in ascending order", async () => {
// 		await sortLongTextAsc({ page });
// 	});

// 	test("Sort records of long text field in descending order", async () => {
// 		await sortLongTextDesc({ page });
// 	});

// 	test("Sort records of number field in ascending order", async () => {
// 		await sortNumberAsc({ page });
// 	});

// 	test("Sort records of number field in descending order", async () => {
// 		await sortNumberDesc({ page });
// 	});

// 	test("Sort records of email field in ascending order", async () => {
// 		await sortEmailAsc({ page });
// 	});

// 	test("Sort records of email field in descending order", async () => {
// 		await sortEmailDesc({ page });
// 	});

// 	test("Sort records of yes/no field in ascending order", async () => {
// 		await sortYesNoAsc({ page });
// 	});

// 	test("Sort records of yes/no field in descending order", async () => {
// 		await sortYesNoDesc({ page });
// 	});

// 	test("Sort records of scq field in ascending order", async () => {
// 		await sortScqAsc({ page });
// 	});

// 	test("Sort records of scq field in descending order", async () => {
// 		await sortScqDesc({ page });
// 	});

// 	test("Sort records of mcq field in ascending order", async () => {
// 		await sortMcqAsc({ page });
// 	});

// 	test("Sort records of mcq field in descending order", async () => {
// 		await sortMcqDesc({ page });
// 	});

// 	test("Sort records of dropdown field in ascending order", async () => {
// 		await sortDropdownAsc({ page });
// 	});

// 	test("Sort records of dropdown field in descending order", async () => {
// 		await sortDropdownDesc({ page });
// 	});

// 	test("Sort records of phone number field in ascending order", async () => {
// 		await sortPhoneNumberAsc({ page });
// 	});

// 	test("Sort records of phone number field in descending order", async () => {
// 		await sortPhoneNumberDesc({ page });
// 	});

// 	test("Sort records of zip code field in ascending order", async () => {
// 		await sortZipCodeAsc({ page });
// 	});

// 	test("Sort records of zip code field in descending order", async () => {
// 		await sortZipCodeDesc({ page });
// 	});

// 	test("Sort records of date(dd/mm/yyyy format) field in ascending order", async () => {
// 		await sortDateDDMMYYYYAsc({ page });
// 	});

// 	test("Sort records of date(dd/mm/yyyy format) field in descending order", async () => {
// 		await sortDateDDMMYYYYDesc({ page });
// 	});

// 	test("Sort records of date(mm/dd/yyyy format) field in ascending order", async () => {
// 		await sortDateMMDDYYYYAsc({ page });
// 	});

// 	test("Sort records of date(mm/dd/yyyy format) field in descending order", async () => {
// 		await sortDateMMDDYYYYDesc({ page });
// 	});

// 	test("Sort records of date(yyyy/mm/dd format) field in ascending order", async () => {
// 		await sortDateYYYYMMDDAsc({ page });
// 	});

// 	test("Sort records of date(yyyy/mm/dd format) field in descending order", async () => {
// 		await sortDateYYYYMMDDDesc({ page });
// 	});

// 	test("Sort records of multiple fields in any order", async () => {
// 		await multiSortRecords({ page });
// 	});

// 	test("Remove the applied sort", async () => {
// 		await clearSort({ page });
// 	});

// 	test("Show error below fields that are empty when trying to sort", async () => {
// 		await showErrorIfEmptySortField({ page });
// 	});

// 	test("Add record above or below when sort is applied", async () => {
// 		await addRecordWhenSortApplied({ page });
// 	});

// 	test("Delete records when sort is applied", async () => {
// 		await deleteRecordsWhenSortApplied({ page });
// 	});

// 	test("Moving records not allowed when sort is applied", async () => {
// 		await changeOrderOfRowsWhenSortApplied({ page });
// 	});
// });
