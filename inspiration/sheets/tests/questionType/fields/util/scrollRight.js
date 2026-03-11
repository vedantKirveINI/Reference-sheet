async function scrollRight({ page, n = 4 }) {
	const container = await page.locator(".ht_master .wtHolder");

	const boundingBox = await container.boundingBox();

	if (boundingBox) {
		await page.mouse.move(
			boundingBox.x + boundingBox.width / 2,
			boundingBox.y + boundingBox.height / 2,
		);
	}

	for (let i = 0; i < n; i++) {
		await page.mouse.wheel(150, 0);
	}
}

export default scrollRight;
