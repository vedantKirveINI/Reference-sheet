import { test, expect } from "@playwright/test";
import { matchScreenShot } from "../utils/helper";

// There is enhancement is filter and sort fucntonality , we will update it once it is implemented
test.describe.skip("Filter Summary", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJqV0dScWxic2QiLCJ0IjoiY201Z3A2aHB2MDBvdXZsbXpnOW1hbHl1MSIsInYiOiJjbTVncDZodjYwMG92dmxtenVxaWRnNG5hIn0%3D`,
		);

		await page.waitForSelector(".handsontable");
		await page
			.getByRole("row", { name: "icon Name icon Number" })
			.getByTestId("column-short-text-0")
			.waitFor({ state: "visible" });
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("filter on one field", async () => {
		// 3 case, 1. normal filter 2. multiple filter 3. filter on large filed name

		await expect(page.getByTestId("filter-option")).toBeVisible();
		await page.getByTestId("filter-option").click();
		await expect(
			page.getByRole("heading", { name: "No filter conditions are" }),
		).toBeVisible();

		await expect(
			page.getByRole("button", { name: "Add condition", exact: true }),
		).toBeVisible();

		await page
			.getByRole("button", { name: "Add condition", exact: true })
			.click();

		await page.getByTitle("Open").nth(1).click();
		await page.getByRole("option", { name: "Name", exact: true }).click();

		await page.getByTestId("row_0").getByPlaceholder("Enter Value").click();
		await page
			.getByTestId("row_0")
			.getByPlaceholder("Enter Value")
			.fill("a");

		await expect(
			page.getByRole("button", { name: "APPLY FILTER" }),
		).toBeVisible();

		await page.getByRole("button", { name: "APPLY FILTER" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response.status()).toBe(200);

		await expect(page.getByText("Filtered by Name")).toBeVisible();

		const filter = await page.getByTestId("filter-option");
		await matchScreenShot({
			page,
			locator: filter,
			screenShotName: "filter_on_one_field_.png",
		});
	});

	test("filter on field with large field name", async () => {
		await expect(page.getByTestId("filter-option")).toBeVisible();
		await expect(page.getByText("Filtered by Name")).toBeVisible();

		await page.getByTestId("filter-option").click();

		await expect(
			page.getByRole("button", { name: "Add condition", exact: true }),
		).toBeVisible();

		await page
			.getByRole("button", { name: "Add condition", exact: true })
			.click();

		await page
			.getByTestId("row_1")
			.getByTestId("ods-autocomplete")
			.nth(1)
			.click();

		await page
			.getByRole("option", {
				name: "this is very very very very very very large",
			})
			.click();

		await expect(page.getByPlaceholder("Select Option")).toBeVisible();

		await page.getByPlaceholder("Select Option").click();
		await page.getByRole("option", { name: "2" }).click();

		await expect(
			page.getByRole("button", { name: "APPLY FILTER" }),
		).toBeVisible();
		await page.getByRole("button", { name: "APPLY FILTER" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response.status()).toBe(200);

		const filter = await page.getByTestId("filter-option");

		await matchScreenShot({
			page,
			locator: filter,
			screenShotName: "filter_on_large_field_name.png",
		});
	});

	//screenshot is failing
	test("filter on multiple fields", async () => {
		await expect(page.getByTestId("filter-option")).toBeVisible();
		await page.getByTestId("filter-option").click();

		await page
			.getByTestId("footer_add_condition")
			.waitFor({ state: "visible" });
		await page.getByTestId("footer_add_condition").click();

		await page
			.getByTestId("row_2")
			.getByTestId("ods-autocomplete")
			.first()
			.click();
		await page.getByRole("option", { name: "Email id" }).click();
		await page.getByTestId("row_2").getByPlaceholder("Enter Value").click();
		await page
			.getByTestId("row_2")
			.getByPlaceholder("Enter Value")
			.fill("@asd");

		await page.getByTestId("footer_add_condition").click();

		await page
			.getByTestId("row_3")
			.getByTestId("ods-autocomplete")
			.first()
			.click();
		await page.getByRole("option", { name: "Number" }).click();
		await page.getByTestId("row_3").getByPlaceholder("Enter Value").click();
		await page
			.getByTestId("row_3")
			.getByPlaceholder("Enter Value")
			.fill("10");

		await expect(
			page.getByRole("button", { name: "APPLY FILTER" }),
		).toBeVisible();

		await page.getByRole("button", { name: "APPLY FILTER" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response.status()).toBe(200);

		await expect(page.getByTestId("filter-option")).toBeVisible();

		const filter = await page.getByTestId("filter-option");

		await matchScreenShot({
			page,
			locator: filter,
			screenShotName: "filter_on_multiple_fields.png",
		});
	});
	//fail due to ss
	test("filter should persist on page refresh", async () => {
		await expect(page.getByTestId("filter-option")).toBeVisible();

		const prevFilter = await page.getByTestId("filter-option");
		const prevText = await prevFilter.innerText();

		await page.reload({ waitUntil: "load" });

		await page.waitForSelector(".handsontable");
		await expect(
			page
				.getByRole("columnheader", { name: "icon Name" })
				.locator("div")
				.first(),
		).toBeVisible();

		await expect(page.getByTestId("filter-option")).toBeVisible();

		const afterFilter = await page.getByTestId("filter-option");
		const afterText = await afterFilter.innerText();

		await matchScreenShot({
			page,
			locator: afterFilter,
			screenShotName: "filter_on_multiple_fields.png",
		});

		expect(afterText).toEqual(prevText);
	});

	test("filter should update after change in field name", async () => {
		await expect(page.getByTestId("filter-option")).toBeVisible();
		await page.getByTestId("filter-option").click();

		await page.getByTestId("row_0_delete").click();
		await page.getByTestId("row_0_delete").click();
		await page.getByTestId("row_0_delete").click();
		await page.getByTestId("row_0_delete").click();

		await page
			.getByRole("button", { name: "Add condition", exact: true })
			.click();
		await page.getByTitle("Open").nth(1).click();
		await page.getByRole("option", { name: "Name", exact: true }).click();
		await page.getByPlaceholder("Enter Value").click();
		await page.getByPlaceholder("Enter Value").fill("a");

		await expect(
			page.getByRole("button", { name: "APPLY FILTER" }),
		).toBeVisible();

		await page.getByRole("button", { name: "APPLY FILTER" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response.status()).toBe(200);

		await expect(
			page
				.getByRole("columnheader", { name: "icon Name" })
				.locator("button"),
		).toBeVisible();
		await page
			.getByRole("columnheader", { name: "icon Name" })
			.locator("button")

			.click();
		await page.getByTestId("edit-field").click();
		await page.getByPlaceholder("Enter field name").click();
		await page
			.getByPlaceholder("Enter field name")
			.press("ControlOrMeta+a");
		await page.getByPlaceholder("Enter field name").fill("Full Name");
		await expect(page.getByRole("button", { name: "SAVE" })).toBeVisible();
		await page.getByRole("button", { name: "SAVE" }).click();

		const updateFieldResponse1 = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_field");
		});

		expect(updateFieldResponse1.status()).toBe(200);

		let getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_view");
		});

		expect(getViewResponse.status()).toBeGreaterThanOrEqual(200);
		expect(getViewResponse.status()).toBeLessThan(300);

		const filterText = await page.getByTestId("filter-option");
		await expect(filterText).toBeVisible();

		await expect(filterText).toHaveText("Filtered by Full Name");

		await matchScreenShot({
			page,
			locator: filterText,
			screenShotName: "updated_filter_text.png",
		});

		await page.getByText("Filtered by Full Name").click();
		await expect(page.getByTestId("row_0")).toBeVisible();

		await page.waitForTimeout(1000);

		await matchScreenShot({
			page,
			locator: page.getByTestId("row_0"),
			screenShotName: "filter_after_field_name_change.png",
		});
		//commented above ss, need data test id as locator

		await page.getByRole("button", { name: "CANCEL" }).click();

		await page
			.getByRole("columnheader", { name: "icon Full Name" })
			.locator("button")
			.click();
		await page.getByTestId("edit-field").click();
		await page.getByPlaceholder("Enter field name").click();

		await page
			.getByPlaceholder("Enter field name")
			.press("ControlOrMeta+a");

		await page.getByPlaceholder("Enter field name").fill("Name");
		await page.getByRole("button", { name: "SAVE" }).click();

		const updateFieldResponse2 = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_field");
		});

		expect(updateFieldResponse2.status()).toBe(200);

		getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});

		expect(getViewResponse.status()).toBeGreaterThanOrEqual(200);
		expect(getViewResponse.status()).toBeLessThan(300);
	});

	test("filter should persist on table change", async () => {
		await expect(page.getByText("Filtered by Name")).toBeVisible();

		await expect(
			page.getByTestId("table-name-container-1").getByText("Filter"),
		).toBeVisible();
		await page
			.getByTestId("table-name-container-1")
			.getByText("Filter")
			.click();

		await expect(
			page
				.getByRole("columnheader", { name: "icon Name" })
				.locator("div")
				.first(),
		).toBeVisible();

		const table2Filter = await page.getByTestId("filter-option");

		await expect(table2Filter).toBeVisible();

		await matchScreenShot({
			page,
			locator: table2Filter,
			screenShotName: "table_2_filter.png",
		});

		await expect(
			page.getByTestId("table-name-container-0").getByText("Table"),
		).toBeVisible();

		await page
			.getByTestId("table-name-container-0")
			.getByText("Table")
			.click();

		await page.waitForTimeout(5000);

		await expect(
			page
				.getByRole("columnheader", { name: "icon Name" })
				.locator("div")
				.first(),
		).toBeVisible();

		await page.waitForSelector('[data-testid="filter-option"]');

		const table1Filter = await page.getByTestId("filter-option");
		await expect(table1Filter).toBeVisible();

		await matchScreenShot({
			page,
			locator: table1Filter,
			screenShotName: "table_1_filter.png",
		});
	});

	test("newly added field should be available in filter", async () => {
		await expect(
			page.getByRole("columnheader", { name: "icon Add" }),
		).toBeVisible();
		await page.getByRole("columnheader", { name: "icon Add" }).click();

		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("Test Field");
		await page
			.getByTestId("ods-autocomplete")
			.locator("input")
			.nth(1)
			.click();
		await page.getByRole("option", { name: "Short Text" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();
		const response = await page.waitForResponse((res) => {
			return res.url().includes("/field/create_field");
		});

		expect(response.status()).toBeGreaterThanOrEqual(200);
		expect(response.status()).toBeLessThan(300);
		await expect(
			page
				.getByRole("columnheader", { name: "icon Test Field" })
				.locator("div")
				.first(),
		).toBeVisible();
		await page.getByTestId("filter-option").click();
		await page.getByLabel("Open").nth(1).click();
		await expect(
			page.getByRole("option", { name: "Test Field" }),
		).toBeVisible();

		await page.getByRole("button", { name: "CANCEL" }).click();

		await page
			.getByRole("columnheader", { name: "icon Test Field" })
			.locator("button")
			.click();

		await page.getByTestId("remove-column").click();
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		const fieldDeleteResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_fields_status");
		});

		expect(fieldDeleteResponse.status()).toBeGreaterThanOrEqual(200);
		expect(fieldDeleteResponse.status()).toBeLessThan(300);
	});

	test("clear Filter", async () => {
		await page.waitForSelector('[data-testid="filter-option"]');
		await expect(page.getByTestId("filter-option")).toBeVisible();

		await expect(page.getByText("Filtered by Name")).toBeVisible();

		await page.getByTestId("filter-option").click();

		await page.getByTestId("row_0_delete").click();
		await expect(
			page.getByRole("heading", { name: "No filter conditions are" }),
		).toBeVisible();
		await page.getByRole("button", { name: "APPLY FILTER" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response.status()).toBe(200);

		const filter = await page.getByTestId("filter-option");

		await matchScreenShot({
			page,
			locator: filter,
			screenShotName: "normal_filter.png",
		});
	});

	test("filter if field is deleted", async () => {
		//	test.setTimeout(60000);

		await expect(
			page.getByRole("columnheader", { name: "icon Add" }),
		).toBeVisible();
		await page.getByRole("columnheader", { name: "icon Add" }).click();
		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("Delete Field 1");
		await page
			.getByTestId("ods-autocomplete")
			.locator("input")
			.nth(1)
			.click();
		//await page.getByPlaceholder("Select a field type").click();
		await page.getByRole("option", { name: "Short Text" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		let fieldCreateResponse = await page.waitForResponse((resp) => {
			return resp.url().includes("/field/create_field");
		});
		expect(fieldCreateResponse.status()).toBeGreaterThanOrEqual(200);
		expect(fieldCreateResponse.status()).toBeLessThan(300);

		await expect(
			page.getByRole("columnheader", { name: "icon Add" }),
		).toBeVisible();
		await page.getByRole("columnheader", { name: "icon Add" }).click();
		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("Delete Field 2");
		await page.getByPlaceholder("Select a field type").click();
		await page.getByRole("option", { name: "Long Text" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		fieldCreateResponse = await page.waitForResponse((resp) => {
			return resp.url().includes("/field/create_field");
		});
		expect(fieldCreateResponse.status()).toBeGreaterThanOrEqual(200);
		expect(fieldCreateResponse.status()).toBeLessThan(300);

		// case 1: filter apply on field which will be deleted

		await page.waitForSelector('[data-testid="filter-option"]');

		await expect(page.getByTestId("filter-option")).toBeVisible();
		await page.getByTestId("filter-option").click();
		await expect(
			page.getByRole("heading", { name: "No filter conditions are" }),
		).toBeVisible();

		await expect(
			page.getByRole("button", { name: "Add condition", exact: true }),
		).toBeVisible();

		await page
			.getByRole("button", { name: "Add condition", exact: true })
			.click();

		await page
			.getByTestId("row_0")
			.getByTestId("ods-autocomplete")
			.first()
			.click();

		await page
			.getByRole("option", { name: "Delete Field 2", exact: true })
			.click();

		await page.getByTestId("row_0").getByPlaceholder("Enter Value").click();
		await page
			.getByTestId("row_0")
			.getByPlaceholder("Enter Value")
			.fill("a");

		await expect(
			page.getByRole("button", { name: "APPLY FILTER" }),
		).toBeVisible();

		await page.getByRole("button", { name: "APPLY FILTER" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response.status()).toBe(200);

		await expect(page.getByTestId("filter-option")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.getByTestId("filter-option"),
			screenShotName: "filter_1_before_deleting_field.png",
		});

		await expect(
			page
				.getByRole("columnheader", { name: "icon Delete Field 2" })
				.locator("button"),
		).toBeVisible();
		await page
			.getByRole("columnheader", { name: "icon Delete Field 2" })
			.locator("button")
			.click();
		await page.getByTestId("remove-column").click();
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		let fieldDeleteResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_fields_status");
		});

		expect(fieldDeleteResponse.status()).toBeGreaterThanOrEqual(200);
		expect(fieldDeleteResponse.status()).toBeLessThan(300);

		let getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});

		expect(getViewResponse.status()).toBeGreaterThanOrEqual(200);
		expect(getViewResponse.status()).toBeLessThan(300);

		await expect(page.getByTestId("filter-option")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.getByTestId("filter-option"),
			screenShotName: "filter_1_after_deleting_field.png",
		});

		// case 2: filter apply on multiple fields, two of them will be deleted

		await page.getByTestId("filter-option").click();
		await page
			.getByRole("button", { name: "Add condition", exact: true })
			.click();

		await page.getByTestId("row_0").getByPlaceholder("Enter Value").click();
		await page
			.getByTestId("row_0")
			.getByPlaceholder("Enter Value")
			.fill("a");

		await page
			.getByRole("button", { name: "Add condition", exact: true })
			.click();

		await page
			.getByTestId("row_1")
			.getByTestId("ods-autocomplete")
			.nth(1)
			.click();

		await page.getByRole("option", { name: "Delete Field" }).click();

		await page.getByTestId("row_1").getByPlaceholder("Enter Value").click();
		await page
			.getByTestId("row_1")
			.getByPlaceholder("Enter Value")
			.fill("a");

		await page.getByRole("button", { name: "Add condition group" }).click();

		await page
			.getByTestId("row_2_0")
			.getByTestId("ods-autocomplete")
			.first()
			.click();
		await page.getByRole("option", { name: "Delete Field" }).click();

		await page
			.getByTestId("row_2_0")
			.getByPlaceholder("Enter Value")
			.click();
		await page
			.getByTestId("row_2_0")
			.getByPlaceholder("Enter Value")
			.fill("a");

		// await page.getByPlaceholder("Enter Value").nth(2).click();
		// await page.getByPlaceholder("Enter Value").nth(2).fill("a");

		await page.getByRole("button", { name: "APPLY FILTER" }).click();
		//api call

		const response1 = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response1.status()).toBe(200);

		await page.waitForSelector('[data-testid="filter-option"]');

		await expect(page.getByTestId("filter-option")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.getByTestId("filter-option"),
			screenShotName: "filter_2_before_deleting_field.png",
		});

		await expect(
			page
				.getByRole("columnheader", { name: "icon Delete Field" })
				.locator("button"),
		).toBeVisible();
		await page
			.getByRole("columnheader", { name: "icon Delete Field" })
			.locator("button")
			.click();
		await page.getByTestId("remove-column").click();
		await page.getByRole("button", { name: "DELETE", exact: true }).click();

		fieldDeleteResponse = await page.waitForResponse((res) => {
			return res.url().includes("/field/update_fields_status");
		});

		expect(fieldDeleteResponse.status()).toBeGreaterThanOrEqual(200);
		expect(fieldDeleteResponse.status()).toBeLessThan(300);

		getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});

		expect(getViewResponse.status()).toBeGreaterThanOrEqual(200);
		expect(getViewResponse.status()).toBeLessThan(300);

		await expect(page.getByTestId("filter-option")).toBeVisible();
		await matchScreenShot({
			page,
			locator: page.getByTestId("filter-option"),
			screenShotName: "filter_2_after_deleting_field.png",
		});

		await page.getByTestId("filter-option").click();
		await expect(
			page
				.locator("div")
				.filter({ hasText: "In this view, show" })
				.nth(3),
		).toBeVisible();

		await page.waitForTimeout(1000);
		await matchScreenShot({
			page,
			locator: page
				.locator("div")
				.filter({ hasText: "In this view, show" })
				.nth(3),
			screenShotName: "filter_form.png",
		});
		//commented for now,need data-testid as locator

		await page.getByTestId("row_0_delete").click();

		await page.getByRole("button", { name: "APPLY FILTER" }).click();

		const response2 = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_filter");
		});

		expect(response2.status()).toBe(200);
	});
});
