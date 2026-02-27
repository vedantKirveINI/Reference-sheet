import { matchScreenShot } from "../utils/helper";

async function openUserProfileContextMenu({ page }) {
	await page.getByTestId("user-avatar-icon").click();

	await page.getByRole("menu").waitFor({ state: "visible" });

	await page.getByRole("menuitem", { name: "Logout" }).waitFor({
		state: "visible",
	});

	await matchScreenShot({
		page,
		locator: page.locator("body"),
		screenShotName: "user-profile-context-menu.png",
	});
	await page.getByRole("menuitem", { name: "My Account" }).click();
	await page.waitForLoadState("load");
	await page.getByTestId("profile-container").waitFor({ state: "visible" });
}

async function openReferralPage({ page }) {
	await page.getByTestId("user-avatar-icon").click();

	await page.getByRole("menu").waitFor({ state: "visible" });

	await page.getByRole("menuitem", { name: "Logout" }).waitFor({
		state: "visible",
	});

	await page.getByRole("menuitem", { name: "Referral & Credits" }).click();
	await page.waitForLoadState();
	await page
		.getByTestId("referral-and-credits-label")
		.waitFor({ state: "visible" });
}

export { openUserProfileContextMenu, openReferralPage };
