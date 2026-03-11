import TooltipWrapper from "../tooltip-wrapper";
import classes from "./index.module.css";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
import { ODSButton as Button, ODSIcon as Icon } from "@src/module/ods";

const BottomCtaContainer = ({
  showAddNodeDrawer,
  tools,
  autoAlignHandler,
  setRightDrawerComponent,
  onUndo,
  onRedo,
}) => {
  return (
    <div className={classes["bottom-cta-container"]}>
      <Button
        label="ADD NODE"
        variant="black"
        size="large"
        endIcon={
          <Icon
            outeIconName="OUTEAddIcon"
            outeIconProps={{
              sx: {
                color: "#FFF",
              },
            }}
          />
        }
        onClick={() => {
          showAddNodeDrawer({ via: "add-node-button" });
        }}
        data-testid={"add-node-button"}
        sx={{
          borderRadius: "1.25rem",
          height: "2.75rem",
          padding: "0.625rem 1.25rem",
          fontWeight: 600,
          fontSize: "0.875rem",
          letterSpacing: "0.02em",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.18)",
          },
        }}
      />

      <div className={classes["vertical-divider"]} />

      <TooltipWrapper
        title="Undo (Ctrl+Z)"
        component={Icon}
        outeIconName="OUTEUndoIcon"
        onClick={onUndo}
        buttonProps={{
          sx: {
            padding: 0.5,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.875rem",
            width: "2.75rem",
            height: "2.75rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      />

      <TooltipWrapper
        title="Redo (Ctrl+Y)"
        component={Icon}
        outeIconName="OUTERedoIcon"
        onClick={onRedo}
        buttonProps={{
          sx: {
            padding: 0.5,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.875rem",
            width: "2.75rem",
            height: "2.75rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      />

      <TooltipWrapper
        title="Auto Align"
        component={Icon}
        imageProps={{
          src: tools.autoAlign,
          style: {
            width: "2.5rem",
            height: "2.5rem",
          },
          "data-testid": "auto-align-button",
        }}
        onClick={autoAlignHandler}
        buttonProps={{
          sx: {
            padding: 0,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.875rem",
            width: "2.75rem",
            height: "2.75rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      />

      <TooltipWrapper
        title="View Logs"
        component={Icon}
        outeIconName="OUTELeftAlignIcon"
        onClick={() => setRightDrawerComponent("logs")}
        buttonProps={{
          sx: {
            padding: 0.5,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.875rem",
            width: "2.75rem",
            height: "2.75rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      />

      <TooltipWrapper
        title="Search"
        component={Icon}
        outeIconName="OUTESearchIcon"
        onClick={() => {
          showAddNodeDrawer({ via: "add-node-button" });
        }}
        buttonProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "0.875rem",
            padding: "0.375rem",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            width: "2.75rem",
            height: "2.75rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.06)",
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
            },
          },
        }}
      />
    </div>
  );
};

export default BottomCtaContainer;
