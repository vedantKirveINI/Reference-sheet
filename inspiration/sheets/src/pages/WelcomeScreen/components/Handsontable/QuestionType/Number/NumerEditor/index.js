import Handsontable from "handsontable";

import { NUMBER_PATTERN } from "../../../../../../../constants/regex";

class CustomNumberEditor extends Handsontable.editors.TextEditor {
	open() {
		super.open();
		this.TEXTAREA.setAttribute("data-testid", "number-editor");

		// Add an input event listener to block invalid characters
		this.TEXTAREA.addEventListener("input", this.handleInput.bind(this));
	}

	close() {
		// Remove the event listener to prevent memory leaks
		this.TEXTAREA.removeEventListener("input", this.handleInput.bind(this));

		this.TEXTAREA.style.boxShadow = "inset 0 0 0 0.125rem #212121";
		super.close();
	}

	handleInput() {
		const value = this.TEXTAREA.value;

		// Allow only numbers that match the pattern
		if (!this.validateNumber(value)) {
			this.TEXTAREA.value = value.replace(/[^+\-.\d]/g, ""); // Remove invalid characters
		}
	}

	getValue() {
		const value = this.TEXTAREA.value;

		if (value === "") return "";

		const validateNumber = this.validateNumber(value);

		this.TEXTAREA.style.boxShadow = validateNumber
			? "inset 0 0 0 0.125rem #212121"
			: "inset 0 0 0 0.125rem #ff5252";

		return value;
	}

	validateNumber(numString) {
		return NUMBER_PATTERN.test(numString);
	}

	setValue(value) {
		super.setValue(value);
	}

	focus() {
		this.TEXTAREA.focus();
	}
}

export default CustomNumberEditor;
