import { expect } from "@playwright/test";

import {
	matchScreenShot,
	removeColumn,
	waitForResponseAndCheckStatus,
} from "../utils/helper";

async function importCSVInNewTableBreakingLimit({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Import File into a new table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("new table");
	await page.getByRole("button", { name: "PROCEED" }).click();

	await matchScreenShot({
		page,
		locator: page.getByTestId("ods-dialog-actions"),
		screenShotName: "disabled-import-button.png",
	});

	const fileInput = await page.locator('input[type="file"]');
	// we are adding pdf file just to check the error msg only
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/10MB.pdf",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	await expect(
		page
			.getByTestId("import-csv-file-upload")
			.locator("div")
			.filter({ hasText: "Please select file size less" }),
	).toHaveText("Please select file size less than 10 MB");

	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();
}

async function importCSVWithFirstRowAsColHeader(page) {
	await page.waitForLoadState("domcontentloaded");
	await page.getByText("Add or Import").click();
	await page.getByText("Import File into a new table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table");
	await page.getByRole("button", { name: "PROCEED" }).click();

	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/day.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	const fileUploadresponse = await page.waitForResponse((res) => {
		return res.url().startsWith("https://upload.oute.app/upload");
	});

	expect(fileUploadresponse.status()).toBe(200);
	await page.waitForTimeout(800); // wait for the title to appear cor

	await matchScreenShot({
		page,
		locator: page.getByTestId("ods-dialog-title"),
		screenShotName: "modal-dialog-title.png",
	});

	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByLabel("Open").nth(3).click();
	await page.getByRole("option", { name: "Number" }).click();
	await page.getByLabel("Open").nth(2).click();
	await page.getByRole("option", { name: "Number" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	const response = await page.waitForResponse((res) => {
		return res.url().includes("/table/add_csv_data_to_new_table");
	});

	expect(response.status()).toBe(201);

	await page
		.getByRole("row", { name: "Numeric" })
		.getByTestId("column-number-1")
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "import-csv-with-first-row-as-col-Header.png",
	});

	await page
		.getByTestId("table-name-container-4")
		.last()
		.waitFor({ state: "visible" });

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/update_tables",
		expectedStatus: 200,
	});
}

async function importCSVWithoutFirstRowAsColHeader({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Import File into a new table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table");
	await page.getByRole("button", { name: "PROCEED" }).click();
	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/day.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();
	await page.getByText("No").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByLabel("Open").nth(3).click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByLabel("Open").nth(2).click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	const response = await page.waitForResponse((res) => {
		return res.url().includes("/table/add_csv_data_to_new_table");
	});

	expect(response.status()).toBe(201);

	await page
		.getByRole("gridcell", { name: "Numeric", exact: true })
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "import-csv-without-first-row-as-col-Header.png",
	});

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();

	const deleteResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/update_tables");
	});

	expect(deleteResponse.status()).toBeGreaterThanOrEqual(200);
	expect(deleteResponse.status()).toBeLessThan(300);
}

