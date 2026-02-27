import { expect } from "@playwright/test";

async function waitForResponseAndCheckStatus({
	page = {},
	urlSubstring = "",
	expectedStatus = 200,
}) {
	const response = await page.waitForResponse((res) =>
		res.url().includes(urlSubstring),
	);

	expect(response.status()).toBe(expectedStatus);
	return response;
}

async function removeColumn(page = {}, columnName = "") {
	await page
		.getByRole("columnheader", { name: columnName })
		.locator("button")
		.click();
	await page.getByTestId("remove-column").click();
	await page.getByRole("button", { name: "DELETE", exact: true }).click();

	await waitForResponseAndCheckStatus({
		page,
		urlSubstring: "/field/update_fields_status",
		expectedStatus: 200,
	});
}

async function matchScreenShot({
	page = {},
	locator = {},
	screenShotName = "",
}) {
	const box = await locator.boundingBox();
	await expect(page).toHaveScreenshot(screenShotName, {
		clip: box,
		maxDiffPixelRatio: 0.05,
	});
}

async function performColumnResizeEvent({ page = {}, dragDistance = 150 }) {
	// Locate the resizer element
	const resizer = page.locator(".manualColumnResizer");

	// Get the bounding box of the resizer to determine its current position
	const box = await resizer.boundingBox();

	if (box) {
		// Perform the drag action
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); // Move to the center of the resizer
		await page.mouse.down(); // Press the mouse button
		await page.mouse.move(box.x + dragDistance, box.y + box.height / 2); // Drag to the right by 100 pixels
		await page.mouse.up(); // Release the mouse button
	}
}

async function waitForElementToBeVisible({
	page = {},
	locator = {},
	targetLocator = {},
	retryInterval = 1000,
	maxRetries = 5,
}) {
	let isVisible = false;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		await locator.click();

		// Check if the menu item is visible
		isVisible = await targetLocator.isVisible();

		if (isVisible) {
			break; // Exit the loop if the element is visible
		}

		// Wait before retrying
		await page.waitForTimeout(retryInterval);
	}
}

async function deleteColumn(page) {
	await page.locator('[class*="expand_icon"]').click();
	await page.getByTestId("ods-context-menu-item").nth(3).click();
	await page.getByText("DELETE").nth(4).click();
}

export {
	waitForResponseAndCheckStatus,
	removeColumn,
	matchScreenShot,
	performColumnResizeEvent,
	waitForElementToBeVisible,
	deleteColumn,
};
