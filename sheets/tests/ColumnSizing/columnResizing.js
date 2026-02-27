import { expect } from "@playwright/test";

import {
	matchScreenShot,
	performColumnResizeEvent,
	waitForElementToBeVisible,
	waitForResponseAndCheckStatus,
} from "../utils/helper";

async function resizeColumnWidthsWithImportCSV({ page }) {
	await page.getByText("Add or Import").click();
	await page
		.getByRole("menuitem", { name: "Import File into a new table" })
		.click();

	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("Table to resize column");
	await page.getByRole("button", { name: "PROCEED" }).click();

	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/industry.csv",
	);

	await page.getByRole("button", { name: "IMPORT" }).click();
	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByRole("button", { name: "Open" }).click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	const addCsvToNewTableResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/add_csv_data_to_new_table");
	});

	expect(addCsvToNewTableResponse.status()).toBe(201);

	await page
		.getByRole("columnheader", { name: "icon Industry" })
		.getByTestId("column-short-text-0")
		.waitFor({ state: "visible" });

	await page
		.getByRole("columnheader", { name: "icon Industry" })
		.getByTestId("column-short-text-0")
		.click();

	await performColumnResizeEvent({ page, dragDistance: 150 });

	// Importing csv in current table
	await page.locator('[class*="expand_icon"]').click();
	await expect(
		page.getByRole("menuitem", { name: "Import Table" }),
	).toHaveText("Import Table");

	await page.getByText("Import Table").click();

	const newFileInput = await page.locator('input[type="file"]');
	await newFileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/customers-100.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByText("To existing column").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByText("Map Data Type").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	const elements = await page.getByTestId("ods-text-field");

	const count = (await elements.count()) - 8;

	const selectOption = async (optionName) => {
		await page.getByRole("option", { name: optionName }).click();
	};

	for (let i = 0; i < count; i++) {
		await elements.nth(i).click();

		const optionName = [0, 7, 8].includes(i) ? "Number" : "Short Text";
		await selectOption(optionName);
	}

	await page.getByRole("button", { name: "PROCEED" }).click();

	const response = await page.waitForResponse((response) =>
		response.url().includes("/table/add_csv_data_to_existing_table"),
	);

	// Assert the response status
	expect(response.status()).toBe(201);

	await page
		.getByRole("columnheader", { name: "icon Industry" })
		.getByTestId("column-short-text-0")
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "import-after-column-resize.png",
	});

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();

	const deleteResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/update_tables");
	});
	expect(deleteResponse.status()).toBe(200);
}

