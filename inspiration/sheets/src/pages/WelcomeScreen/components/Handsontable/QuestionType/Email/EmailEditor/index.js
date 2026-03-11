import Handsontable from "handsontable";
import isEmpty from "lodash/isEmpty";

import { EMAIL_REGEX } from "../../../../../../../constants/regex";

class CustomEmailEditor extends Handsontable.editors.TextEditor {
	open() {
		super.open();
		this.TEXTAREA.setAttribute("data-testid", "email-editor");
	}

	close() {
		this.TEXTAREA.style.boxShadow = "inset 0 0 0 0.125rem #212121";
		super.close();
	}

	getValue() {
		const value = this.TEXTAREA.value;
		const isValidEmail = this.validateEmail(value);

		// Change box shadow based on email validation
		this.TEXTAREA.style.boxShadow = isValidEmail
			? "inset 0 0 0 0.125rem #212121"
			: "inset 0 0 0 0.125rem #ff5252";

		return value;
	}

	validateEmail(email) {
		// Simple email validation regex
		return EMAIL_REGEX.test(email) || isEmpty(email);
	}

	setValue(value) {
		super.setValue(value);
	}

	focus() {
		this.TEXTAREA.focus();
	}
}

export default CustomEmailEditor;
