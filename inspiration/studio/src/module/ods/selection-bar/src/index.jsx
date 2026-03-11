import React, { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ODSLabel, ODSButton, ODSIcon, ODSContextMenu } from "../../index.js";
import { cn } from "@/lib/utils";
import classes from './index.module.css';

const ODSSelectionBar = ({
  show = false,
  listItems = [],
  actions = [],
  variant = "text",
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const cardRef = useRef();

  const ctxMenuItems = useMemo(() => {
    return actions.slice(3).map(({ label, startIcon, onClick }, idx) => {
      return {
        id: `${label}_${idx}`,
        name: label,
        leftAdornment: startIcon,
        onClick: () => onClick(),
      };
    });
  }, [actions]);

  const handleClose = () => {
    setShowContextMenu(false);
  };

  return (
    <>
      {show && (
        <>
          <Card
            ref={cardRef}
            className={cn(
              "bg-[var(--grey-A100)] flex w-[calc(100%-4rem)] rounded-2xl p-4 m-0 mx-4 absolute bottom-4 left-0 z-[1]",
              classes["selection-bar"]
            )}
          >
            <div className={classes["count-container"]}>
              <ODSLabel
                className="text-[var(--grey-contrastText)] text-subtitle1"
              >
                {`${listItems.length} SELECTED`}
              </ODSLabel>
            </div>
            <div className={classes["actions-container"]}>
              {actions
                ?.slice(0, 3)
                .map(({ label, startIcon, onClick }, idx) => (
                  <ODSButton
                    key={`${label}_${idx}`}
                    variant={variant}
                    label={label}
                    startIcon={startIcon}
                    onClick={onClick}
                  />
                ))}
              {!!ctxMenuItems.length && (
                <div
                  className={classes["icons"]}
                  style={{
                    backgroundColor: "var(--grey-200)",
                  }}
                >
                  <ODSIcon
                    outeIconName="OUTEMoreVerticalIcon"
                    outeIconProps={{
                      style: { color: "var(--grey-A100)" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowContextMenu(true);
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
          <ODSContextMenu
            show={showContextMenu}
            menus={ctxMenuItems}
            anchorEl={cardRef.current}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            onClose={handleClose}
          />
        </>
      )}
    </>
  );
};

export default ODSSelectionBar;
