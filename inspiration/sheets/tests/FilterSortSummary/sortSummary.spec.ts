import { test, expect } from "@playwright/test";
import { matchScreenShot } from "../utils/helper";

// There is enhancement is filter and sort fucntonality , we will update it once it is implemented
test.describe.skip("Sort Summary", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJqV0dScWxic2QiLCJ0IjoiY202Nmg4OTV3MDAwNDdqZzZtNmplaXM1biIsInYiOiJjbTY2aDg5eTgwMDA1N2pnNndweHgzdGkxIn0%3D`,
		);

		await page.waitForSelector(".handsontable");
		await page
			.getByRole("columnheader", { name: "icon Name" })
			.locator("div")
			.first()
			.waitFor({ state: "visible" });
	});

	test.afterAll(async () => {
		await page.close();
	});

	//

	test("sort on one field", async () => {
		await expect(page.getByTestId("sort-option")).toBeVisible();

		await page.getByTestId("sort-option").click();
		await page
			.getByTestId("sortObjs-field-0")
			.locator("div")
			.nth(3)
			.click();
		await page.getByRole("option", { name: "Name", exact: true }).click();
		await expect(
			page.getByRole("button", { name: "SORT", exact: true }),
		).toBeVisible();
		await page.getByRole("button", { name: "SORT", exact: true }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_sort");
		});
		expect(response.status()).toBe(200);

		await expect(page.getByText("Sorted by Name")).toBeVisible();

		const sort = await page.getByTestId("sort-option");
		await expect(sort).toBeVisible();

		await matchScreenShot({
			page,
			locator: sort,
			screenShotName: "sort_on_one_field.png",
		});
	});

	test("sort on field with large name", async () => {
		await expect(page.getByText("Sorted by Name")).toBeVisible();
		await expect(page.getByTestId("sort-option")).toBeVisible();

		await page.getByTestId("sort-option").click();
		await expect(
			page.getByRole("button", { name: "ADD ANOTHER SORT" }),
		).toBeVisible();

		await page.getByRole("button", { name: "ADD ANOTHER SORT" }).click();

		await expect(
			page
				.getByTestId("sortObjs-field-1")
				.getByPlaceholder("Select a field"),
		).toBeVisible();

		await page
			.getByTestId("sortObjs-field-1")
			.getByPlaceholder("Select a field")
			.click();

		await page
			.getByRole("option", { name: "this is very very very very" })
			.click();

		await expect(
			page.getByRole("button", { name: "SORT", exact: true }),
		).toBeVisible();
		await page.getByRole("button", { name: "SORT", exact: true }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_sort");
		});
		expect(response.status()).toBe(200);

		const sort = await page.getByTestId("sort-option");
		await expect(sort).toBeVisible();

		await matchScreenShot({
			page,
			locator: sort,
			screenShotName: "sort_on_large_field_name.png",
		});
	});

	test("sort on multiple fields", async () => {
		await expect(page.getByTestId("sort-option")).toBeVisible();
		await page.getByTestId("sort-option").click();
		await expect(
			page.getByRole("button", { name: "ADD ANOTHER SORT" }),
		).toBeVisible();

		await page.getByRole("button", { name: "ADD ANOTHER SORT" }).click();
		await page
			.getByTestId("sortObjs-field-2")
			.locator("div")
			.nth(3)
			.click();

		await page.getByRole("option", { name: "Number" }).click();
		await page.getByRole("button", { name: "ADD ANOTHER SORT" }).click();

		await page.getByTestId("sortObjs-field-3").getByLabel("Open").click();
		await page.getByRole("option", { name: "Email id" }).click();

		await page.getByRole("button", { name: "SORT", exact: true }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_sort");
		});
		expect(response.status()).toBe(200);

		const sort = await page.getByTestId("sort-option");
		await expect(sort).toBeVisible();

		await matchScreenShot({
			page,
			locator: sort,
			screenShotName: "sort_on_multiple_field.png",
		});
	});

	test("sort should persist in page refresh", async () => {
		await expect(page.getByTestId("sort-option")).toBeVisible();

		const prevFilter = await page.getByTestId("sort-option");
		const prevText = await prevFilter.innerText();

		await page.reload({ waitUntil: "load" });

		await page.waitForSelector(".handsontable");
		await page.waitForTimeout(5000);
		await expect(
			page
				.getByRole("columnheader", { name: "icon Name" })
				.locator("div")
				.first(),
		).toBeVisible();

		await expect(page.getByTestId("sort-option")).toBeVisible();

		const afterSort = await page.getByTestId("sort-option");
		const afterText = await afterSort.innerText();

		await matchScreenShot({
			page,
			locator: afterSort,
			screenShotName: "sort_on_multiple_field.png",
		});

		expect(afterText).toEqual(prevText);
	});

	test("sort should update after change in field name", async () => {
		await expect(page.getByTestId("sort-option")).toBeVisible();
		await page.getByTestId("sort-option").click();

		await page
			.locator("._remove_icon_b9hz6_21 > .MuiSvgIcon-root")
			.first()
			.click();
		await page.locator("._remove_icon_b9hz6_21").first().click();
		await page
			.locator("._remove_icon_b9hz6_21 > .MuiSvgIcon-root")
			.first()
			.click();
		await page.locator("form svg").nth(2).click();

		await expect(
			page.getByRole("button", { name: "ADD ANOTHER SORT" }),
		).toBeVisible();
		await page.getByRole("button", { name: "ADD ANOTHER SORT" }).click();

		await expect(
			page.getByTestId("sortObjs-field-0").locator("div").nth(3),
		).toBeVisible();

		await page.getByPlaceholder("Select a field").click();
		await page.getByRole("option", { name: "Email id" }).click();

		await expect(
			page.getByRole("button", { name: "SORT", exact: true }),
		).toBeVisible();
		await page.getByRole("button", { name: "SORT", exact: true }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_sort");
		});
		expect(response.status()).toBe(200);

		await expect(
			page
				.getByRole("columnheader", { name: "icon Email id" })
				.locator("button"),
		).toBeVisible();

		await page
			.getByRole("columnheader", { name: "icon Email id" })
			.locator("button")
			.click();
		await page.getByTestId("edit-field").click();
		await page.getByPlaceholder("Enter field name").click();
		await page
			.getByPlaceholder("Enter field name")
			.press("ControlOrMeta+a");

		await page.getByPlaceholder("Enter field name").fill("Work Email");
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

		const updatedSort = await page.getByTestId("sort-option");
		await expect(updatedSort).toBeVisible();

		await matchScreenShot({
			page,
			locator: updatedSort,
			screenShotName: "updated_sort_text.png",
		});

		await updatedSort.click();
		await page.waitForTimeout(1000);

		await expect(
			page.locator("._field_array_content_b9hz6_10"),
		).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.locator("._field_array_content_b9hz6_10"),
			screenShotName: "sort_after_field_name_change.png",
		});

		await page.getByRole("button", { name: "CANCEL" }).click();

		//revert field Name
		await page
			.getByRole("columnheader", { name: "icon Work Email" })
			.locator("button")
			.click();
		await page.getByTestId("edit-field").click();
		await page.getByPlaceholder("Enter field name").click();
		await page
			.getByPlaceholder("Enter field name")
			.press("ControlOrMeta+a");
		await page.getByPlaceholder("Enter field name").fill("Email id");
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

	test("sort should persist on table change", async () => {
		await page.waitForSelector('[data-testid="sort-option"]');

		await expect(page.getByText("Sorted by Email id")).toBeVisible();
		await expect(
			page.getByTestId("table-name-container-3").getByText("Sort"),
		).toBeVisible();
		await page
			.getByTestId("table-name-container-3")
			.getByText("Sort")
			.click();

		await page.waitForTimeout(5000);

		await expect(
			page
				.getByRole("columnheader", { name: "icon Name" })
				.locator("div")
				.first(),
		).toBeVisible();

		const table2Sort = await page.getByTestId("sort-option");
		await expect(table2Sort).toBeVisible();

		await matchScreenShot({
			page,
			locator: table2Sort,
			screenShotName: "table_2_sort.png",
		});

		await expect(
			page.getByTestId("table-name-container-2").getByText("Table"),
		).toBeVisible();

		await page
			.getByTestId("table-name-container-2")
			.getByText("Table")
			.click();

		await page.waitForTimeout(5000);

		await expect(
			page.getByRole("columnheader", { name: "icon Name" }),
		).toBeVisible();

		await page.waitForSelector('[data-testid="sort-option"]');

		const table1Sort = await page.getByTestId("sort-option");
		await expect(table1Sort).toBeVisible();

		await matchScreenShot({
			page,
			locator: table1Sort,
			screenShotName: "table_1_sort.png",
		});
	});

	test("newly added field should be available in filter", async () => {
		await expect(
			page.getByRole("columnheader", { name: "icon Add" }),
		).toBeVisible();
		await page.getByRole("columnheader", { name: "icon Add" }).click();

		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("Test Field");
		await page.getByPlaceholder("Select a field type").click();
		await page.getByRole("option", { name: "Short Text" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/field/create_field");
		});

		expect(response.status()).toBe(201);

		let getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});

		expect(getViewResponse.status()).toBe(201);

		await expect(
			page
				.getByRole("columnheader", { name: "icon Test Field" })
				.locator("div")
				.first(),
		).toBeVisible();

		await expect(page.getByTestId("sort-option")).toBeVisible();
		await page.getByTestId("sort-option").click();
		await page
			.getByTestId("sortObjs-field-0")
			.locator("div")
			.nth(3)
			.click();

		await page.getByRole("option", { name: "Test Field" }).click();
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

		getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});

		expect(getViewResponse.status()).toBe(201);
	});

	test("clear Sort", async () => {
		await expect(page.getByTestId("sort-option")).toBeVisible();

		await expect(page.getByText("Sorted by Email id")).toBeVisible();

		await page.getByTestId("sort-option").click();

		await page.locator("form svg").nth(2).click();
		await page.getByRole("button", { name: "SORT", exact: true }).click();

		const response = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_sort");
		});
		expect(response.status()).toBe(200);

		await expect(page.getByTestId("sort-option")).toBeVisible();

		const sort = await page.getByTestId("sort-option");

		await matchScreenShot({
			page,
			locator: sort,
			screenShotName: "normal_sort.png",
		});
	});

	test("sort if field is deleted", async () => {
		//test.setTimeout(60000);

		await expect(
			page.getByRole("columnheader", { name: "icon Add" }),
		).toBeVisible();
		await page.getByRole("columnheader", { name: "icon Add" }).click();
		await page.getByPlaceholder("Enter field name").click();
		await page.getByPlaceholder("Enter field name").fill("Delete Field 1");
		await page.getByPlaceholder("Select a field type").click();
		await page.getByRole("option", { name: "Short Text" }).click();
		await page.getByRole("button", { name: "SAVE" }).click();

		let fieldCreateResponse = await page.waitForResponse((resp) => {
			return resp.url().includes("/field/create_field");
		});

		expect(fieldCreateResponse.status()).toBe(201);

		let getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});
		expect(getViewResponse.status()).toBe(201);

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

		expect(fieldCreateResponse.status()).toBe(201);

		getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});
		expect(getViewResponse.status()).toBe(201);

		// case 1: sort apply on field which will be deleted

		await expect(page.getByTestId("sort-option")).toBeVisible();
		await page.getByTestId("sort-option").click();
		await page.getByTestId("sortObjs-field-0").getByLabel("Open").click();
		await page.getByRole("option", { name: "Delete Field 2" }).click();
		await page.getByRole("button", { name: "SORT", exact: true }).click();

		const response1 = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_sort");
		});
		expect(response1.status()).toBe(200);

		await expect(page.getByTestId("sort-option")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.getByTestId("sort-option"),
			screenShotName: "sort_1_before_deleting_field.png",
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

		getViewResponse = await page.waitForResponse((res) => {
			return res.url().includes("/view/get_views");
		});

		expect(getViewResponse.status()).toBe(201);

		await expect(page.getByTestId("sort-option")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.getByTestId("sort-option"),
			screenShotName: "sort_1_after_deleting_field.png",
		});

		// case 2: sort apply on 2 fields, one of them will be deleted

		await page.getByTestId("sort-option").click();
		await page
			.getByTestId("sortObjs-field-0")
			.locator("div")
			.nth(3)
			.click();
		await page.getByRole("option", { name: "Email id" }).click();
		await page.getByRole("button", { name: "ADD ANOTHER SORT" }).click();
		await page
			.getByTestId("sortObjs-field-1")
			.getByPlaceholder("Select a field")
			.click();
		await page.getByRole("option", { name: "Delete Field" }).click();
		await page.getByRole("button", { name: "SORT", exact: true }).click();

		const response2 = await page.waitForResponse((res) => {
			return res.url().includes("/view/update_sort");
		});
		expect(response2.status()).toBe(200);

		await expect(page.getByTestId("sort-option")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.getByTestId("sort-option"),
			screenShotName: "sort_2_before_deleting_field.png",
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

		await expect(page.getByTestId("sort-option")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.getByTestId("sort-option"),
			screenShotName: "sort_2_after_deleting_field.png",
		});

		await page.getByTestId("sort-option").click();
		await page.waitForTimeout(1000);

		await expect(page.locator("form")).toBeVisible();

		await matchScreenShot({
			page,
			locator: page.locator("form"),
			screenShotName: "sort_form.png",
		});

		await page.locator("form svg").nth(2).click();
		await page.getByRole("button", { name: "SORT", exact: true }).click();
	});
});
