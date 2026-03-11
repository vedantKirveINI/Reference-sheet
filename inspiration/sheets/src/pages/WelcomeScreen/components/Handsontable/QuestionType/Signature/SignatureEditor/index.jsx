import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import Signature from "./Signature";

export default class SignatureEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
		this.show = false;
	}

	createElements() {
		const signatureNode = document.querySelector("#root-signature-editor");

		if (signatureNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-signature-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	open() {
		super.open();
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);
		this.root.render(
			<Signature
				initialValue={this.originalValue}
				onChange={this.onChange.bind(this)}
				cellProperties={this.cellProperties}
				setShow={this.setShow.bind(this)}
				close={super.close.bind(this)}
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

	setValue(signatureUrl) {
		this.originalValue = signatureUrl;
	}

	onChange(signatureUrl) {
		this.hot.destroyEditor();
		this.hot.setDataAtCell(this.row, this.col, signatureUrl);
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

	setShow(value) {
		this.show = value;
	}

	finishEditing(restoreOriginalValue, ctrlDown) {
		super.finishEditing(restoreOriginalValue, ctrlDown);
	}

	close() {
		if (!this.show && this.state === "STATE_FINISHED") {
			if (this.root) {
				this.root.unmount();
				this.root = null; // Ensure the root is reset after unmounting
			}

			super.close();
		}
	}
}
