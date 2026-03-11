import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import DateTimePickerEditor from "./DateTimePickerEditor";

export default class DateTimePicker extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
		this.isPopperOpen = false;
	}

	setIsPopperOpen(isOpen) {
		this.isPopperOpen = isOpen;
	}

	createElements() {
		const dateTimePickerNode = document.querySelector(
			"#root-date-time-editor",
		);
		if (dateTimePickerNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-date-time-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	open() {
		super.open();
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<DateTimePickerEditor
				initialValue={this.originalValue}
				onChange={this.setValue.bind(this)}
				cellProperties={this.cellProperties}
				superClose={super.close.bind(this)}
				setIsPopperOpen={this.setIsPopperOpen.bind(this)}
				ref={this.inputRef}
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

	setValue(dateDetails) {
		this.originalValue = dateDetails;
	}

	getValue() {
		if (!this.originalValue) return (this.originalValue = null);

		return this.originalValue;
	}

	focus() {
		if (this.inputRef.current) {
			this.inputRef.current.focus();
		}
	}

	close() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
		super.close();
	}

	finishEditing() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
		super.finishEditing();
	}
}
