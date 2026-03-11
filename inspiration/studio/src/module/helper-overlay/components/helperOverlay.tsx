import { ODSIcon as Icon } from "@src/module/ods";
import { getOverlayCloseContainerStyle, getOverlayStyle } from "./style";
export const HelperOverlay = ({ showHelp, onHelpToggle }) => {
  if (!showHelp) return null;
  return (
    <div style={getOverlayStyle()}>
      <div
        style={getOverlayCloseContainerStyle()}
        onClick={() => onHelpToggle(false)}
      >
        <label style={{ cursor: "pointer" }}>Close</label>
        <Icon
          outeIconName="OUTECloseIcon"
          outeIconProps={{
            sx: {
              width: "2rem",
              height: "2rem",
              color: "#fff",
              cursor: "pointer",
            },
          }}
        />
      </div>
    </div>
  );
};
