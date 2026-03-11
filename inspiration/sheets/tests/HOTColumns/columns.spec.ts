import { test, expect } from "@playwright/test";

test.describe("HOT Column Operations", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJfaWcyblo5RjYiLCJ0IjoiY20yYnB0YTg0MDViajJvb213ZGZvcnk5YyIsInYiOiJjbTJicHRhYWcwNWJrMm9vbXkydHJ6bDRwIn0%3D`,
		);
		await page.waitForLoadState("load");
		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Insert 'Age' Column to the Right", async () => {
		// Insert column of age to the right
		await page
			.getByRole("columnheader", { name: "icon Name" })
			.locator("button")
			.click();

		await page.getByText("Insert column right").click();
		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("Age");
		const selectFieldInputLocator = page
			.getByTestId("ods-autocomplete")
			.locator("input")
			.nth(1);
		await selectFieldInputLocator.fill("Numb");
		await page.getByRole("option", { name: "Number", exact: true }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		const createFieldResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/create_field");
		});

		expect(createFieldResponse.status()).toBe(201);

		await expect(
			page.locator("div").filter({ hasText: "New Column Added" }).nth(3),
		).toBeVisible();

		await expect(page.locator("table.htCore").first()).toHaveScreenshot(
			"insert-column-right.png",
			{
				maxDiffPixelRatio: 0.05,
			},
		);
	});

	test("Insert 'Email' Column to the Left of 'Age'", async () => {
		// Insert email column to the left of the Age column
		await page
			.getByRole("columnheader", { name: "icon Age" })
			.locator("button")
			.click();
		await page.getByText("Insert column left").click();
		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("Email");
		await page
			.getByTestId("ods-autocomplete")
			.locator("input")
			.nth(1)
			.click();
		await page.getByRole("option", { name: "Email" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		const createFieldResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/create_field");
		});

		expect(createFieldResponse.status()).toBe(201);

		await expect(
			page.locator("div").filter({ hasText: "New Column Added" }).nth(3),
		).toBeVisible();

		await expect(page.locator("table.htCore").first()).toHaveScreenshot(
			"insert-column-left.png",
			{
				maxDiffPixelRatio: 0.05,
			},
		);
	});

	test("Clear Values in 'Age' Column", async () => {
		// Loop through rows 1 to 5 and fill values in the Age column
		for (let i = 1; i <= 5; i++) {
			await page.waitForTimeout(800);

			await page
				.locator(`tr:nth-child(${i}) > td:nth-child(4)`)
				.dblclick();

			await page
				.locator(".ht_clone_master")
				.locator("textarea")
				.fill(`${23 + (i - 1)}`);

			if (!(i == 5)) {
				await page.keyboard.press("Enter");
			}
		}

		await page.locator(`tr:nth-child(1) > td:nth-child(3)`).click();

		let isVisible = false;
		const maxRetries = 5; // Maximum number of retries
		const retryInterval = 1000; // Time to wait between retries in milliseconds

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			await page
				.getByRole("columnheader", { name: "icon Age" })
				.locator("button")
				.click();

			// Check if the menu item is visible
			isVisible = await page.getByTestId("clear-column").isVisible();

			if (isVisible) {
				break; // Exit the loop if the element is visible
			}

			// Wait before retrying
			await page.waitForTimeout(retryInterval);
		}

		await page.getByTestId("clear-column").click();

		await page.getByRole("button", { name: "CLEAR", exact: true }).click();

		const clearFieldResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/clear_fields_data");
		});

		expect(clearFieldResponse.status()).toBe(201);

		// Confirm success message
		await page
			.locator("div")
			.filter({ hasText: "Successfully cleared fields" })
			.nth(3)
			.click();

		await expect(page.locator("table.htCore").first()).toHaveScreenshot(
			"clear-column.png",
			{
				maxDiffPixelRatio: 0.05,
			},
		);
	});

	test("Delete 'Age' Column", async () => {
		// Delete the 'Age' column
		await page
			.getByRole("columnheader", { name: "icon Age" })
			.locator("button")
			.click();
		await page.getByText("Delete column").click();
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const deleteFieldResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_fields_status");
		});

		expect(deleteFieldResponse.status()).toBe(201);

		// Verify deletion success message
		await expect(page.getByRole("alert")).toHaveText(
			"Successfully deleted fields",
		);
	});

	test("Delete 'Email' Column and Verify UI", async () => {
		await page.locator("td:nth-child(3)").first().dblclick();
		await page.getByTestId("email-editor").fill("abh@gmail.com");
		await page.keyboard.press("Enter");
		await page.waitForTimeout(800);

		await page.keyboard.press("Enter");
		await page.getByTestId("email-editor").fill("ved@gmail.com");
		await page.keyboard.press("Enter");
		await page.waitForTimeout(800);

		await page.keyboard.press("Enter");
		await page.getByTestId("email-editor").fill("shu@gmail.com");
		await page.keyboard.press("Enter");
		await page.waitForTimeout(800);

		await expect(page.getByText("abh@gmail.com")).toBeVisible();
		await expect(page.getByText("ved@gmail.com")).toBeVisible();
		await expect(page.getByText("shu@gmail.com")).toBeVisible();

		// Delete the 'Email' column and check how the UI looks after deletion
		await page
			.getByRole("columnheader", { name: "icon Email" })
			.locator("button")
			.click();
		await page.getByText("Delete column").click();
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const deleteFieldResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_fields_status");
		});

		expect(deleteFieldResponse.status()).toBe(201);

		await expect(page.getByText("Successfully deleted fields")).toHaveText(
			"Successfully deleted fields",
		);

		// Capture the UI state after the deletion
		await expect(page.locator("table.htCore").first()).toHaveScreenshot(
			"delete-email.png",
			{
				maxDiffPixelRatio: 0.05,
			},
		);
	});

	test("Cancel 'Clear Column' Action", async () => {
		// Attempt to clear a column and cancel the action

		await page
			.getByRole("columnheader", { name: "icon Name" })
			.locator("button")
			.click();

		await page.getByText("Clear column").click();
		await page.getByRole("button", { name: "CANCEL" }).click();

		// Verify the UI remains unchanged
		await expect(page.locator("table.htCore").first()).toHaveScreenshot(
			"dont-delete-clear.png",
			{
				maxDiffPixelRatio: 0.05,
			},
		);
	});

	test("Add Column on button click and check if previous column data still persists", async () => {
		await page
			.getByRole("columnheader", { name: "icon Add" })
			.locator("#field-type-icon")

			.click();

		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("new column");
		//await page.getByPlaceholder("Select a field type").click();
		await page
			.getByTestId("ods-autocomplete")
			.locator("input")
			.nth(1)
			.click();
		await page.getByRole("option", { name: "Email" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		const createFieldResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/create_field");
		});

		expect(createFieldResponse.status()).toBe(201);

		await expect(
			page
				.getByRole("columnheader", { name: "icon new column" })
				.getByTestId("column-email-1"),
		).toBeVisible();

		await expect(page.getByText("abh@gmail.com")).not.toBeVisible();
		await expect(page.getByText("ved@gmail.com")).not.toBeVisible();
		await expect(page.getByText("shu@gmail.com")).not.toBeVisible();

		await page
			.getByRole("columnheader", { name: "icon new column" })
			.locator("button")
			.click();
		await page.getByText("Delete column").click();
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const deleteFieldResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_fields_status");
		});

		expect(deleteFieldResponse.status()).toBe(201);

		// Verify deletion success message
		await expect(page.getByText("Successfully deleted fields")).toHaveText(
			"Successfully deleted fields",
		);
	});
});
