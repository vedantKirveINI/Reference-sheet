import { test } from "@playwright/test";
import {
	// cellEditorOfErrorRenderer,
	errorRendererPart1,
	errorRendererPart2,
} from "./errorRenderer";

test.describe("Error renderers in tiny table", () => {
	let page;

	test.beforeAll(async ({ browser, baseURL }) => {
		page = await browser.newPage();

		await page.goto(
			`${baseURL}/?q=eyJ3IjoicFQ5dkFMeDIzIiwicGoiOiJNMncxY1Q0OFEiLCJwciI6Ik0ydzFjVDQ4USIsImEiOiJYZ2FacDJRaXkiLCJ0IjoiY20zcHBqdHB2MDBzbnN6ZXBhMXFqaWp5ZCIsInYiOiJjbTNwcGp0dG8wMHNvc3plcDFtOXlmbXQyIn0%3D`,
		);

		await page.waitForSelector(".handsontable");
	});

	test.afterAll(async () => {
		await page.close();
	});

	test("Error renderer of question types: scq, yes no, file upload", async ({}) => {
		await errorRendererPart1({ page });
	});

	test("Error renderer of question types: address, dropdown, mcq, email, phone number, zip code, currency", async () => {
		await errorRendererPart2({ page });
	});

	// TODO: write test cases on editor of error renderer
	// test("Cell editor of errored data", async () => {
	// 	await cellEditorOfErrorRenderer({ page });
	// });
});
