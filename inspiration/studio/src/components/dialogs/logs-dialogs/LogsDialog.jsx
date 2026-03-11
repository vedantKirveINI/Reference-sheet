import React from "react";
import { ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
import { ODSDrawer as Drawer } from "@src/module/ods";
import { Terminal } from "@oute/oute-ds.common.molecule.terminal";

class LogsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#607D8B",
          }}
        >
          <Label variant="body2">Unable to display logs. Please try again.</Label>
        </div>
      );
    }

    return this.props.children;
  }
}

const LogsDialog = ({
  open = false,
  onClose = () => {},
  data = [],
  onClearTerminal = () => {},
}) => {
  const safeLogs = Array.isArray(data) ? data : [];
  
  return (
    <Drawer
      open={open}
      onDrawerHide={onClose}
      anchor="right"
      title={
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Icon outeIconName="OUTELeftAlignIcon" />
          <Label variant="h6">Logs</Label>
        </div>
      }
      showFullscreenIcon={false}
      drawerBackgroundColor="#fff"
      className="z-[999]"
    >
      <div
        style={{
          maxWidth: "100%",
          height: "95%",
          overflow: "hidden",
        }}
      >
        <LogsErrorBoundary>
          <Terminal
            onClearTerminal={onClearTerminal}
            showHeader={false}
            showClearTerminal
            logs={safeLogs}
            verbose={true}
            hasStreaming={true}
          />
        </LogsErrorBoundary>
      </div>
    </Drawer>
  );
};

export default LogsDialog;
