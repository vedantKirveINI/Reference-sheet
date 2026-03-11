import Handsontable from "handsontable";
import React from "react";
import { createRoot } from "react-dom/client";

import Ranking from "./Ranking";

export default class RankingEditor extends Handsontable.editors.TextEditor {
	constructor(hotInstance) {
		super(hotInstance);
		this.hot = hotInstance;
		this.inputRef = React.createRef();
		this.root = null;
		this.show = false;
	}

	createElements() {
		const rankingNode = document.querySelector("#root-ranking-editor");

		if (rankingNode) return;

		super.createElements();

		this.TEXTAREA = document.createElement("div");
		this.TEXTAREA.setAttribute("role", "input");
		this.TEXTAREA.setAttribute("data-hot-input", true);

		this.textareaStyle = this.TEXTAREA.style;

		this.TEXTAREA_PARENT.setAttribute("id", "root-ranking-editor");
		this.TEXTAREA_PARENT.innerText = "";
		this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
	}

	initReactComponent() {
		this.root = createRoot(this.TEXTAREA);

		this.root.render(
			<Ranking
				initialValue={this.originalValue}
				onChange={this.onChange.bind(this)}
				cellProperties={this.cellProperties}
				setShow={this.setShow.bind(this)}
				close={this.close.bind(this)}
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
		if (!value) {
			this.originalValue = null;
		} else if (value && typeof value === "string") {
			this.originalValue = value;
		} else {
			this.originalValue = JSON.stringify(value);
		}
	}

	onChange(rankingDetails) {
		this.hot.destroyEditor();
		if (rankingDetails) {
			this.hot.setDataAtCell(this.row, this.col, rankingDetails);
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

	setShow(value) {
		this.show = value;
	}

	finishEditing(restoreOriginalValue, ctrlDown) {
		super.finishEditing(restoreOriginalValue, ctrlDown);
	}

	close() {
		if (!this.show && this.root) {
			this.root.unmount();
			this.root = null; // Ensure the root is reset after unmounting
		}

		super.close();
	}
}
