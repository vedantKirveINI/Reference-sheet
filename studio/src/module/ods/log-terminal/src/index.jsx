import React, { useEffect, useRef, useState } from "react";
import { executeScroll, ODSIcon, ODSLabel, ODSContextMenu as ContextMenu, ODSButton } from "../../index.js";
import { DIVIDER_TYPE, ERROR_TYPE, INFO_TYPE, SUCCESS_TYPE, WARN_TYPE,  } from "./constant.jsx";
import classes from './index.module.css';
import LogRow from './log-row/index.jsx';
const LogTerminal = ({
  logData = [],
  ZeroScreenOverlay,
  contextMenus = [],
  title = "Terminal",
  titleProps = { leftAdornment: null, rightAdornment: null, label: {} },
  terminalBackground = "#ffffff",
  showLogType = false,
  showOptions = false,
  showDownload = true,
  showClearTerminal = true,
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
        return "var(--primary-500)";
      case WARN_TYPE:
        return "var(--warning)";
      case ERROR_TYPE:
        return "var(--error)";
      case SUCCESS_TYPE:
        return "var(--success)";
      default:
        return "rgb(207, 216, 220)";
    }
  };

  const handleDownload = (logEntries) => {
    let textContent = "";

    const extractText = (content) => {
      if (typeof content === "string" || typeof content === "number") {
        return String(content);
      } else if (React.isValidElement(content)) {
        const extractFromChildren = (children) => {
          if (!children) return "";
          if (typeof children === "string" || typeof children === "number") {
            return String(children);
          }
          if (Array.isArray(children)) {
            return children.map(extractFromChildren).join("");
          }
          if (React.isValidElement(children)) {
            return extractFromChildren(children.props.children);
          }
          return "";
        };
        return extractFromChildren(content.props.children);
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
        borderColor: "rgb(207, 216, 220)",
      }}
    >
      <div
        className={classes["log-terminal-header"]}
        style={{
          backgroundColor: "rgb(250, 252, 254)",
          borderColor: "rgb(207, 216, 220)",
        }}
      >
        {!!titleProps?.leftAdornment && titleProps?.leftAdornment}
        <ODSLabel
          style={{ padding: "0.6rem", fontWeight: "bold", fontSize: "0.875rem" }}
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
                borderColor: "rgb(207, 216, 220)",
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
            color: "rgb(38, 50, 56)",
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
                DividerComponent ? (
                  <DividerComponent
                    key={index}
                    ref={index === localLogData?.length - 1 ? scrollRef : null}
                  />
                ) : (
                  <div
                    ref={index === localLogData?.length - 1 ? scrollRef : null}
                    className={classes["log-row-divider"]}
                    style={{
                      width: "100%",
                      color: "rgb(207, 216, 220)",
                    }}
                  />
                )
              ) : (
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
              color: "rgb(38, 50, 56)",
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
