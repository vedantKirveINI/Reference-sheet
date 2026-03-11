import React from "react";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
import { ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
import { ODSDrawer as Drawer } from "@src/module/ods";
import { Terminal } from "@oute/oute-ds.common.molecule.terminal";

const LogsDialog = ({
  open = false,
  onClose = () => {},
  data = [],
  onClearTerminal = () => {},
}) => {
  return (
    <Drawer
      open={open}
      // anchor="bottom"
      onClose={onClose}
      title={
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Icon outeIconName="OUTELeftAlignIcon" />
          <Label variant="h6">Logs</Label>
        </div>
      }
      // showSidebar={false}
      showFullscreenIcon={false}
      // actions={null}
    >
      <div style={{ maxWidth: "100%", height: "100%", overflow: "hidden" }}>
        <Terminal
          onClearTerminal={onClearTerminal}
          showHeader={false}
          showClearTerminal
          logs={data}
          verbose={true}
          hasStreaming={true}
        />
      </div>
    </Drawer>
  );
};

export default LogsDialog;
