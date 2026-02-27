import { expect } from "@playwright/test";

export const verifyFileUploadViewFiles = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell210 = await getCell(2, 10);

	await page.waitForTimeout(800);

	await cell210.dblclick();

	const fileIcon = await page
		.locator(".ht_clone_master")
		.getByTestId("file-editor-icon-0");

	await fileIcon.highlight();

	await expect(fileIcon).toBeVisible();

	await fileIcon.click();

	await expect(page.getByRole("dialog")).toBeVisible();

	const viewBtn = await page
		.getByTestId("file-viewer-0")
		.getByTestId("view-icon");

	await expect(viewBtn).toBeVisible();

	const page1Promise = page.waitForEvent("popup");

	await viewBtn.click();

	await page1Promise;

	await page.getByRole("button", { name: "CLOSE" }).click();
};

export const verifyFileUploadDeleteFile = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const getTotalFile = async () => {
		return await page
			.getByTestId("file-viewer-container")
			.locator("> div")
			.count();
	};

	const cell210 = await getCell(2, 10);
	await page.waitForTimeout(800);
	await cell210.dblclick();

	const fileIcon = page
		.locator(".ht_clone_master")
		.getByTestId("file-editor-icon-0");

	await expect(fileIcon).toBeVisible();
	await fileIcon.click();

	const beforeDelete = await getTotalFile();
	await page.getByTestId("file-viewer-0").getByTestId("delete-icon").click();

	const afterDelete = await getTotalFile();
	expect(afterDelete).toBe(beforeDelete - 1);

	await page.getByTestId("ods-dialog-title").getByTestId("ods-icon").click();
};

export const verifyFileUploadDownloadFile = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell210 = await getCell(2, 10);

	await page.waitForTimeout(800);
	await cell210.dblclick();

	const fileIcon = await page
		.locator(".ht_clone_master")
		.getByTestId("file-editor-icon-0");

	await fileIcon.highlight();

	await expect(fileIcon).toBeVisible();

	await fileIcon.click();

	await expect(page.getByRole("dialog")).toBeVisible();

	const downloadBtn = await page
		.getByTestId("file-viewer-0")
		.getByTestId("download-icon");

	await expect(downloadBtn).toBeVisible();
	await downloadBtn.highlight();

	await downloadBtn.click();

	const response = await page.waitForResponse(
		(response) =>
			response.url().includes("https://ccc.oute.app/test") &&
			response.status() === 200,
	);

	// Assert that the response was successful
	expect(response.status()).toBe(200);

	await page.getByRole("button", { name: "CLOSE" }).click();
};

export const verifyFileUpload = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	// Locate the target cell and double-click to activate it
	const cell = await getCell(2, 10);
	await page.waitForTimeout(800);
	await cell.dblclick();

	// Click on the file upload icon to open the file picker
	await page
		.locator('[data-testid="file-upload-add-icon"]')
		.click({ force: true });

	// Locate the file input element and upload the file
	const fileInput = page.locator('input[type="file"]');
	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/day.csv",
	);

	await fileInput.setInputFiles(
		"tests/test-files/importCSVTestFiles/industry.csv",
	);

	// Click the 'UPLOAD' button to initiate the upload
	await page.getByRole("button", { name: "UPLOAD" }).click();

	// Wait for the upload response and validate its status
	const response = await page.waitForResponse(
		(resp) =>
			resp.url() === "https://upload.oute.app/upload" &&
			resp.status() === 200,
	);

	// Assert that the response status is 200
	expect(response.status()).toBe(200);
};
