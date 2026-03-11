import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import Scq from "./Scq";

export default class ScqEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
	}

	createElements() {
		const scqNode = document.querySelector("#root-scq-editor");
		if (scqNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-scq-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	open() {
		super.open();
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<Scq
				initialValue={this.originalValue}
				onChange={this.setValue.bind(this)}
				cellProperties={this.cellProperties}
				ref={this.inputRef}
				superClose={super.close.bind(this)}
				editorDimension={this.TEXTAREA.getBoundingClientRect()}
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
			this.root = null;
		}

		super.close();
	}
}
