import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import FilePickerContent from "./FilePickerContent";

export default class FilePickerEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;

		this.isFileUploadOpen = false;
	}

	setIsFileUploadOpen(isOpen) {
		this.isFileUploadOpen = isOpen;
	}

	createElements() {
		const fileUploadNode = document.querySelector(
			"#root-file-upload-editor",
		);
		if (fileUploadNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-file-upload-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<FilePickerContent
				initialValue={this.originalValue}
				cellProperties={this.cellProperties}
				onChange={this.onChange.bind(this)}
				superClose={this.close.bind(this)}
				setIsFileUploadOpen={this.setIsFileUploadOpen.bind(this)}
			/>,
		);
	}

	prepare(row, col, prop, td, originalValue, cellProperties) {
		super.prepare(row, col, prop, td, originalValue, cellProperties);
		this.createElements();
	}

	beginEditing(initialValue, event) {
		this.initReactComponent();

		super.beginEditing(initialValue, event);
	}

	onChange(files) {
		// this.hot.destroyEditor();
		this.hot.setDataAtCell(this.row, this.col, files);
	}

	setValue(value) {
		if (typeof value !== "string") {
			this.originalValue = JSON.stringify(value);
		} else {
			this.originalValue = value;
		}

		this.close();
	}

	finishEditing(restoreOriginalValue, ctrlDown) {
		// if (!this.show) {
		super.finishEditing(restoreOriginalValue, ctrlDown);
		// }
	}

	getValue() {
		if (!this.originalValue) return (this.originalValue = null);
		return this.originalValue;
	}

	focus() {
		if (this?.inputRef?.current) {
			this.inputRef.current.focus();
		}
	}

	close() {
		if (!this.isFileUploadOpen && this.state === "STATE_FINISHED") {
			if (this.root) {
				this.root.unmount();
				this.root = null;
			}
			super.close();
		}
	}
}
