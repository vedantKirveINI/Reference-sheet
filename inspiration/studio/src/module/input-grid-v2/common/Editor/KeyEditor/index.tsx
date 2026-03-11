import { ODSTextField } from "@src/module/ods";
import React from "react";

function KeyEditor({ value, onChange, onBlur, variant = "black" }) {
  return (
    <div
      onBlur={() => {
        onBlur();
      }}
      style={{ height: "100%" }}
    >
      <ODSTextField
        className={`${variant} h-full [&_.MuiInputBase-root]:h-full`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        autoFocus
        hideBorders
        placeholder="Please enter key"
        // style={{
        //   outline: "none",
        //   padding: "0.625rem",
        //   background: "inherit",
        //   border: "none",
        //   boxShadow: "none",
        // }}
        // inputStyles={{
        //   lineHeight: "unset",
        //   fontSize: "unset",
        //   background: "inherit !important",
        // }}
        // theme={{
        //   styles: {
        //     answer: "#263238",
        //   },
        // }}
      />
    </div>
  );
}

export default KeyEditor;
