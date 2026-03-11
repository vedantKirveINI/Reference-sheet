import React, { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
// import { executeScroll } from "oute-ds-utils";
// import ODSIcon from "oute-ds-icon";
// import ODSLabel from "oute-ds-label";
// import ContextMenu from "oute-ds-context-menu";
// import ODSButton from "oute-ds-button";
// import default_theme from "oute-ds-shared-assets";
import { executeScroll, ODSIcon, ODSLabel, ODSContextMenu as ContextMenu, ODSButton } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import {
  DIVIDER_TYPE,
  ERROR_TYPE,
  INFO_TYPE,
  SUCCESS_TYPE,
  WARN_TYPE,
} from './constant.jsx';
import classes from './index.module.css';
import LogRow from './log-row/index.jsx';

const LogTerminal = ({
  logData = [],
  ZeroScreenOverlay,
  contextMenus = [],
  title = "Terminal",
  titleProps = { leftAdornment: null, rightAdornment: null, label: {} }, //TODO:
  terminalBackground = "#ffffff",
  showLogType = false,
  showOptions = false,
  showDownload = true, //to show download log button
  showClearTerminal = true, //to show clear terminal button
  showCloseIcon = true,
  infoIcon = null,
  successIcon = null,
  warnIcon = null,
  errorIcon = null,
  divider = null,
  onClose = () => {},
  onClear = () => {},
  onDownload = () => {},
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenusCoordinates, setContextMenuCoordinates] = useState({
    left: 0,
    top: 0,
  });
  const [localLogData, setLocalLogData] = useState(
    logData?.length ? logData : []
  );

  const scrollRef = useRef();

  const getIcon = (type) => {
    switch (type) {
      case INFO_TYPE:
        return infoIcon;
      case WARN_TYPE:
        return warnIcon;
      case ERROR_TYPE:
        return errorIcon;
      case SUCCESS_TYPE:
        return successIcon;
      default:
        return null;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case INFO_TYPE:
        return default_theme.palette.primary.main;
      case WARN_TYPE:
        return default_theme.palette.warning.main;
      case ERROR_TYPE:
        return default_theme.palette.error.main;
      case SUCCESS_TYPE:
        return default_theme.palette.success.main;
      default:
        return default_theme.palette.grey[200];
    }
  };

  const handleDownload = (logEntries) => {
    let textContent = "";

    const extractText = (content) => {
      if (typeof content === "string") {
        return content;
      } else if (React.isValidElement(content)) {
        // Convert the React element to a static HTML string and then remove all HTML tags to get the plain text content.
        // renderToStaticMarkup(content): Renders the React element to its static HTML markup.
        // .replace(/<[^>]+>/g, ''): Uses a regular expression to remove all HTML tags from the rendered HTML string.
        // The regular expression <[^>]+> matches any sequence of characters that starts with '<' and ends with '>', effectively matching HTML tags.
        // The 'g' flag ensures that all occurrences of HTML tags in the string are replaced, not just the first one.
        return renderToStaticMarkup(content).replace(/<[^>]+>/g, ""); // Remove HTML tags
      } else {
        return "";
      }
    };

    logEntries.forEach((entry) => {
      const { message, created_at } = entry;

      const messageText = extractText(message);
      const createdAtText = extractText(created_at);

      if (messageText && createdAtText) {
        textContent += `${createdAtText}: ${messageText}\n`;
      }
    });

    if (textContent.trim() === "") {
      return;
    }

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "log.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload();
  };

  useEffect(() => {
    if (logData?.length > 0) {
      setLocalLogData(logData);
    }
  }, [logData]);

  useEffect(() => {
    if (localLogData?.length > 0) {
      executeScroll(scrollRef.current);
    }
  }, [localLogData?.length]);

  return (
    <div
      className={classes["log-terminal"]}
      style={{
        borderColor: default_theme.palette.grey["200"],
      }}
    >
      <div
        className={classes["log-terminal-header"]}
        style={{
          backgroundColor: default_theme.palette.grey["50"],
          borderColor: default_theme.palette.grey["200"],
        }}
      >
        {!!titleProps?.leftAdornment && titleProps?.leftAdornment}
        <ODSLabel
          sx={{ padding: "0.6rem", fontWeight: "bold", fontSize: "0.875rem" }}
          variant="subtitle1"
          {...titleProps?.label}
        >
          {title}
        </ODSLabel>
        {!!titleProps?.rightAdornment && titleProps?.rightAdornment}
        <div className={classes["log-terminal-header-cta"]}>
          {showDownload && (
            <ODSButton
              size="small"
              label="Download"
              variant="text"
              onClick={() => {
                handleDownload(
                  localLogData.filter(
                    (entry) => entry?.message || entry?.created_at
                  )
                );
              }}
            />
          )}
          {showClearTerminal && (
            <ODSButton
              size="small"
              label="Clear"
              variant="text"
              onClick={() => {
                setLocalLogData([]);
                onClear([]);
              }}
            />
          )}
          {showOptions && (
            <div
              className={classes["log-terminal-header-icon"]}
              style={{
                borderColor: default_theme.palette.grey["200"],
              }}
            >
              <ODSIcon
                outeIconName="OUTEMoreHorizIcon"
                onClick={(event) => {
                  if (contextMenus?.length) {
                    setContextMenuCoordinates({
                      left: event.clientX - 200,
                      top: event.clientY,
                    });
                    setShowContextMenu(true);
                  }
                }}
              />
            </div>
          )}
          {showCloseIcon && (
            <ODSIcon outeIconName="OUTECloseIcon" onClick={onClose} />
          )}
        </div>
      </div>
      {localLogData.length > 0 ? (
        <div
          className={classes["log-terminal-body"]}
          style={{
            color: default_theme.palette.grey.A100,
            backgroundColor: terminalBackground,
          }}
        >
          {localLogData.map(
            (
              {
                created_at,
                message = "",
                type = INFO_TYPE,
                messageType = null,
              },
              index
            ) => {
              const DividerComponent = divider;

              const icon = getIcon(type) ? (
                getIcon(type)
              ) : (
                <div
                  className={classes["default-icon"]}
                  style={{ backgroundColor: getBackgroundColor(type) }}
                />
              );

              return type === DIVIDER_TYPE ? (
                //If type is divider
                DividerComponent ? (
                  //If divider is passed
                  <DividerComponent
                    key={index}
                    ref={index === localLogData?.length - 1 ? scrollRef : null}
                  />
                ) : (
                  //If no divider is passed
                  <div
                    ref={index === localLogData?.length - 1 ? scrollRef : null}
                    className={classes["log-row-divider"]}
                    style={{
                      width: "100%",
                      color: default_theme.palette.grey[200],
                    }}
                  />
                )
              ) : (
                // If type is not divider
                <LogRow
                  ref={index === localLogData?.length - 1 ? scrollRef : null}
                  key={index}
                  createdAt={created_at}
                  message={message}
                  icon={icon}
                  showIcon={showLogType}
                  messageType={messageType}
                />
              );
            }
          )}
        </div>
      ) : ZeroScreenOverlay ? (
        <ZeroScreenOverlay />
      ) : (
        <div className={classes["zero-screen"]}>No Data</div>
      )}
      {showOptions && (
        <ContextMenu
          show={showContextMenu}
          menus={contextMenus}
          coordinates={contextMenusCoordinates}
          onClose={() => {
            setShowContextMenu(false);
          }}
          menuItemSx={{
            padding: "0.5rem",
            "& .MuiListItemText-primary": {
              fontSize: "0.875rem !important",
              textOverflow: "ellipsis",
              overflow: "hidden",
              color: default_theme.palette.grey.A100,
              maxWidth: ".188rem",
              width: ".313rem",
            },
          }}
        />
      )}
    </div>
  );
};

export default LogTerminal;
