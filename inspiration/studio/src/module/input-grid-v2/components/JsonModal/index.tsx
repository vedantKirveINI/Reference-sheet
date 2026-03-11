import { ODSDialog, ODSButton } from "@src/module/ods";
import JsonModalContent from "./JsonModalContent";

function JsonModal({ jsonModal, setJsonModal }) {
  const { open, payload = {} } = jsonModal;
  const { isDifferentDatatype } = payload || {};

  return (
    <ODSDialog
      open={open}
      onClose={() => {
        setJsonModal({ open: false });
      }}
      hideBackdrop={false}
      showFullscreenIcon={false}
      dialogWidth="auto"
      dialogHeight="auto"
      dialogTitle="JSON Updates"
      showCloseIcon={true}
      dialogContent={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            minWidth: "43.75rem",
            minHeight: "18.75rem",
            padding: "1rem 0",
          }}
        >
          <JsonModalContent payload={payload} />
        </div>
      }
      dialogActions={
        !isDifferentDatatype ? (
          <>
            <ODSButton
              variant="outlined"
              color="primary"
              label="Override JSON"
              onClick={() => {
                setJsonModal((prev) => ({
                  ...prev,
                  status: "override",
                  open: false,
                }));
              }}
              data-testid="override-json-id"
            />

            <ODSButton
              color="primary"
              autoFocus
              variant="contained"
              label="Append to JSON"
              onClick={() => {
                setJsonModal((prev) => ({
                  ...prev,
                  status: "append",
                  open: false,
                }));
              }}
              data-testid="append-to-json-id"
            />
          </>
        ) : (
          <>
            <ODSButton
              variant="outlined"
              color="primary"
              label="Cancel"
              onClick={() => {
                setJsonModal(() => ({
                  open: false,
                }));
              }}
            />

            <ODSButton
              color="primary"
              autoFocus
              variant="contained"
              label="OK"
              onClick={() => {
                setJsonModal((prev) => ({
                  ...prev,
                  status: "override",
                  open: false,
                }));
              }}
            />
          </>
        )
      }
    ></ODSDialog>
  );
}

export default JsonModal;
