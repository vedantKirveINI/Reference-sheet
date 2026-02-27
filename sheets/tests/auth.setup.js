import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
	await page.goto("/");

	await page.getByPlaceholder("Email").click();
	await page
		.getByPlaceholder("Email")
		.fill("abhay.gupta@instinctinnovations.com");
	await page.getByPlaceholder("Email").press("Tab");
	await page.getByPlaceholder("Password").fill("abhay@78");
	await page.getByRole("button", { name: "Sign In", exact: true }).click();

	await page.context().storageState({ path: authFile });

	await page.close();
});
