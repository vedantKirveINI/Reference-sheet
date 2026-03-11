import React from "react";
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSIcon as Icon } from "@src/module/ods";
import { toast } from "sonner";

const handleCopy = ({ data }) => {
  navigator.clipboard.writeText(data);
  toast.success("Data copied to clipboard");
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
