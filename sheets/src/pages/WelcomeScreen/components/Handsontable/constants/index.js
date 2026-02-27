import {
	ARROW_DOWN_ICON,
	ARROW_LEFT_ICON,
	ARROW_RIGHT_ICON,
	ARROW_UP_ICON,
	CLOSE_ICON,
	EDIT_ICON,
	TRASH_ICON,
} from "../../../../../constants/Icons/commonIcons";

const PASTE_SUPPORTED_FIELD_TYPES = [
	"SHORT_TEXT",
	"LONG_TEXT",
	"NUMBER",
	"EMAIL",
];

const getCustomMenuConfig = ({
	key = "",
	isMultipleRowsSelected = false,
	isMultipleColumnsSelected = false,
}) => {
	const CUSTOM_MENU_CONFIG = {
		edit_field: {
			title: "Edit the selected column",
			icon: EDIT_ICON,
			alt: "edit",
			name: "Edit field",
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "edit-field",
		},

		col_left: {
			title: "Insert column to the left of the selected column",
			icon: ARROW_LEFT_ICON,
			alt: "arrow_left",
			name: "Insert column left",
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "col-left",
		},

		col_right: {
			title: "Insert column to the right of the selected column",
			icon: ARROW_RIGHT_ICON,
			alt: "arrow_right",
			name: "Insert column right",
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "col-right",
		},

		remove_column: {
			title: `Delete the selected column${
				isMultipleColumnsSelected ? "s" : ""
			}`,
			icon: TRASH_ICON,
			alt: "delete",
			name: `Delete column${isMultipleColumnsSelected ? "s" : ""}`,
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "remove-column",
		},

		clear_column: {
			title: `Clear the data of the selected column ${
				isMultipleColumnsSelected ? "s" : ""
			}`,
			icon: CLOSE_ICON,
			alt: "clear",
			name: `Clear column${isMultipleColumnsSelected ? "s" : ""}`,
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "clear-column",
		},

		row_above: {
			title: "Insert row above the selected row",
			icon: ARROW_UP_ICON,
			alt: "arrow_up",
			name: "Insert row above",
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "row-above",
		},

		row_below: {
			title: "Insert row below the selected row",
			icon: ARROW_DOWN_ICON,
			alt: "arrow_down",
			name: "Insert row below",
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "row-below",
		},

		remove_row: {
			title: `Remove the selected row${
				isMultipleRowsSelected ? "s" : ""
			}`,
			icon: TRASH_ICON,
			alt: "delete",
			name: `Delete row${isMultipleRowsSelected ? "s" : ""}`,
			style: "width: 1.5rem; height: 1.5rem;",
			data_test_id: "remove-row",
		},
	};

	return CUSTOM_MENU_CONFIG[key];
};

const ALLOWED_CUSTOM_ATTRIBUTES = [
	"delete-modal-checkbox",
	"cancel-button",
	"delete-dialog",
	"text-wrap-autocomplete",
	"text-wrap-options",
];

const MINIMUM_COLUMN_WIDTH = 140;
const MAXIMUM_COLUMN_WIDTH_ON_DOUBLE_CLICK = 800;

const HIDDEN_CHIP_SELECTOR_MAPPING = {
	RANKING: `[data-hidden-ranking-chip]`,
	MCQ: `[data-hidden-mcq-chip]`,
	DROP_DOWN_STATIC: "[data-hidden-dropdown-static-chip]",
};

const LIMIT_CHIP_SELECTOR_MAPPING = {
	RANKING: `[data-ranking-limit-chip]`,
	MCQ: `[data-mcq-limit-chip]`,
	DROP_DOWN_STATIC: "[data-dropdown-static-limit-chip]",
};

const COLUMN_WIDTH_MAPPING = {
	// Text based fields
	SHORT_TEXT: 140, // Short Text: 140px
	LONG_TEXT: 240, // Long Text: 140px
	EMAIL: 140, // Email: 140px
	ADDRESS: 140, // Address: 140px

	// Number based fields
	NUMBER: 140, // Number: 140px
	ZIP_CODE: 140, // Zip-code: 140px
	PHONE_NUMBER: 140, // Phone Number: 140px

	// Selection based fields
	YES_NO: 140, // Yes/No: 140px
	SCQ: 140, // Single Choice (SCQ): 140px
	DROP_DOWN: 140, // Dropdown: 140px
	MCQ: 140, // Multiple Choice Question: 140px
	DROP_DOWN_STATIC: 140, // Dropdown Static: 140px

	// Date and time
	DATE: 140, // Date: 140px
	TIME: 140, // Time: 140px

	// Other types
	FILE_UPLOAD: 140, // File Upload: 140px
	SIGNATURE: 140, // Signature: 140px

	// Default width for any unspecified type
	DEFAULT: 140,
};

// Configuration for which menu items should be hidden when multiple columns are selected
const MULTIPLE_COLUMN_HIDDEN_ITEMS = ["edit_field", "col_left", "col_right"];

export {
	PASTE_SUPPORTED_FIELD_TYPES,
	getCustomMenuConfig,
	ALLOWED_CUSTOM_ATTRIBUTES,
	MINIMUM_COLUMN_WIDTH,
	HIDDEN_CHIP_SELECTOR_MAPPING,
	LIMIT_CHIP_SELECTOR_MAPPING,
	COLUMN_WIDTH_MAPPING,
	MAXIMUM_COLUMN_WIDTH_ON_DOUBLE_CLICK,
	MULTIPLE_COLUMN_HIDDEN_ITEMS,
};
