import Handsontable from "handsontable";

class CustomTextEditor extends Handsontable.editors.TextEditor {
	open() {
		super.open();
		this.TEXTAREA.setAttribute("data-testid", "text-editor");
	}

	close() {
		super.close();
	}

	getValue() {
		return this.TEXTAREA.value;
	}

	setValue(value) {
		super.setValue(value);
	}

	focus() {
		this.TEXTAREA.focus();
	}
}

export default CustomTextEditor;
