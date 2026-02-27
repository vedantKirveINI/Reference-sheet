import { test } from "@playwright/test";
import {
	filterNumberWithEqualToCondition,
	filterNumberWithGreaterThanCondition,
	filterNumberWithLessThanCondition,
	filterNumberWithNotEqualToCondition,
	filterTextWithContainsCondition,
	filterTextWithDoesNotContainsCondition,
	filterTextWithIsCondition,
	filterTextWithIsEmptyCondition,
	filterTextWithIsNotCondition,
	filterTextWithIsNotEmptyCondition,
} from "./filter";

// test.describe("Filter Question Types", () => {
// 	let page;

// 	test.beforeAll(async ({ browser, baseURL }) => {
// 		page = await browser.newPage();
// 		await page.goto(
// 			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiIyMGVwRDkxRVMiLCJ0IjoiY20ybHJib3FoMDBtM3UyMTRxaXJ2bXY5ZCIsInYiOiJjbTJscmJvdHAwMG00dTIxNHk5OTZ3YjI4In0%3D`,
// 		); // changed goto url to apply filter as it doens't work on dev environment.

// 		await page.waitForSelector(".handsontable");
// 	});

// 	test.afterAll(async () => {
// 		await page.close();
// 	});

// 	// Filter Test Cases
// 	test("Filter records of text field type with condition 'contains' ", async () => {
// 		await filterTextWithContainsCondition({ page });
// 	});

// 	test("Filter records of text field type with condition 'does not contains' ", async () => {
// 		await filterTextWithDoesNotContainsCondition({ page });
// 	});

// 	test("Filter records of text field type with condition 'is' ", async () => {
// 		await filterTextWithIsCondition({ page });
// 	});

// 	test("Filter records of text field type with condition 'is not' ", async () => {
// 		await filterTextWithIsNotCondition({ page });
// 	});

// 	test("Filter records of text field type with condition 'is empty' ", async () => {
// 		await filterTextWithIsEmptyCondition({ page });
// 	});

// 	test("Filter records of text field type with condition 'is not empty' ", async () => {
// 		await filterTextWithIsNotEmptyCondition({ page });
// 	});

// 	test("Filter records of number field type with condition '=' ", async () => {
// 		await filterNumberWithEqualToCondition({ page });
// 	});

// 	test("Filter records of number field type with condition '>' ", async () => {
// 		await filterNumberWithGreaterThanCondition({ page });
// 	});

// 	test("Filter records of number field type with condition '<' ", async () => {
// 		await filterNumberWithLessThanCondition({ page });
// 	});
// });
