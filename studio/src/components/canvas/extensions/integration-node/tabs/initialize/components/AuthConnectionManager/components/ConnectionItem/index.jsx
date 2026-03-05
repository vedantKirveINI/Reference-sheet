import classes from "./index.module.css";
// import ODSRadio from "oute-ds-radio";
import ConnectionDisplay from "./ConnectionDisplay";
// import { ODSTextField } from "@src/module/ods";
import { ODSRadio, ODSTextField } from "@src/module/ods";
import Actions from "./Actions";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const ConnectionItem = ({
  connection,
  isSelected,
  onConnectionNameChange,
  index,
  onConnectionDelete,
}) => {
  const nameRef = useRef(connection?.name);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  useEffect(() => {
    setEditedName(connection?.name);
  }, [connection?.name]);

  const createdDate = connection?.created_at
    ? dayjs(connection.created_at).format("MMM DD, YYYY")
    : "Unknown";
  const lastSyncedDate = connection?.updated_at
    ? dayjs(connection.updated_at).fromNow()
    : "Never";

  const onRename = useCallback(async () => {
    if (renameLoading || !editedName.trim()) return;
    try {
      setRenameLoading(true);
      await onConnectionNameChange(editedName.trim());
      nameRef.current = editedName.trim();
      setIsEditMode(false);
    } catch (e) {
    } finally {
      setRenameLoading(false);
    }
  }, [editedName, onConnectionNameChange, renameLoading]);

  const onDiscard = () => {
    if (renameLoading) return;
    setEditedName(nameRef.current);
    setIsEditMode(false);
  };
  return (
    <div
      className={`${classes["connection-item-container"]} ${
        isSelected ? classes["selected"] : ""
      } ${isEditMode ? classes["edit-mode"] : ""}`}
      data-testid={`connection-item`}
    >
      <ODSRadio
        data-testid={`connection-radio`}
        formControlLabelProps={{
          value: connection?._id,
          checked: isSelected,
          disabled: isEditMode,
          sx: {
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            "& .MuiRadio-root": {
              padding: "1px 9px",
              "&.Mui-checked": {
                color: "#212121",
              },
              "&.Mui-disabled": {
                opacity: 0.5,
              },
            },
            "& .MuiTypography-root": {
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
            },
          },
        }}
        className={classes["radio"]}
      />
      {isEditMode ? (
        <div
          className={classes["edit-container"]}
          data-testid={`connection-edit-mode`}
        >
          <ODSTextField
            data-testid={`connection-name-input`}
            placeholder="Enter Connection name.."
            fullWidth
            className="black"
            autoFocus
            error={!editedName.trim()}
            helperText={
              !editedName.trim() ? "Connection name cannot be empty" : ""
            }
            
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && editedName.trim() && !renameLoading) {
                onRename();
              } else if (e.key === "Escape") {
                onDiscard();
              }
            }}
          />
        </div>
      ) : (
        <ConnectionDisplay
          connectionName={editedName}
          createdDate={createdDate}
          lastSyncedDate={lastSyncedDate}
        />
      )}
      <Actions
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onRename={onRename}
        onDiscard={onDiscard}
        renameLoading={renameLoading}
        onDelete={() => onConnectionDelete(connection?._id)}
      />
    </div>
  );
};

export default ConnectionItem;
