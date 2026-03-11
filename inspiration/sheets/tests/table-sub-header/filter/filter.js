import {
	addCondition,
	applyFilter,
	enterFilterValue,
	openFilter,
	selectCondition,
	selectField,
	takeScreenshot,
} from "./utils";

async function filterTextWithContainsCondition({ page }) {
	await openFilter({ page });
	await addCondition({ page, buttonName: "Add condition" });

	await selectField({ page, fieldName: "Name" });
	await selectCondition({ page, condition: "contains..." });
	await enterFilterValue({ page, value: "e" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-text-with-contains-condition.png",
	});
}

async function filterTextWithDoesNotContainsCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "Name" });
	await selectCondition({ page, condition: "does not contains..." });
	await enterFilterValue({ page, value: "e" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-text-with-does-not-contains-condition.png",
	});
}

async function filterTextWithIsCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "Name" });
	await selectCondition({ page, condition: "is..." });
	await enterFilterValue({ page, value: "Karan" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-text-with-is-condition.png",
	});
}

async function filterTextWithIsNotCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "Name" });
	await selectCondition({ page, condition: "is not..." });
	await enterFilterValue({ page, value: "Karan" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-text-with-is-not-condition.png",
	});
}

async function filterTextWithIsEmptyCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "Name" });
	await selectCondition({ page, condition: "is empty" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-text-with-is-empty-condition.png",
	});
}

async function filterTextWithIsNotEmptyCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "Name" });
	await selectCondition({ page, condition: "is not empty" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-text-with-is-not-empty-condition.png",
	});
}

async function filterNumberWithEqualToCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "score out of 100" });
	await selectCondition({ page, condition: "=" });
	await enterFilterValue({ page, value: "25" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-number-with-equal-to-condition.png",
	});
}

async function filterNumberWithNotEqualToCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "score out of 100" });
	await selectCondition({ page, condition: "≠" });
	await enterFilterValue({ page, value: "25" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-number-with-not-equal-to-condition.png",
	});
}

async function filterNumberWithGreaterThanCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "score out of 100" });
	await selectCondition({ page, condition: ">" });
	await enterFilterValue({ page, value: "50" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-number-with-greater-than-condition.png",
	});
}

async function filterNumberWithLessThanCondition({ page }) {
	await openFilter({ page });

	await selectField({ page, fieldName: "score out of 100" });
	await selectCondition({ page, condition: "<" });
	await enterFilterValue({ page, value: "50" });

	await applyFilter({ page });
	await takeScreenshot({
		page,
		screenshotName: "filter-number-with-less-than-condition.png",
	});
}

export {
	filterTextWithContainsCondition,
	filterTextWithDoesNotContainsCondition,
	filterTextWithIsCondition,
	filterTextWithIsNotCondition,
	filterTextWithIsEmptyCondition,
	filterTextWithIsNotEmptyCondition,
	filterNumberWithEqualToCondition,
	filterNumberWithNotEqualToCondition,
	filterNumberWithGreaterThanCondition,
	filterNumberWithLessThanCondition,
};
