import { expect } from "@playwright/test";

async function fillAndValidateDateInput({
	page,
	cell,
	otherCell,
	inputValue,
	expectedValue,
}) {
	await page.waitForTimeout(800);

	await cell.dblclick();

	const editor = page.getByTestId("date-time-picker-editor");

	if (!inputValue) {
		await editor.click({ clickCount: 3 }); // Click to select all text
		await editor.press("Backspace");
	} else {
		await editor.type(inputValue);
	}

	await otherCell.click();

	const cellValue = await cell.textContent();

	expect(cellValue).toBe(expectedValue);
}

export const invalidDate = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	//Date format: ddmmyyyy
	const cell25 = await getCell(2, 6);
	const cell35 = await getCell(3, 6);
	await cell25.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500); // Adjust if necessary

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "99/99/000",
		expectedValue: "",
	});

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "12/30/000",
		expectedValue: "",
	});

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "12/05/000",
		expectedValue: "",
	});

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "31/09/2000",
		expectedValue: "",
	});

	//Date format: mmddyyyy
	const cell26 = await getCell(2, 7);
	const cell36 = await getCell(3, 7);
	await cell26.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500); // Adjust if necessary

	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "99/99/000",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "30/12/000",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "05/12/000",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "09/31/200",
		expectedValue: "",
	});

	//Date format: yyyymmdd
	const cell27 = await getCell(2, 8);
	const cell37 = await getCell(3, 8);
	await cell27.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500); // Adjust if necessary

	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "0000/99/9",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "0000/30/1",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "0000/05/1",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "2000/09/00",
		expectedValue: "",
	});
};

export const validDate = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	// Date Format: ddmmyyyy
	const cell25 = await getCell(2, 6);
	const cell35 = await getCell(3, 6);
	await cell25.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500);

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "01/10/2024",
		expectedValue: "01/10/2024",
	});

	// Date Format: mmddyyyy
	const cell26 = await getCell(2, 7);
	const cell36 = await getCell(3, 7);
	await cell26.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500);

	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "10/01/2024",
		expectedValue: "10/01/2024",
	});

	//Date format: yyyymmdd
	const cell27 = await getCell(2, 8);
	const cell37 = await getCell(3, 8);
	await cell27.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500);

	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "2024/10/01",
		expectedValue: "2024/10/01",
	});
};

export const leapYear = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	// Date Format: ddmmyyyy
	const cell25 = await getCell(2, 6);
	const cell35 = await getCell(3, 6);
	await cell25.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500);

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "29/02/202",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "30/02/202",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "29/02/202",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "29/02/2024",
		expectedValue: "29/02/2024",
	});

	//Date format: mmddyyyy
	const cell26 = await getCell(2, 7);
	const cell36 = await getCell(3, 7);
	await cell26.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500); // Adjust if necessary

	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "02/29/202",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "02/30/202",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "02/29/202",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "02/29/2024",
		expectedValue: "02/29/2024",
	});

	//Date format: yyyymmdd
	const cell27 = await getCell(2, 8);
	const cell37 = await getCell(3, 8);
	await cell27.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500); // Adjust if necessary

	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "2023/02/29",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "2024/02/30",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "2023/02/00",
		expectedValue: "",
	});
	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "2024/02/29",
		expectedValue: "2024/02/29",
	});
};

export const clearDateField = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	//Date format: ddmmyyyy
	const cell25 = await getCell(2, 6);
	const cell35 = await getCell(3, 6);
	await cell25.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500);

	await cell25.dblclick();
	await page.getByTestId("date-time-picker-editor").type("01/10/2024");
	await cell35.click();
	await page.waitForTimeout(500);

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "",
		expectedValue: "",
	});

	// Date Format: mmddyyyy
	const cell26 = await getCell(2, 7);
	const cell36 = await getCell(3, 7);
	await cell26.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500);

	await cell26.dblclick();
	await page.getByTestId("date-time-picker-editor").type("10/01/2024");
	await cell36.click();
	await page.waitForTimeout(500);

	await fillAndValidateDateInput({
		page,
		cell: cell26,
		otherCell: cell36,
		inputValue: "",
		expectedValue: "",
	});

	//Date format: yyyymmdd
	const cell27 = await getCell(2, 8);
	const cell37 = await getCell(3, 8);
	await cell27.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500);

	await cell27.dblclick();
	await page.getByTestId("date-time-picker-editor").type("2024/10/01");
	await cell37.click();
	await page.waitForTimeout(500);

	await fillAndValidateDateInput({
		page,
		cell: cell27,
		otherCell: cell37,
		inputValue: "",
		expectedValue: "",
	});
};

export const saveDateField = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell25 = await getCell(2, 6);
	const cell35 = await getCell(3, 6);

	await cell25.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(500); // Adjust if necessary

	await fillAndValidateDateInput({
		page,
		cell: cell25,
		otherCell: cell35,
		inputValue: "08/10/2024",
		expectedValue: "08/10/2024",
	});
	await page.waitForSelector(cell25);
	await cell25.dblclick();
	await page.getByTestId("date-time-picker-editor").fill("");
	await page.getByTestId("date-time-picker-editor").fill("08/10/2024");
	await page.getByTestId("date-time-picker-editor").blur();
};
