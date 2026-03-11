import { test } from "@playwright/test";
import {
	clearScqData,
	scqShouldHaveOnlyOneOption,
	scqTestSaveOptionOnOuterClick,
	scqTestToChooseAnOption,
} from "./singleChoice";
import {
	mcqDeselectOptions,
	mcqNoDuplicateValuesOnSameSelection,
	mcqRemoveOption,
	mcqSelectOptionsAndSaveOnEnter,
} from "./multiChoice";
import {
	numberEditorWithInvalidInput,
	numberEditorWithValidInput,
} from "./number";
import {
	emailEditorWithInvalidInput,
	emailEditorWithValidInput,
} from "./email";
import {
	timeSaveOnEnterClick,
	timeWhenInputIsClearedOnEnterClick,
	timeWhenInputIsClearedOnOuterClick,
	timeWithInputIn12hrFormatOnOuterClick,
	timeWithInputIn24hrFormat,
	timeWithInvalidInputIn12hrFormat,
	timeWithInvalidInputIn24hrFormat,
	timeWithOnlyMeridiemSelected,
} from "./time";
import {
	cancellingEditFields,
	clearAll,
	editingOfCellOfAddressType,
	savingEmptyValue,
} from "./Address";
import {
	phoneNumberWithValidInputSaveOnOuterClick,
	phoneNumberInputSaveOnEnterClick,
	phoneNumberWithOnlyFlagSelection,
	phoneNumberWhenInputIsClearedWithoutFlagSelection,
} from "./PhoneNumber";
import {
	zipCodeInputClearedWithoutFlagSelection,
	zipCodeWithInvalidInput,
	zipCodeWithValidInputSaveOnEnterClick,
	zipCodeWithValidInputSaveOnOuterClick,
} from "./zipCode";

