import React from "react";
import parse from "@bany/curl-to-json";
// import TextField from "oute-ds-text-field";
import { ODSTextField as TextField } from "../../index.jsx";
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
      sx={{ width: "100%" }}
      {...props}
      onChange={(e) => convert(e.target.value)}
    />
  );
};

export default CurlConverter;
