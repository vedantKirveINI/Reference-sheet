import React, { forwardRef } from "react";
import { toast } from "sonner";

const JsonUploadInput = forwardRef((props, ref) => {
  return (
    <input
      type="file"
      ref={ref}
      style={{ display: "none" }}
      accept=".json"
      onChange={(event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              props?.onUpload(e.target.result);
            } catch (error) {
              toast.error("Invalid JSON file");
            }
          };
          reader.readAsText(file);
        } else {
          toast.error("Please upload a valid JSON file");
        }
      }}
    />
  );
});

export default JsonUploadInput;