test.describe("Editing of cell", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJMcTFYN3hYR0giLCJwciI6IkxxMVg3eFhHSCIsImEiOiJIc3RTNVJJRTciLCJ0IjoiY20xNnIxN3gxMDBpdzEyaG1tc3p1NjMweCIsInYiOiJjbTE2cjE3emkwMGl4MTJobWswNW16YjM2In0%3D`,
		);
		//await page.waitForSelector(".handsontable");
		await page.waitForSelector(".handsontable", { state: "visible" });
	});

	// test.afterAll(async () => {
	// 	await page.close();
	// });

	// Helper function to get a cell by row and column index
	const getCell: any = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	// ADDRESS TESTS
	test("Cancelling edits after clearing input fields retains original data in the grid cell", async () => {
		await cancellingEditFields({ page });
	});

	test("Clear all function in address type", async () => {
		await clearAll({ page });
	});

	test("Saving edits after clearing input fields updates grid cell to empty values", async () => {
		await savingEmptyValue({ page });
	});

	test("Editing of cell of Address type", async () => {
		await editingOfCellOfAddressType({ page });
	});

	// Scq Tests
	test("Edit Cell: Single Choice on enter click", async () => {
		await scqTestToChooseAnOption({ page });
	});

	test("Edit Cell: Single Choice on outer click", async () => {
		await scqTestSaveOptionOnOuterClick({ page });
	});

	test("Edit Cell: Single Choice should display only one option even on multiple clicks", async () => {
		await scqShouldHaveOnlyOneOption({ page });
	});

	// reach base case of scq test cases
	test("Edit Cell: Clear cell that have scq options", async () => {
		await clearScqData({ page });
	});

	// Mcq Tests
	/* MCQ cell should be empty initially */
	test("Edit Cell: MCQ editor allows selecting one or multiple options", async () => {
		await mcqSelectOptionsAndSaveOnEnter({ page });
	});

	/* MCQ cell should have abhay, vedant as options initially */
	test("Edit Cell: MCQ editor allows deselecting options", async () => {
		await mcqDeselectOptions({ page });
	});

	/* MCQ cell should be empty initially */
	test("Edit Cell: MCQ editor no duplicate values on same selection", async () => {
		await mcqNoDuplicateValuesOnSameSelection({ page: page });
	});

	/* MCQ cell should be empty initially */
	test("Edit Cell: MCQ editor remove options when clicked on X", async () => {
		await mcqRemoveOption({ page: page });
	});

	// Number Tests
	test("Edit Cell: Number Editor with valid input", async () => {
		await numberEditorWithValidInput({ page });
	});

	test("Edit Cell: Number Editor with invalid input", async () => {
		await numberEditorWithInvalidInput({ page });
	});

	// Email Tests
	test("Edit Cell: Email Editor with valid input", async () => {
		await emailEditorWithValidInput({ page });
	});

	test("Edit Cell: Email Editor with invalid input", async () => {
		await emailEditorWithInvalidInput({ page });
	});

	// Time Tests
	/* Time cell should be empty initially */
	test("Edit Cell: Time Editor with valid input in 12hr format on outer click", async () => {
		await timeWithInputIn12hrFormatOnOuterClick({ page });
	});

	/* Time cell should be empty initially */
	test("Edit Cell: Time Editor with invalid input in 12hr format", async () => {
		await timeWithInvalidInputIn12hrFormat({ page });
	});

	/* Time cell should have 09:30 AM as value initially */
	test("Edit Cell: Time Editor with only meridiem input in 12hr format", async () => {
		await timeWithOnlyMeridiemSelected({ page });
	});

	/* Time cell should be empty initially */
	test("Edit Cell: Time Editor with valid input in 24hr format", async () => {
		await timeWithInputIn24hrFormat({ page });
	});

	/* Time cell should be empty initially */
	test("Edit Cell: Time Editor with invalid input in 24hr format", async () => {
		await timeWithInvalidInputIn24hrFormat({ page });
	});

	/* Time cell should have some value initially */
	test("Edit Cell: Time Editor when input is cleared on enter click", async () => {
		await timeWhenInputIsClearedOnEnterClick({ page });
	});

	/* Time cell should be empty initially */
	test("Edit Cell: Time Editor should save input on enter click too", async () => {
		await timeSaveOnEnterClick({ page });
	});

	/* Time cell should have some value initially */
	test("Edit Cell: Time Editor should clear input on outer click too", async () => {
		await timeWhenInputIsClearedOnOuterClick({ page });
	});

	// Phone Numnber Tests
	/* Phone number cell should be empty */
	test("Edit Cell: Phone Number Editor with valid input on outer click", async () => {
		await phoneNumberWithValidInputSaveOnOuterClick({ page });
	});

	/* Phone number cell should be empty */
	test("Edit Cell: Phone Number Editor with valid input on enter click ", async () => {
		await phoneNumberInputSaveOnEnterClick({ page });
	});

	/* Phone number cell should be empty */
	test("Edit Cell: Phone Number Editor on only flag selection, cell should be blank ", async () => {
		await phoneNumberWithOnlyFlagSelection({ page });
	});

	/* Phone number cell should have some phone number with a flag */
	test("Edit Cell: Phone Number cell should be empty if input is cleared/empty with no flag selection ", async () => {
		await phoneNumberWhenInputIsClearedWithoutFlagSelection({ page });
	});

	// Zip Code Tests
	test("Edit Cell: Zip Code cell with valid input on enter click", async () => {
		await zipCodeWithValidInputSaveOnEnterClick({ page });
	});

	test("Edit Cell: Zip Code cell with input on outer click", async () => {
		await zipCodeWithValidInputSaveOnOuterClick({ page });
	});

	test("Edit Cell: Zip Code clear input without flag being selected", async () => {
		await zipCodeInputClearedWithoutFlagSelection({ page });
	});

	test("Edit Cell: Zip Code with invalid input", async () => {
		await zipCodeWithInvalidInput({ page });
	});
});
