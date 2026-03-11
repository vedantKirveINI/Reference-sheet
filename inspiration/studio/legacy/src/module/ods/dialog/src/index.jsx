import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Draggable from "react-draggable";
// import default_theme from "oute-ds-shared-assets";
// import ODSIcon from "oute-ds-icon";
import sharedAssets from "../../shared-assets/src/index.jsx";
import { ODSIcon } from "../../index.jsx";
const default_theme = sharedAssets;
import { showConfirmDialog } from './utils.jsx';
export { showConfirmDialog };

const ODSDialog = ({
  /**
   *   The `open` prop is used to control the visibility of the dialog.
   */
  open,
  /**
   * The `scroll` prop determines the container for scrolling the dialog.
   */
  scroll = "paper",
  /**
   * The `fullWidth` prop If true it stretches the dialog  to maxWidth.
   */
  fullWidth = true,
  /**
   * The `dividers` prop if true, displays the top and bottom dividers.
   */
  dividers = true,
  /**
   * The `hideBackdrop` prop if true, the backdrop is not rendered.
   */
  hideBackdrop = true,
  /**
   * The `showCloseIcon` prop if true, the close icon is displayed.
   */
  showCloseIcon = true,
  /**
   * The `showFullscreenIcon` prop if true, the fullscreen icon is displayed.
   */
  showFullscreenIcon = true,
  /**
   * The `draggable` prop in the `ODSDialog` component is used to determine whether the dialog can be
   * dragged by the user. If `draggable` is set to `true`, the dialog can be dragged.
   * If `draggable` is set to `false`, the dialog cannot be dragged.
   */
  draggable = true,
  /* The `dialogTitle` prop is used to specify the title of the dialog. It is displayed at the top of
 the dialog window. */
  dialogTitle,
  /* The `dialogContent` prop is used to specify the content of the dialog. It is displayed between the
 dialog title and dialog actions. The content can be any valid React component or JSX code. */
  dialogContent,
  /* The `dialogActions` prop is used to specify the actions or buttons that will be displayed at the
  bottom of the dialog. These actions can be any valid React component or JSX code. The
  `dialogActions` prop is passed to the `DialogActions` component from the Material-UI library,
  which renders the actions/buttons in a horizontal layout. */
  dialogActions,
  dialogTitleProps = {},
  dialogActionsProps = {},
  onClose = () => {},
  transition = "none",
  transitionProps,
  dialogPosition = "center",
  dialogWidth = "400px",
  dialogHeight = "auto",
  dialogMinHeight = "150px",
  dialogCoordinates = "",
  removeContentPadding = false,
  allowBackgroundInteraction = false,
  ...props
}) => {
  const theme = createTheme({
    ...default_theme,
    components: {
      ...default_theme.components,
      MuiDialog: {
        styleOverrides: {
          root: {
            pointerEvents: allowBackgroundInteraction ? "none" : "auto",
          },
          paper: {
            border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
            borderRadius: "0.375rem",
            margin: "0rem",
            maxWidth: "none",
            boxShadow: "0px 8px 20px 0px rgba(122, 124, 141, 0.20)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: "1rem",
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "1rem",
            gap: "0.5rem",
          },
        },
      },
    },
  });
  const paperRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const getTransitionComponent = useCallback(
    (transition, open, transitionProps) => {
      switch (transition) {
        case "grow":
          return forwardRef((props, ref) => {
            return (
              <Grow
                in={open}
                timeout={300}
                ref={ref}
                {...props}
                {...transitionProps}
              />
            );
          });
        case "fade":
          return forwardRef((props, ref) => {
            return (
              <Fade
                in={open}
                timeout={300}
                ref={ref}
                {...props}
                {...transitionProps}
              />
            );
          });
        case "slide":
          return forwardRef((props, ref) => {
            return (
              <Slide
                in={open}
                timeout={300}
                ref={ref}
                direction="left"
                {...props}
                {...transitionProps}
              />
            );
          });
        case "none":
        default:
          return;
      }
    },
    []
  );
  const transitionComponent = useMemo(
    () => getTransitionComponent(transition, open, transitionProps),
    [getTransitionComponent, open, transition, transitionProps]
  );
  const getPosition = useCallback(() => {
    switch (dialogPosition) {
      case "top-right":
        return {
          position: "fixed",
          top: 10,
          right: 10,
        };
      case "top-left": {
        return {
          position: "fixed",
          top: 10,
          left: 10,
        };
      }
      case "bottom-right": {
        return {
          position: "fixed",
          bottom: 10,
          right: 10,
        };
      }
      case "bottom-left": {
        return {
          position: "fixed",
          bottom: "0.625rem",
          left: "0.625rem",
        };
      }
      case "top-center": {
        return {
          position: "fixed",
          top: "0.625rem",
        };
      }
      case "bottom-center": {
        return {
          position: "fixed",
          bottom: "0.625rem",
        };
      }
      case "left-center": {
        return {
          position: "fixed",
          left: "0.625rem",
        };
      }
      case "right-center": {
        return {
          position: "fixed",
          right: "0.625rem",
        };
      }
      case "coordinates": {
        if (!dialogCoordinates) return {};
        return {
          position: "fixed",
          ...dialogCoordinates,
        };
      }
      default: {
        return {};
      }
    }
  }, [dialogCoordinates, dialogPosition]);
  /* The `updatePaperProps` function is a callback function that calculates and returns the props for
  the `Paper` component in the `Dialog`. It determines the position, width, height, and minHeight of
  the `Paper` based on the current state values (`isFullscreen`, `dialogWidth`, `dialogHeight`,
  `dialogMinHeight`) and the `getPosition` function. */
  const updatePaperProps = useCallback(() => {
    const position = getPosition();
    return {
      ...position,
      width: isFullscreen
        ? "calc(100% - 1rem)"
        : dialogWidth === "auto"
        ? dialogWidth
        : `calc(${dialogWidth} - 1rem)`,
      maxHeight: "calc(100% - 1rem)",
      height: isFullscreen
        ? "calc(100% - 1rem)"
        : dialogHeight === "auto"
        ? dialogHeight
        : `calc(${dialogHeight} - 1rem)`,
      minHeight: isFullscreen
        ? "calc(100% - 1rem)"
        : `calc(${dialogMinHeight} - 1rem)`,
    };
  }, [dialogHeight, dialogMinHeight, dialogWidth, getPosition, isFullscreen]);

  const computedPaperProps = useMemo(
    () => updatePaperProps(),
    [updatePaperProps]
  );

  const conditionalPaperComponent = useCallback(
    (props) => {
      return draggable ? (
        <Draggable
          nodeRef={paperRef}
          handle="#scroll-dialog-title"
          cancel={'[class*="MuiDialogContent-root"]'}
        >
          <Paper ref={paperRef} {...props} />
        </Draggable>
      ) : (
        <Paper {...props} />
      );
    },
    [draggable]
  );

  return !open ? (
    <></>
  ) : (
    <ThemeProvider theme={theme}>
      <Dialog
        data-testid="ods-dialog"
        {...props}
        hideBackdrop={hideBackdrop}
        open={open}
        onClose={onClose}
        scroll={scroll}
        fullWidth={fullWidth}
        fullScreen={isFullscreen}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        TransitionComponent={transitionComponent}
        PaperComponent={conditionalPaperComponent}
        PaperProps={{
          ...(props?.PaperProps || {}),
          sx: { ...computedPaperProps, pointerEvents: "auto" },
        }}
      >
        {(dialogTitle || showFullscreenIcon || showCloseIcon) && (
          <DialogTitle
            data-testid="ods-dialog-title"
            id="scroll-dialog-title"
            {...dialogTitleProps}
            sx={{
              cursor: draggable ? "move" : "default",
              display: "grid",
              gridTemplateColumns: "minmax(min-content, 1fr) auto",
              ...dialogTitleProps?.sx,
            }}
          >
            {dialogTitle}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              {showFullscreenIcon && (
                <ODSIcon
                  outeIconName={`${
                    isFullscreen
                      ? "OUTECloseFullscreenIcon"
                      : "OUTEOpenFullscreenIcon"
                  }`}
                  outeIconProps={{
                    sx: {
                      width: "1.25rem",
                      height: "1.25rem",
                      cursor: "pointer",
                      color: (theme) =>
                        dialogTitleProps.sx?.color || theme.palette.grey[500],
                    },
                    "data-testid": "ods-dialog-fullscreen-icon",
                  }}
                  buttonProps={{
                    sx: {
                      padding: "0rem",
                    },
                  }}
                  onClick={() => {
                    setIsFullscreen((prev) => !prev);
                  }}
                />
              )}
              {showCloseIcon && (
                <ODSIcon
                  outeIconName="OUTECloseIcon"
                  outeIconProps={{
                    sx: {
                      width: "1.25rem",
                      height: "1.25rem",
                      cursor: "pointer",
                      color: (theme) =>
                        dialogTitleProps.sx?.color || theme.palette.grey[500],
                    },
                    "data-testid": "ods-dialog-close-icon",
                  }}
                  buttonProps={{
                    sx: {
                      padding: "0rem",
                    },
                  }}
                  onClick={(e) => onClose(e, "close-clicked")}
                />
              )}
            </div>
          </DialogTitle>
        )}
        <DialogContent
          data-testid="ods-dialog-content"
          dividers={dividers}
          sx={{
            padding: removeContentPadding ? 0 : "0.5rem 1rem",
          }}
        >
          <div
            id="scroll-dialog-description"
            style={{ width: "100%", height: "100%" }}
            tabIndex={-1}
          >
            {dialogContent}
          </div>
        </DialogContent>
        {dialogActions && (
          <DialogActions
            data-testid="ods-dialog-actions"
            {...dialogActionsProps}
          >
            {dialogActions}
          </DialogActions>
        )}
      </Dialog>
    </ThemeProvider>
  );
};

export default ODSDialog;
