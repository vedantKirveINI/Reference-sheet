import { expect } from "@playwright/test";

import {
	applySortAndTakeScreenshot,
	openSort,
	selectFieldToSort,
	selectOrderOfSort,
} from "./utils";

async function sortShortTextAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Name" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-short-text.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortShortTextDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-short-text.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortLongTextAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "description" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-long-text.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortLongTextDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-long-text.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortNumberAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Age" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-number.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortNumberDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-number.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortEmailAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "email ids" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-email.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortEmailDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-email.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortYesNoAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "_is verified" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-yes-no.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortYesNoDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-yes-no.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortScqAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "fav footballer" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-scq.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortScqDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-scq.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortMcqAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Your Hobbies" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-mcq.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortMcqDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-mcq.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDropdownAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Colours" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-dropdown.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDropdownDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-dropdown.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortPhoneNumberAsc({ page }) {
	// to change to the correct table
	await page.getByText("Sort other 8 types").click();
	await page.waitForSelector(".handsontable");

	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Mobile Number" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-phone-number.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortPhoneNumberDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-phone-number.png",
		maxDiffPixelRatio: 0.03,
	});
}
async function sortZipCodeAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Postal Code" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-zip-code.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortZipCodeDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-zip-code.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDateDDMMYYYYAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Date of Birth (DD/MM/YYYY)" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-date-dd-mm-yyyy.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDateDDMMYYYYDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-date-dd-mm-yyyy.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDateMMDDYYYYAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "mm-dd-yyyy" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-date-mm-dd-yyyy.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDateMMDDYYYYDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-date-mm-dd-yyyy.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDateYYYYMMDDAsc({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "yyyy-mm-dd" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "asc-sort-date-yyyy-mm-dd.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function sortDateYYYYMMDDDesc({ page }) {
	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });
	await applySortAndTakeScreenshot({
		page,
		screenshotName: "desc-sort-date-yyyy-mm-dd.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function multiSortRecords({ page }) {
	await page.getByText("Sort for 8 types").click();

	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Age" });
	await selectOrderOfSort({ page, orderName: "Ascending" });
	await page.getByRole("button", { name: "ADD ANOTHER SORT" }).click();

	await page.getByLabel("Open").nth(2).click();
	await page.getByRole("option", { name: "Name" }).click();
	await page.getByLabel("Open").nth(3).click();
	await page.getByRole("option", { name: "Descending" }).click();

	await applySortAndTakeScreenshot({
		page,
		screenshotName: "multi-sort-age-name.png",
		maxDiffPixelRatio: 0.03,
	});
}

async function showErrorIfEmptySortField({ page }) {
	await openSort({ page });

	await page.getByRole("button", { name: "ADD ANOTHER SORT" }).click();
	await page.getByLabel("Open").nth(3).click();
	await page.getByRole("option", { name: "Descending" }).click();

	await applySortAndTakeScreenshot({
		page,
		screenshotName: "sort-with-empty-field.png",
		maxDiffPixelRatio: 0.03,
	});

	await page.getByRole("button", { name: "CANCEL" }).click();
}

async function addRecordWhenSortApplied({ page }) {
	await openSort({ page });
	await selectFieldToSort({ page, fieldName: "Name" });
	await selectOrderOfSort({ page, orderName: "Ascending" });

	await page.getByRole("button", { name: "SORT", exact: true }).click();

	await page.waitForTimeout(1000);
	await page.getByRole("gridcell", { name: "Rahul", exact: true }).click();
	await page.getByRole("gridcell", { name: "Rahul", exact: true }).click({
		button: "right",
	});
	await page.getByTestId("row-above").click();

	await expect(page).toHaveScreenshot("insert-row-above-in-sort.png", {
		fullPage: true,
		maxDiffPixelRatio: 0.03,
	});

	await openSort({ page });
	await selectOrderOfSort({ page, orderName: "Descending" });

	await page.getByRole("button", { name: "SORT", exact: true }).click();

	await page.getByRole("gridcell", { name: "Rahul", exact: true }).click({
		button: "right",
	});
	await page.getByTestId("row-below").click();

	await expect(page).toHaveScreenshot("insert-row-below-in-sort.png", {
		fullPage: true,
		maxDiffPixelRatio: 0.03,
	});
}

async function deleteRecordsWhenSortApplied({ page }) {
	await page.getByRole("row", { name: "7" }).locator("#checkbox_6").check();
	await page.getByRole("row", { name: "8" }).locator("#checkbox_7").check();
	await page.getByRole("row", { name: "7" }).locator("div").click({
		button: "right",
	});
	await page.getByTestId("remove-row").click();

	await expect(page).toHaveScreenshot("delete-records-in-sort.png", {
		fullPage: true,
		maxDiffPixelRatio: 0.03,
	});
}

async function changeOrderOfRowsWhenSortApplied({ page }) {
	await page.getByRole("rowheader", { name: "4" }).locator("div").click();

	await page.dragAndDrop(
		"(//tr[@aria-rowindex=6])[2]",
		"(//tr[@aria-rowindex=3])[2]",
	);

	await expect(page).toHaveScreenshot("move-records-in-sort.png", {
		fullPage: true,
		maxDiffPixelRatio: 0.03,
	});

	await page.getByTestId("sort-option").click();
	await page.locator("form svg").nth(2).click();
	await page.getByRole("button", { name: "SORT", exact: true }).click();
}

export {
	sortShortTextAsc,
	sortShortTextDesc,
	sortLongTextAsc,
	sortLongTextDesc,
	sortNumberAsc,
	sortNumberDesc,
	sortEmailAsc,
	sortEmailDesc,
	sortYesNoAsc,
	sortYesNoDesc,
	sortScqAsc,
	sortScqDesc,
	sortMcqAsc,
	sortMcqDesc,
	sortDropdownAsc,
	sortDropdownDesc,
	sortPhoneNumberAsc,
	sortPhoneNumberDesc,
	sortZipCodeAsc,
	sortZipCodeDesc,
	sortDateDDMMYYYYAsc,
	sortDateDDMMYYYYDesc,
	sortDateMMDDYYYYAsc,
	sortDateMMDDYYYYDesc,
	sortDateYYYYMMDDAsc,
	sortDateYYYYMMDDDesc,
	multiSortRecords,
	showErrorIfEmptySortField,
	addRecordWhenSortApplied,
	deleteRecordsWhenSortApplied,
	changeOrderOfRowsWhenSortApplied,
};
