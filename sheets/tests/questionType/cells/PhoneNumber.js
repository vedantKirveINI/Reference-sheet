import { expect } from "@playwright/test";

async function phoneNumberWithValidInputSaveOnOuterClick({ page }) {
	await page.locator("td:nth-child(11)").first().scrollIntoViewIfNeeded();

	await page.waitForTimeout(800);
	// Double click to edit the phone number
	await page.locator("td:nth-child(11)").first().dblclick();

	// Fill the input box with the new phone number
	await page
		.getByTestId("phone-number-editor")
		.getByRole("textbox")
		.fill("99304-89751");

	// Get the value of the input (phone number)
	const inputValue = await page
		.getByTestId("phone-number-editor")
		.getByRole("textbox")
		.inputValue(); // Playwright's function to get the value of an input element

	// Get the src attribute of the image (flag) to see if Initial flag is India
	const imgSrc = await page
		.getByTestId("phone-number-editor")
		.getByRole("img", { name: "flag" }) // Use the alt attribute to locate the image
		.getAttribute("src");

	await page.locator("tr:nth-child(4) > td:nth-child(11)").click();

	// Validate that the input value matches the expected phone number
	expect(inputValue).toBe("99304-89751");

	// (Optional) You can add assertions for the `imgSrc` as well if needed
	expect(imgSrc).toBe("https://flagcdn.com/256x192/in.png");
}

async function phoneNumberInputSaveOnEnterClick({ page }) {
	await page.locator("td:nth-child(11)").first().scrollIntoViewIfNeeded();
	await page.waitForTimeout(800);

	await page.locator("td:nth-child(11)").first().dblclick();

	// Fill the input box with the new phone number
	await page.getByTestId("phone-number-editor").getByRole("textbox").fill("");

	await page
		.getByTestId("phone-number-editor")
		.getByRole("textbox")
		.fill("12345-67890");

	// Get the value of the input (phone number)
	const inputValue = await page
		.getByTestId("phone-number-editor")
		.getByRole("textbox")
		.inputValue(); // Playwright's function to get the value of an input element

	// Get the src attribute of the image (flag) to see if Initial flag is India
	const imgSrc = await page
		.getByTestId("phone-number-editor")
		.getByRole("img", { name: "flag" }) // Use the alt attribute to locate the image
		.getAttribute("src");

	await page.keyboard.press("Enter");

	// Validate that the input value matches the expected phone number
	expect(inputValue).toBe("12345-67890");

	// (Optional) You can add assertions for the `imgSrc` as well if needed
	expect(imgSrc).toBe("https://flagcdn.com/256x192/in.png");
}

async function phoneNumberWithOnlyFlagSelection({ page }) {
	await page.locator("td:nth-child(11)").first().scrollIntoViewIfNeeded();

	await page.waitForTimeout(800);
	await page.locator("tr:nth-child(2) > td:nth-child(11)").click();
	await page.locator(".current").first().click();

	await page.getByTestId("country-input").click();

	await page.getByText("Australia+").click();

	await page.locator("tr:nth-child(3) > td:nth-child(11)").click();

	const countryCode = await page
		.locator("tr:nth-child(2) > td:nth-child(11)")
		.innerText();

	expect(countryCode).toBe("");

	await page
		.locator("tr:nth-child(2) > td:nth-child(11)")
		.scrollIntoViewIfNeeded();
	await page.locator("tr:nth-child(2) > td:nth-child(11)").dblclick();

	await page.getByTestId("country-input").click();

	await page.getByPlaceholder("Search Country").click();
	await page.getByPlaceholder("Search Country").fill("mong");
	await page.getByText("Mongolia+").click();

	await page.locator("td:nth-child(10)").first().click();

	expect(countryCode).toBe("");
}

async function phoneNumberWhenInputIsClearedWithoutFlagSelection({ page }) {
	await page.locator("td:nth-child(11)").first().scrollIntoViewIfNeeded();
	await page.waitForTimeout(800);

	// Act: Double click to edit the phone number
	await page.locator("td:nth-child(11)").first().dblclick();

	// Act: Clear the input field
	await page.getByTestId("phone-number-editor").getByRole("textbox").clear();

	await page.locator("td:nth-child(10)").first().click();

	const cellValue = await page
		.locator("td:nth-child(11)")
		.first()
		.innerText();

	// Assert: The input field is empty again
	expect(await cellValue).toBe("");

	await page.locator("tr:nth-child(2) > td:nth-child(11)").click();
	await page.keyboard.press("Backspace");

	expect(
		await page.locator("tr:nth-child(2) > td:nth-child(11)").innerText(),
	).toBe("");
}

export {
	phoneNumberWithValidInputSaveOnOuterClick,
	phoneNumberInputSaveOnEnterClick,
	phoneNumberWithOnlyFlagSelection,
	phoneNumberWhenInputIsClearedWithoutFlagSelection,
};
