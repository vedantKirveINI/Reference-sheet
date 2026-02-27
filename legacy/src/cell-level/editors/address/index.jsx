import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import Address from "./Address";

export default class AddressEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
		this.show = false; // Use a simple instance variable for state
	}

	createElements() {
		const addressNode = document.querySelector("#root-address-editor");
		if (addressNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-address-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<Address
				initialValue={this.originalValue}
				onChange={this.onChange.bind(this)}
				cellProperties={this.cellProperties}
				show={this.show} // Pass `show` state
				setShow={this.setShow.bind(this)} // Pass `setShow` method
				close={this.close.bind(this)}
			/>,
		);
	}

	prepare(row, col, prop, td, originalValue, cellProperties) {
		super.prepare(row, col, prop, td, originalValue, cellProperties);
		this.createElements();
	}

	beginEditing(initialValue, event) {
		this.setShow(true); // Open the modal

		this.initReactComponent();
		super.beginEditing(initialValue, event);
	}

	onChange(addressDetails) {
		this.hot.destroyEditor();
		this.hot.setDataAtCell(this.row, this.col, addressDetails);
	}

	setShow(value) {
		this.show = value; // Update the instance variable
		// if (this.root) {
		// 	this.initReactComponent(); // Re-render the React component to apply the new value
		// }
	}

	setValue(value) {
		if (typeof value !== "string") {
			this.originalValue = JSON.stringify(value);
		} else {
			this.originalValue = value;
		}

		// Commit the updated value to Handsontable
		// this.hot.setDataAtCell(this.row, this.col, value);

		this.close();
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
		if (this.root && !this.show) {
			this.root.unmount();
			this.root = null; // Ensure the root is reset after unmounting
		}

		super.close();
	}
}
