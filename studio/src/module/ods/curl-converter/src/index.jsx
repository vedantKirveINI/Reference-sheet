import React from "react";
import parse from "@bany/curl-to-json";
// import { ODSTextField as TextField } from "@src/module/ods";
import { ODSTextField as TextField } from "../../index.js";
const CurlConverter = ({ onChange = () => {}, ...props }) => {
  const convert = (curl) => {
    try {
      onChange({ data: parse(curl) });
    } catch (e) {
      onChange({ fail: true, data: {} });
    }
  };
  return (
    <TextField
      multiline
      rows={10}
      style={{ width: "100%" }}
      {...props}
      onChange={(e) => convert(e.target.value)}
    />
  );
};

export default CurlConverter;