async function addOrDeleteFieldWithColumnResize({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByRole("menuitem", { name: "Add Table" }).click();
	await page.getByRole("textbox", { name: "Enter Table Name" }).click();
	await page
		.getByRole("textbox", { name: "Enter Table Name" })
		.fill("my new table");
	await page.getByRole("button", { name: "ADD" }).click();

	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/create_table",
		expectedStatus: 201,
	});

	await page
		.getByRole("columnheader", { name: "icon Name" })
		.getByTestId("column-short-text-0")
		.waitFor({ state: "visible" });

	await page
		.getByRole("columnheader", { name: "icon Name" })
		.getByTestId("column-short-text-0")
		.click();

	await performColumnResizeEvent({ page, dragDistance: 150 });

	await page.getByRole("gridcell").nth(1).click();
	await waitForElementToBeVisible({
		page,
		locator: page
			.getByRole("columnheader", { name: "icon Name" })
			.locator("button"),
		targetLocator: page.getByTestId("col-right"),
		retryInterval: 500,
		maxRetries: 3,
	});

	await expect(page.getByTestId("col-right")).toBeVisible();

	await page.getByTestId("col-right").click();
	await page.getByRole("textbox", { name: "Enter field name" }).click();
	await page
		.getByRole("textbox", { name: "Enter field name" })
		.fill("new field");
	await page.getByRole("button", { name: "Open" }).click();
	await page.getByRole("option", { name: "Long Text" }).click();
	await page.getByRole("button", { name: "SAVE" }).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/field/create_field",
		expectedStatus: 201,
	});

	await page
		.getByRole("columnheader", { name: "icon new field" })
		.getByTestId("column-long-text-1")
		.waitFor({ state: "visible" });

	await page
		.getByRole("columnheader", { name: "icon new field" })
		.getByTestId("column-long-text-1")
		.click();

	await performColumnResizeEvent({ page, dragDistance: -50 });
	await page.locator(".ht__row_even > td").first().click();

	await waitForElementToBeVisible({
		page,
		locator: page
			.getByRole("columnheader", { name: "icon new field" })
			.locator("button"),
		targetLocator: page.getByTestId("col-left"),
		retryInterval: 500,
		maxRetries: 3,
	});

	await expect(page.getByTestId("col-left")).toBeVisible();
	await page.getByTestId("col-left").click();
	await page.getByRole("button", { name: "Open" }).click();
	await page.getByRole("option", { name: "Number", exact: true }).click();
	await page.getByRole("textbox", { name: "Enter field name" }).click();
	await page
		.getByRole("textbox", { name: "Enter field name" })
		.fill("Num field");
	await page.getByRole("button", { name: "SAVE" }).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/field/create_field",
		expectedStatus: 201,
	});

	await page
		.getByRole("columnheader", { name: "icon Num field" })
		.getByTestId("column-number-1")
		.click();
	await performColumnResizeEvent({ page, dragDistance: 200 });
	await page.locator(".ht__row_even > td").first().click();

	await waitForElementToBeVisible({
		page,
		locator: page
			.getByRole("columnheader", { name: "icon Num field" })
			.locator("button"),
		targetLocator: page.getByTestId("col-right"),
		retryInterval: 500,
		maxRetries: 3,
	});

	await expect(page.getByTestId("col-right")).toBeVisible();
	await page.getByTestId("col-right").click();
	await page.getByRole("textbox", { name: "Enter field name" }).click();
	await page
		.getByRole("textbox", { name: "Enter field name" })
		.fill("address field");
	await page.getByRole("button", { name: "Open" }).click();
	await page.getByRole("option", { name: "Address" }).click();
	await page.getByRole("button", { name: "SAVE" }).click();

	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/field/create_field",
		expectedStatus: 201,
	});

	await page
		.getByRole("row", { name: "icon Name icon Num field icon" })
		.getByTestId("column-address-2")
		.waitFor({ state: "visible" });

	await page
		.getByRole("columnheader", { name: "icon Add", exact: true })
		.click();
	await page.getByRole("textbox", { name: "Enter field name" }).click();
	await page
		.getByRole("textbox", { name: "Enter field name" })
		.fill("random field");
	await page.getByRole("button", { name: "Open" }).click();
	await page.getByRole("option", { name: "Currency" }).click();
	await page.getByRole("button", { name: "SAVE" }).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/field/create_field",
		expectedStatus: 201,
	});

	await waitForElementToBeVisible({
		page,
		locator: page
			.getByRole("columnheader", { name: "icon Num field" })
			.locator("button"),
		targetLocator: page.getByTestId("remove-column"),
		retryInterval: 500,
		maxRetries: 3,
	});
	await page
		.getByRole("columnheader", { name: "icon Num field" })
		.locator("button")
		.click();

	await expect(page.getByTestId("remove-column")).toBeVisible();
	await page.getByTestId("remove-column").click();
	await page.getByRole("button", { name: "DELETE", exact: true }).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/field/update_fields_status",
		expectedStatus: 201,
	});

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "add-delete-field-with-column-resizing.png",
	});

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();

	const deleteResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/update_tables");
	});
	expect(deleteResponse.status()).toBe(200);
}

export { resizeColumnWidthsWithImportCSV, addOrDeleteFieldWithColumnResize };