async function importCSVCheckingFlowBackward({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Import File into a new table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table 1");
	await page.getByRole("button", { name: "PROCEED" }).click();
	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/industry.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();
	await page.getByText("No").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page
		.getByTestId("ods-dialog-actions")
		.getByTestId("ods-button")
		.click();
	await expect(page.getByLabel("No")).toBeChecked();
	await page
		.getByTestId("ods-dialog-actions")
		.getByTestId("ods-button")
		.click();

	await expect(page.getByText("0.77KB")).toBeVisible();

	await page
		.getByTestId("ods-dialog-actions")
		.getByTestId("ods-button")
		.click();

	const content = await page
		.getByTestId("ods-dialog-content")
		.locator("div")
		.filter({ hasText: "Table Name" })
		.nth(2);

	// Locate the input element of type "text" within the content
	const inputText = content.locator('input[type="text"]');

	// Assert that the input has the expected value
	await expect(inputText).toHaveValue("New Table 1");

	await page.getByRole("button", { name: "PROCEED" }).click();
	await expect(page.getByText("0.77KB")).toBeVisible();

	await page.getByRole("button", { name: "PROCEED" }).click();
	await expect(page.getByLabel("No")).toBeChecked();

	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();

	const deleteResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/update_tables");
	});

	expect(deleteResponse.status()).toBeGreaterThanOrEqual(200);
	expect(deleteResponse.status()).toBeLessThan(300);
}
async function existingTableSelectMapDataType({ page }) {
	//importing csv in existing table without selecting existing field and selecting map data type
	await page.getByText("Add or Import").click();

	let isVisible = false;
	const maxRetries = 5; // Maximum number of retries
	const retryInterval = 1000; // Time to wait between retries in milliseconds

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		// Hover over the target element
		await page.getByText("Import File into an existing").hover();

		// Check if the menu item is visible
		isVisible = await page
			.getByRole("menuitem", { name: "Untitled Table" })
			.isVisible();

		if (isVisible) {
			break; // Exit the loop if the element is visible
		}

		// Wait before retrying
		await page.waitForTimeout(retryInterval);
	}

	// Assert visibility after retries
	await expect(
		page.getByRole("menuitem", { name: "Untitled Table" }),
	).toBeVisible();

	await page.getByRole("menuitem").getByText("Untitled Table").click();

	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/day.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByText("To existing column").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByText("Map Data Type").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByLabel("Open").first().click();
	await page.getByRole("option", { name: "Number" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "Number" }).click();
	await page.getByLabel("Open").nth(2).click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	const uploadResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/add_csv_data_to_existing_table");
	});

	expect(uploadResponse.status()).toBe(201);

	await page
		.getByRole("columnheader", { name: "icon Column 1" })
		.getByTestId("column-short-text-0")
		.waitFor({ state: "visible" });

	await matchScreenShot({ page, locator: page.locator(".wtHolder").first() });

	await page.locator("div").filter({ hasText: /^6$/ }).nth(1).click();

	const container = await page.locator(".ht_master .wtHolder");

	const boundingBox = await container.boundingBox();

	if (boundingBox) {
		await page.mouse.move(
			boundingBox.x + boundingBox.width / 2,
			boundingBox.y + boundingBox.height / 2,
		);
	}

	for (let i = 0; i < 4; i++) {
		await page.mouse.wheel(0, 150);
	}

	await page
		.locator("div")
		.filter({ hasText: /^36$/ })
		.nth(1)
		.click({
			modifiers: ["Shift"],
		});

	await page
		.locator(".ht_clone_left")
		.locator("tbody")
		.locator("#checkbox_35")
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

	await removeColumn(page, "icon Numeric-Suffix");
	await removeColumn(page, "icon Numeric-");
	await removeColumn(page, "icon Numeric");
}

async function importCSVUsingOptionOnTableName({ page }) {
	// Adding a new table
	await page.getByText("Add or Import").click();
	await page.getByText("Add Table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table");
	await page.getByRole("button", { name: "ADD" }).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/create_table",
		expectedStatus: 201,
	});

	// Importing csv in current table
	await page.locator('[class*="expand_icon"]').click();
	//await page.getByTestId("ods-context-menu-item").first().click();

	await expect(
		page.getByRole("menuitem", { name: "Import Table" }),
	).toHaveText("Import Table");

	await page.getByText("Import Table").click();

	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/customers-100.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByText("To existing column").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByText("Map Data Type").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	// available date-testids ods-text-field or ArrowDropDownIcon
	const elements = await page.getByTestId("ods-text-field");

	const count = await elements.count();

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
		.getByRole("row", { name: "icon Name icon Index icon" })
		.getByTestId("column-short-text-2")
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "import-csv-using-import-table.png",
	});

	await page.mouse.wheel(0, 2000);

	await page
		.getByRole("gridcell", { name: "77", exact: true })
		.scrollIntoViewIfNeeded();

	await page
		.getByRole("gridcell", { name: "77", exact: true })
		.waitFor({ state: "visible" });
	await page.getByRole("gridcell", { name: "77", exact: true }).click({
		button: "right",
	});

	await page.getByTestId("row-above").waitFor({ state: "visible" });
	await page.getByTestId("row-above").click();

	await page.waitForTimeout(1500); //delay for addition of record, adjust if needed

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "highlight-inserted-row.png",
	});

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();

	const deleteResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/update_tables");
	});

	expect(deleteResponse.status()).toBeGreaterThanOrEqual(200);
	expect(deleteResponse.status()).toBeLessThan(300);
}

