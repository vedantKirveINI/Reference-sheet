import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import Time from "./Time";

export default class CustomTimeEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
	}

	prepare(row, col, prop, td, originalValue, cellProperties) {
		super.prepare(row, col, prop, td, originalValue, cellProperties);
		this.createElements();
	}

	createElements() {
		const timeNode = document.querySelector("#root-time-editor");
		if (timeNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-time-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	beginEditing(initialValue, event) {
		this.initReactComponent();
		super.beginEditing(initialValue, event);
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<Time
				ref={this.inputRef}
				initialValue={this.originalValue}
				onChange={this.setValue.bind(this)}
				cellProperties={this.cellProperties}
				superClose={super.close.bind(this)}
			/>,
		);
	}

	open() {
		super.open();
	}

	focus() {
		this?.inputRef?.current?.focus();
	}

	setValue(timeValue) {
		if (timeValue && typeof timeValue !== "string") {
			this.originalValue = JSON.stringify(timeValue);
		} else {
			this.originalValue = timeValue;
		}
	}

	getValue() {
		if (!this.originalValue) return (this.originalValue = null);
		return this.originalValue;
	}

	close() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}

		super.close();
	}
}
