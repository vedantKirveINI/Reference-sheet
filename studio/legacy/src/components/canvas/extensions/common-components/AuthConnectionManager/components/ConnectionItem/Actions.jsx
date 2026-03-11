import classes from "./index.module.css";
// import ODSIcon from "oute-ds-icon";
import { ODSIcon } from "@src/module/ods";
import { useCallback, useState } from "react";

const Actions = ({
  setIsEditMode,
  isEditMode,
  onRename,
  onDiscard,
  onDelete,
}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onDeleteHandler = useCallback(async () => {
    try {
      setDeleteLoading(true);
      await onDelete();
    } finally {
      setDeleteLoading(false);
    }
  }, [onDelete]);

  if (isEditMode) {
    return (
      <div
        className={classes["connection-edit-container"]}
        data-testid="connection-edit-actions"
      >
        <ODSIcon
          data-testid="connection-discard-button"
          outeIconName={"OUTECloseIcon"}
          onClick={onDiscard}
          outeIconProps={{
            sx: {
              color: "#FF5252",
            },
          }}
        />
        <ODSIcon
          data-testid="connection-save-button"
          outeIconName={"CheckIcon"}
          onClick={onRename}
          outeIconProps={{
            sx: {
              color: "#4CAF50",
              height: "1.5rem",
            },
          }}
        />
      </div>
    );
  }
  return (
    <div
      className={classes["connection-edit-container"]}
      data-testid="connection-view-actions"
    >
      <ODSIcon
        data-testid="connection-edit-button"
        outeIconName={"OUTEEditIcon"}
        onClick={() => {
          setIsEditMode(true);
        }}
        outeIconProps={{
          sx: {
            color: "#90A4AE",
          },
        }}
      />
      <ODSIcon
        data-testid="connection-delete-button"
        outeIconName={"OUTETrashIcon"}
        onClick={onDeleteHandler}
        disabled={deleteLoading}
        outeIconProps={{
          sx: {
            color: "#90A4AE",
          },
        }}
      />
    </div>
  );
};

export default Actions;