async function importCSVDataTypeOptionCheck({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Import File into a new table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table 1");
	await page.getByRole("button", { name: "PROCEED" }).click();

	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/industry.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByLabel("Open").last().click();

	await matchScreenShot({
		page,
		locator: page.getByTestId("ods-autocomplete-listbox"),
		screenShotName: "import-csv-data-type-option-check.png",
	});
	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();
}

async function importCSVRemainingFieldShow({ page }) {
	//checking whether we have the remaining fields if we select one or two field for mapping data type
	await page.getByText("Add or Import").click();
	await page.getByText("Add Table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table");
	await page.getByRole("button", { name: "ADD" }).click();

	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/create_table",
		expectedStatus: 201,
	});

	await expect(
		page.getByRole("columnheader", { name: "icon Name" }).locator("button"),
	).toBeVisible();

	const columnButton = page
		.getByRole("columnheader", { name: "icon Name" })
		.locator("button");
	const contextMenu = page.getByTestId("col-right");

	let attempts = 0;
	const maxAttempts = 2; // Retry up to 2 times

	while (attempts < maxAttempts) {
		// Click the button
		await columnButton.click();

		// Check if the context menu is visible
		if (await contextMenu.isVisible()) {
			break; // Exit the loop if the condition is met
		}

		attempts += 1;
	}

	await expect(contextMenu).toBeVisible();

	await page.getByTestId("col-right").click();
	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("Numeric");
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Number", exact: true }).click();
	await page.getByRole("button", { name: "SAVE" }).click();

	await page
		.getByRole("columnheader", { name: "icon Numeric" })
		.locator("button")
		.click();

	await page.getByTestId("col-right").click();
	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("Numeric-2");
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Number", exact: true }).click();
	await page.getByRole("button", { name: "SAVE" }).click();

	await page
		.getByRole("columnheader", { name: "icon Numeric-" })
		.locator("button")
		.click();

	await page.getByTestId("col-right").click();
	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill("Numeric-Suffic");
	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "SAVE" }).click();

	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/field/create_field",
		expectedStatus: 201,
	});
	await page.locator('[class*="expand_icon"]').click();
	await page.getByText("Import Table").click();
	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/day.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();
	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByText("To existing column").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByLabel("Open").nth(3).click();
	await page.getByRole("option", { name: "Numeric", exact: true }).click();
	await page.getByLabel("Open").nth(1).click();

	await expect(page.getByRole("option", { name: "Name" })).toBeVisible();
	await expect(page.getByRole("option", { name: "Numeric-2" })).toBeVisible();
	await expect(
		page.getByRole("option", { name: "Numeric-Suffic" }),
	).toBeVisible();

	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();
}

async function importCSVMapDataTypeError({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Import File into a new table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table");
	await page.getByRole("button", { name: "PROCEED" }).click();

	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/day.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await expect(
		page
			.getByTestId("map-csv-field")
			.locator("div")
			.filter({ hasText: "Data type required for at" }),
	).toHaveText("Data type required for at least one field");

	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();
}

async function existingTableCreateNewColWithColheader({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Add Table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table");
	await page.getByRole("button", { name: "ADD" }).click();
	await page.locator('[class*="expand_icon"]').click();
	await page.getByText("Import Table").click();
	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/industry.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();
	await page.getByText("Yes").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByText("Create new column").click();
	await page.getByRole("button", { name: "PROCEED" }).click();
	await page.getByLabel("Open").nth(1).click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	const uploadResponse = await page.waitForResponse((res) => {
		return res.url().includes("/table/add_csv_data_to_existing_table");
	});

	expect(uploadResponse.status()).toBe(201);

	await page
		.getByRole("columnheader", { name: "icon Industry" })
		.getByTestId("column-short-text-1")
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "existing-table-create-new-col-with-col-header.png",
	});

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();
}

