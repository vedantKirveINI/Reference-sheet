import { test, expect } from "@playwright/test";

test("Editing of a field Name", async ({ page, baseURL }) => {
	await page.goto(
		`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJMcTFYN3hYR0giLCJwciI6IkxxMVg3eFhHSCIsImEiOiJIc3RTNVJJRTciLCJ0IjoiY20xNnIxN3gxMDBpdzEyaG1tc3p1NjMweCIsInYiOiJjbTE2cjE3emkwMGl4MTJobWswNW16YjM2In0%3D`,
	);

	const response = await page.waitForResponse((res) => {
		return res.url().includes("/sheet/get_sheet");
	});

	expect(response.status()).toBe(201);

	await page.waitForSelector(".handsontable");

	await page
		.getByRole("columnheader", { name: "icon Name" })
		.locator("button")
		.click();

	const fieldUpdatioName = "Name Updated 123";

	await page.getByText("Edit Field").click();
	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill(fieldUpdatioName);
	await page.getByRole("button", { name: "SAVE" }).click();

	const updateFieldResponse = await page.waitForResponse((res) => {
		return res.url().includes("/field/update_field");
	});

	expect(updateFieldResponse.status()).toBe(200);

	await expect(
		page.getByText(`Field ${fieldUpdatioName} Updated Successfully`),
	).toBeVisible();

	await page.close();
});

test("Check if field Name in header and edit field component is same and update it back to initial state", async ({
	page,
	baseURL,
}) => {
	await page.goto(
		`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJMcTFYN3hYR0giLCJwciI6IkxxMVg3eFhHSCIsImEiOiJIc3RTNVJJRTciLCJ0IjoiY20xNnIxN3gxMDBpdzEyaG1tc3p1NjMweCIsInYiOiJjbTE2cjE3emkwMGl4MTJobWswNW16YjM2In0%3D`,
	);

	await page.waitForSelector(".handsontable");

	const column_header = await page
		.getByRole("columnheader", { name: "icon Name Updated" })
		.locator("div");

	const columnHeaderText = await column_header.nth(1).innerText();

	await page
		.getByRole("columnheader", { name: "icon Name Updated" })
		.locator("button")
		.click();

	await page.getByText("Edit Field").click();

	const fieldName = await page
		.getByPlaceholder("Enter field name")
		.inputValue();

	expect(columnHeaderText.trim()).toBe(fieldName.trim());

	const fieldUpdatioName = "Name";

	await page.getByPlaceholder("Enter field name").click();
	await page.getByPlaceholder("Enter field name").fill(fieldUpdatioName);
	await page.getByRole("button", { name: "SAVE" }).click();

	const updateFieldResponse = await page.waitForResponse((res) => {
		return res.url().includes("/field/update_field");
	});

	expect(updateFieldResponse.status()).toBe(200);

	await expect(
		page.getByText(`Field ${fieldUpdatioName} Updated Successfully`),
	).toBeVisible();

	await page.close();
});
