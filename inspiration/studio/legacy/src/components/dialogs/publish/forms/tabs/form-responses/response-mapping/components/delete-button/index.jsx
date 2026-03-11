import React from "react";
// import ODSIcon from "oute-ds-icon";
import { ODSIcon } from "@src/module/ods";

const DeleteButton = ({ onClick, dataTestId }) => {
    return (
            <ODSIcon
                outeIconName="OUTETrashIcon"
                onClick={onClick}
                buttonProps={{
                    "data-testid": dataTestId,
                    "aria-label": "Delete row",
                    sx: {
                        borderRadius: "0.375rem",
                        padding: "0.125rem 0.5rem",
                        "&:hover":
                            {
                                backgroundColor: "#fee2e2",
                            },
                    },
                }}
                outeIconProps={{
                    sx: {
                        width: "2rem",
                        height: "2rem",
                        color: "#212121",
                    },
                }}
            />
  );
};

export default DeleteButton;