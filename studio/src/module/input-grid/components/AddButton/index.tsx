import React from "react";
import { ODSIcon } from "@src/module/ods";
import AddIcon from "../../assets/addIcon.svg";

type AddButtonProps = {
  onClick: () => void;
  testId: any;
};

function AddButton({ onClick, testId }: AddButtonProps) {
  return (
    <ODSIcon
      onClick={onClick}
      buttonProps={{
        "data-testid": `add_key_${testId}`,
      }}
      imageProps={{
        src: AddIcon,
        width: "18px",
        height: "18px",
        cursor: "pointer",
      }}
    />
  );
}

export default AddButton;
