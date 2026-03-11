import React from "react";
// import Icon from "oute-ds-icon";
// import { showAlert } from "oute-ds-alert";
import { ODSIcon as Icon, showAlert } from "@src/module/ods";

const handleCopy = ({ data }) => {
  navigator.clipboard.writeText(data);
  showAlert({
    message: "Data copied to clipboard",
    type: "success",
  });
};

function CopyContent({ data }) {
  return (
    <Icon
      outeIconName="OUTECopyContentIcon"
      outeIconProps={{
        sx: {
          width: "1.25rem",
          height: "1.25rem",
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleCopy({ data: data });
      }}
    />
  );
}

export default CopyContent;
