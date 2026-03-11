import React, { useState } from "react";
// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "@src/module/ods";
import utility from "oute-services-utility-sdk";

const AddCurl = ({ onClose = () => {}, ...props }) => {
  const [curl, setCurl] = useState("");

  return (
    <div
      style={{
        width: "100%",
        height: "2.5rem",
        display: "flex",
        alignItems: "center",
      }}
    >
      <ODSTextField
        fullWidth={true}
        value={curl}
        placeholder="CURL"
        onChange={(e) => {
          setCurl(e.target.value);
        }}
        onPaste={(e) => {
          e.preventDefault();
          const plainText = e.clipboardData.getData("text/plain"); //code to ensure that only text is pasted
          setCurl(plainText);
          const parsedData = utility.curlToJson(plainText);
          onClose(parsedData);
        }}
        {...props}
      />
    </div>
  );
};

export default AddCurl;
