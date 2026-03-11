import React, { useCallback, useRef, useState } from "react";
import classes from './index.module.css';
// import AdvancedLabel from "oute-ds-advanced-label";
// import Checkbox from "oute-ds-checkbox";
// import ContextMenu from "oute-ds-context-menu";
// import Icon from "oute-ds-icon";
import { ODSAdvancedLabel as AdvancedLabel, ODSCheckbox as Checkbox, ODSContextMenu as ContextMenu, ODSIcon as Icon } from "../../index.jsx";
const ArtefactCard = ({
  tags,
  isLogo = false,
  previewImage,
  leftAdornment,
  rightAdornment,
  labelText,
  labelSubText,
  labelProps = {
    variant: "body2",
  },
  size = "medium",
  subTextProps = {
    variant: "caption",
  },
  contextMenus = [],
  cardBackgroundColor,
  previewBackgroundColor,
  onClick = () => {},
  onDoubleClick = () => {},
  enableCheckboxSelection = false,
  onCheckboxChange = () => {},
  onContextMenu = () => {},
}) => {
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCtxMenu, setShowCtxMenu] = useState(false);
  const [ctxCoords, setCtxCoords] = useState();

  const cardref = useRef();

  const mouseEnterHandler = () => {
    if (enableCheckboxSelection) setShowCheckbox(true);
    if (contextMenus.length) setShowOptions(true);
  };

  const mouseLeaveHandler = () => {
    if (enableCheckboxSelection && showCheckbox) {
      if (!isChecked) setShowCheckbox(false);
    }
    setShowOptions(false);
  };

  const contextMenuHandler = useCallback(
    (e) => {
      onContextMenu(e);
      e.preventDefault();
      if (contextMenus?.length > 0) {
        setShowCtxMenu(true);
        setCtxCoords({
          left: e.clientX,
          top: e.clientY,
        });
      }
    },
    [contextMenus?.length, onContextMenu]
  );
  const ctxCloseHandler = () => {
    setShowCtxMenu(false);
    setCtxCoords(null);
  };

  const checkboxChangeHandler = useCallback(() => {
    setIsChecked(!isChecked);
    onCheckboxChange(!isChecked);
  }, [isChecked, onCheckboxChange]);

  const getRightAdornment = () => {
    if (showOptions) {
      return (
        <Icon
          outeIconName={"OUTEMoreVerticalIcon"}
          onClick={contextMenuHandler}
          buttonProps={{
            "data-testid": "ods-artefact-card-menu-icon",
          }}
        />
      );
    }
    return rightAdornment ?? null;
  };

  const getLeftAdornment = () => {
    if (showCheckbox) {
      return (
        <Checkbox
          defaultChecked={isChecked}
          onChange={checkboxChangeHandler}
          data-testid="ods-artefact-card-checkbox"
        />
      );
    }
    return leftAdornment ?? null;
  };

  return (
    <div
      data-testid="ods-artifect-card"
      tabIndex={0}
      className={`artefact-card ${classes["artefact-card"]} ${classes[size]} ${
        isChecked && classes["checked"]
      } ${!previewImage && classes["no-preview"]}`}
      style={{ backgroundColor: cardBackgroundColor }}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onContextMenu={contextMenuHandler}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      ref={cardref}
    >
      {previewImage && (
        <div
          className={classes["preview-container"]}
          style={{ backgroundColor: previewBackgroundColor }}
          data-testid="ods-artefact-card-preview-container"
        >
          {tags?.length > 0 && (
            <div
              className={classes["tags-container"]}
              data-testid="ods-artefact-card-tags-container"
            >
              {tags.map((tag) => tag)}
            </div>
          )}
          <Icon
            imageProps={{
              src: previewImage?.imageSrc,
              alt: previewImage?.alt || "media",
              width: isLogo ? "60%" : "100%",
              height: isLogo ? "80%" : "100%",
              style: {
                borderRadius: isLogo ? "50%" : "0",
                objectFit: isLogo ? "cover" : "contain",
                ...previewImage?.style,
              },
            }}
          />
        </div>
      )}
      <div
        className={classes["label-container"]}
        data-testid="ods-artefact-card-label-container"
      >
        {leftAdornment && (
          <div className={classes["left-adornment"]}>
            <span
              style={{
                display: "flex",
                height: "1.5rem",
                width: "1.5rem",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                borderRadius: previewImage && !showCheckbox ? "0.5rem" : "0",
                border:
                  previewImage && !showCheckbox
                    ? "1px solid rgba(0, 0, 0, 0.12)"
                    : "",
                overflow: "hidden",
              }}
              data-testid="ods-artefact-card-left-adornment"
            >
              {getLeftAdornment()}
            </span>
          </div>
        )}
        <AdvancedLabel
          labelText={labelText}
          labelSubText={labelSubText}
          labelProps={labelProps}
          subTextProps={subTextProps}
          fullWidth={true}
        />
        {rightAdornment && (
          <div
            className={classes["right-adornment"]}
            data-testid="ods-artefact-card-right-adornment"
          >
            {getRightAdornment()}
          </div>
        )}
        <ContextMenu
          show={showCtxMenu}
          menus={contextMenus}
          anchorEl={cardref.current}
          coordinates={ctxCoords}
          onClose={ctxCloseHandler}
        />
      </div>
    </div>
  );
};

export default ArtefactCard;
