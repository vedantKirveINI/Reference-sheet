import { test, expect } from "@playwright/test";
import {
	verifyFileUpload,
	verifyFileUploadDeleteFile,
	verifyFileUploadDownloadFile,
	verifyFileUploadViewFiles,
} from "./fileUpload";

test.describe("File Upload", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();
		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicHIiOiJWNTU2YnA3QjIiLCJwYSI6IlY1NTZicDdCMiIsImEiOiJVLXJwSE14YloiLCJ0IjoiY20xa29kanZrMDUxbTEwbGRlMnhzMHB4ayIsInYiOiJjbTFrb2RqeWgwNTFuMTBsZHJtMXQ3c2h1In0%3D`,
		);
		await page.waitForSelector(".handsontable");

		await page
			.getByRole("columnheader", { name: "icon File Upload" })
			.getByTestId("column-file-picker-8")
			.waitFor({ state: "visible" });
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Should successfully upload CSV file in cell editor and receive 200 status", async () => {
		await verifyFileUpload({ page });
	});

	test("fileUpload: view files", async () => {
		await verifyFileUploadViewFiles({ page });
	});

	test("fileUpload: delete file", async () => {
		await verifyFileUploadDeleteFile({ page });
	});

	test("fileUpload: download file", async () => {
		await verifyFileUploadDownloadFile({ page });
	});
});
