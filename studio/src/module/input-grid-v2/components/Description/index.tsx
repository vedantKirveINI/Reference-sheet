
import React from "react";
import { text, boldText, container } from "./styles";
const DEFAULT_NOTE =
  "Provide a detailed data schema, specifying each field's type (e.g.,  Object, Array, String, Number). Ensure all fields are properly filled.";

function Description() {
  return (
    <div style={container}>
      <p style={text}>
        <span style={boldText}>Note: </span>
        {DEFAULT_NOTE}
      </p>
    </div>
  );
}

export default Description;