async function existingTableCreateNewColWithoutColheader({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Add Table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("New Table");
	await page.getByRole("button", { name: "ADD" }).click();

	//page.getByTestId('[class="_expand_icon_ym5i2_113"]').waitFor({ state: "visible" });

	await page.locator('[class*="expand_icon"]').click();

	await page.getByText("Import Table").click();
	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/industry.csv",
	);
	await page.getByRole("button", { name: "IMPORT" }).click();

	await page.getByText("No").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByText("Create new column").click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	await page.getByLabel("Open").last().click();
	await page.getByRole("option", { name: "Short Text" }).click();
	await page.getByRole("button", { name: "PROCEED" }).click();

	const response = await page.waitForResponse((response) =>
		response
			.url()
			.includes(
				"https://sheet.gofo.app/table/add_csv_data_to_existing_table",
			),
	);

	expect(response.status()).toBe(201);

	await page
		.getByRole("columnheader", { name: "icon Column" })
		.getByTestId("column-short-text-1")
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "existing-table-create-new-col-without-col-header.png",
	});

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();
}

async function existingTableList({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Add Table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("Table 1");
	await page.getByRole("button", { name: "ADD" }).click();
	// await waitForAddTableResponse(page);
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/create_table",
		expectedStatus: 201,
	});

	await page.getByText("Add or Import").click();
	await page.getByText("Add Table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("Table 2");
	await page.getByRole("button", { name: "ADD" }).click();
	// await waitForAddTableResponse(page);
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/create_table",
		expectedStatus: 201,
	});

	await page.getByText("Add or Import").click();
	await page.getByText("Add Table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("Table 3");
	await page.getByRole("button", { name: "ADD" }).click();
	// await waitForAddTableResponse(page);
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/create_table",
		expectedStatus: 201,
	});

	await page.getByText("Add or Import").click();

	const getTablesResponse = await page.waitForResponse((res) => {
		return res
			.url()
			.includes("/table?baseId=nNuJ9jiAK&is_view_required=true");
	});

	expect(getTablesResponse.status()).toBe(200);

	let isVisible = false;
	const maxRetries = 5; // Maximum number of retries
	const retryInterval = 500; // Time to wait between retries in milliseconds

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		await page.getByText("Import File into an existing").hover();

		isVisible = await page
			.getByRole("menuitem", { name: "Untitled Table 1", exact: true })
			.isVisible();

		if (isVisible) {
			break; // Exit the loop if the element is visible
		}

		// Wait before retrying
		await page.waitForTimeout(retryInterval);
	}

	// Assert visibility after retries

	await page
		.locator('[data-testid="ods-context-menu"]:nth-child(4)')
		.waitFor({ state: "visible" });

	await page.waitForTimeout(500);

	const drpdownLocator = await page.locator('[role="menu"]').nth(1);
	await matchScreenShot({
		page,
		locator: drpdownLocator,
		screenShotName: "existing-table-list.png",
	});
	//await page.getByTestId("ods-icon").last().click();

	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").last().click();
	//await page.getByLabel("DELETE").click();
	await page.getByText("DELETE").nth(4).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/update_tables",
		expectedStatus: 200,
	});

	await page.getByText("Table 2").nth(1).click();
	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").last().click();
	await page.getByText("DELETE").nth(4).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/update_tables",
		expectedStatus: 200,
	});

	//await page.getByText("Table 1", { exact: true }).click();
	await page.getByText("Table 1").nth(2).click();
	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").last().click();
	await page.getByText("DELETE").nth(4).click();
	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/table/update_tables",
		expectedStatus: 200,
	});
}

async function importCSVInOfflineEnvironment({ page }) {
	await page.getByText("Add or Import").click();
	await page.getByText("Import File into a new table").click();
	await page.getByRole("textbox").click();
	await page.getByRole("textbox").fill("new table");
	await page.getByRole("button", { name: "PROCEED" }).click();
	const fileInput = await page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/industry.csv",
	);
	await page.route("**/*", (route) => route.abort()); // network shutdown, it cuts the requests
	await page.getByRole("button", { name: "IMPORT" }).click();
	await expect(page.getByText("Could not upload files")).toBeVisible();
	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();
}
export {
	importCSVInNewTableBreakingLimit,
	importCSVWithFirstRowAsColHeader,
	importCSVWithoutFirstRowAsColHeader,
	importCSVCheckingFlowBackward,
	existingTableSelectMapDataType,
	importCSVUsingOptionOnTableName,
	importCSVDataTypeOptionCheck,
	importCSVRemainingFieldShow,
	importCSVMapDataTypeError,
	existingTableCreateNewColWithColheader,
	existingTableCreateNewColWithoutColheader,
	existingTableList,
	importCSVInOfflineEnvironment,
};
