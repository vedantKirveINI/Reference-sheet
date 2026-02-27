import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import Currency from "./Currency";

export default class CurrencyEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
	}

	createElements() {
		const currencyNode = document.querySelector("#root-currency-editor");
		if (currencyNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-currency-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	open() {
		super.open();
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<Currency
				initialValue={this.originalValue}
				onChange={this.setValue.bind(this)}
				ref={this.inputRef}
				cellProperties={this.cellProperties}
				superClose={super.close.bind(this)}
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

	setValue(currencyDetails) {
		if (typeof currencyDetails !== "string" && currencyDetails) {
			this.originalValue = JSON.stringify(currencyDetails);
		} else {
			this.originalValue = currencyDetails;
		}
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
