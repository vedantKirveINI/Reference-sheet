import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import Checkbox from "./checkbox";

export default class CheckboxEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
	}

	createElements() {
		super.createElements();
		const checkboxNode = document.querySelector("#root-checkbox-editor");

		if (checkboxNode) return;

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.textareaStyle = this.TEXTAREA.style;
		this.TEXTAREA.setAttribute("data-hot-input", true);
		this.TEXTAREA_PARENT.setAttribute("id", "root-checkbox-editor");
		this.TEXTAREA.type = "checkbox";
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);

		const root = createRoot(this.TEXTAREA);

		root.render(
			<Checkbox
				initialValue={this.originalValue}
				onChange={this.onChange.bind(this)}
				cellProperties={this.cellProperties}
			/>,
		);
	}

	prepare(row, col, prop, td, originalValue, cellProperties) {
		super.prepare(row, col, prop, td, originalValue, cellProperties);
		this.createElements();
	}

	onChange(selectedOtpions) {
		this.hot.destroyEditor();
		this.hot.setDataAtCell(this.row, this.col, selectedOtpions);
	}

	setValue(value) {
		this.originalValue = value;
	}

	getValue() {
		if (!this.originalValue) return (this.originalValue = null);
		return this.originalValue;
	}

	focus() {
		this?.inputRef?.current?.focus();
	}

	close() {
		if (this.root) {
			this.root.unmount();
			this.root = null; // Ensure the root is reset after unmounting
		}

		super.close();
	}
}
