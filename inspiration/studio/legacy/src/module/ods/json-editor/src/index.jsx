import React, { Component } from "react";

import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

import "./index.css";

export default class JSONEditorDs extends Component {
  componentDidMount() {
    const options = {
      mode: this.props.mode,
      modes: this.props.modes,
      search: this.props.search,
      onChangeText: this.props.onChangeText,
      onValidate: (json) => {
        if (typeof json !== "object") {
          return [{ path: [], message: "Invalid JSON" }];
        }
      },
      onValidationError: (errors) => {
        if (this.props.isValid) return this.props.isValid(!errors.length);
      },
    };

    this.jsoneditor = new JSONEditor(this.container, options);
    if (this.props.mode === "tree") {
      this.jsoneditor.setText(JSON.stringify(this.props?.json || {}));
    } else {
      this.jsoneditor.setText(this.props?.json || "{}");
    }

    if (this.props.selectOnMount && this.props.mode === "text") {
      this.timeoutId = setTimeout(() => {
        const textarea = this.container.querySelector(
          "textarea.jsoneditor-text"
        );
        if (textarea) {
          // Select all text inside the textarea
          textarea.setSelectionRange(0, textarea.value.length);
          // Alternatively, you can use textarea.select() to select all text
          textarea.focus(); // Ensure the textarea is focused
        }
      }, 100);
    }
  }

  componentWillUnmount() {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  componentDidUpdate() {
    if (this.props.mode === "tree") {
      this.jsoneditor.updateText(JSON.stringify(this?.props?.json || {}));
    } else {
      this.jsoneditor.updateText(this?.props?.json || "{}");
    }
  }

  render() {
    return (
      <div
        className={`jsoneditor-react-container ${this.props.hideNavBar && "hide-nav-bar"} ${this.props.hideTitleBar && "hide-title-bar"} ${this.props.hideStatusBar && "hide-status-bar"}`}
        ref={(elem) => (this.container = elem)}
      />
    );
  }
}

// Define default props
JSONEditorDs.defaultProps = {
  mode: "text", // Default mode is "text"
  modes: ["text", "tree"], // Default modes array
  search: false,
  onChangeText: () => {}, // Default empty function for onChange
  json: "{}", // Default JSON is an empty object
  hideTitleBar: false,
  hideNavBar: false,
  hideStatusBar: false,
};
