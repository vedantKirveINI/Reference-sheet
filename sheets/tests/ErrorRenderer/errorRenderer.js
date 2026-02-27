import { matchScreenShot } from "../utils/helper";

async function errorRendererPart1({ page }) {
	await page
		.getByRole("columnheader", { name: "icon Yes/No" })
		.getByTestId("column-yes-no-0")
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "error-renderer-part-1.png",
	});
}

async function errorRendererPart2({ page }) {
	await page.getByText("Error renderers test").click();
	await page.waitForSelector(".handsontable");

	await page
		.getByRole("row", { name: "icon Address details icon" })
		.getByTestId("column-address-0")
		.waitFor({ state: "visible" });

	await matchScreenShot({
		page,
		locator: page.locator(".wtHolder").first(),
		screenShotName: "error-renderer-part-2.png",
	});
}

// async function cellEditorOfErrorRenderer({ page }) {}

export { errorRendererPart1, errorRendererPart2 };
