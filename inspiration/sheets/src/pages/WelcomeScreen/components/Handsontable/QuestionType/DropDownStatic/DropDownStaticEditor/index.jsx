import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import DropDownStatic from "./DropDownStatic";

export default class DropDownStaticEditor extends Handsontable.editors
	.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
	}

	createElements() {
		const mcqNode = document.querySelector("#root-dropdown-static-editor");
		if (mcqNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-dropdown-static-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<DropDownStatic
				initialValue={this.originalValue}
				onChange={this.setValue.bind(this)}
				cellProperties={this.cellProperties}
				ref={this.inputRef}
				superClose={super.close.bind(this)}
				editorDimension={this.TEXTAREA.getBoundingClientRect()}
			/>,
		);
	}

	open() {
		super.open();
	}

	prepare(row, col, prop, td, originalValue, cellProperties) {
		super.prepare(row, col, prop, td, originalValue, cellProperties);
		this.createElements();
	}

	beginEditing(initialValue, event) {
		this.initReactComponent();
		super.beginEditing(initialValue, event);
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

	finishEditing(restoreOriginalValue, ctrlDown) {
		super.finishEditing(restoreOriginalValue, ctrlDown);
	}

	close() {
		if (this.root) {
			this.root.unmount();
			this.root = null; // Ensure the root is reset after unmounting
		}

		super.close();
	}
}
