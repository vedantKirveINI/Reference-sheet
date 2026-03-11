import React from "react";
import { ODSIcon } from "@src/module/ods";

type AddButtonProps = {
  onClick: () => void;
  variant?: string;
  isRowAddBtn?: boolean;
};

function AddButton({
  onClick,
  variant = "black",
  isRowAddBtn = false,
}: AddButtonProps) {
  return (
    <ODSIcon
      outeIconName="OUTEAddIcon"
      onClick={onClick}
      outeIconProps={{
        style: {
          color: variant === "black" ? "#212121" : "2196f3",
          width: "1.25rem",
          height: "1.25rem",
        },
      }}
      buttonProps={{
        style: {
          padding: !isRowAddBtn ? "0.75rem 0.563rem" : "0rem 0.563rem",
        },
      }}
    />
  );
}

export default AddButton;
