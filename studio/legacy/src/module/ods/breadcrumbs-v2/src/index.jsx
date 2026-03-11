import React, { useState } from "react";
import { Breadcrumbs, Menu, MenuItem } from "@mui/material";
// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
// import Tooltip from "oute-ds-tooltip";
import { ODSLabel as Label, ODSIcon as Icon, ODSTooltip as Tooltip } from "../../index.jsx";

const ODSBreadcrumbs = ({
  breadcrumbItems = [],
  maxItems = 3,
  separator = "/",
  labelKey = "label",
  breadcrumbLabelProps = {},
  dropDownLabelProps = {},
  lastBreadcrumbLabelProps = {},
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isDropdownNeeded = breadcrumbItems.length > maxItems;
  const overflowItems = isDropdownNeeded ? breadcrumbItems.slice(1, -1) : [];

  const separatorElement = separator ? separator : "/";

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  if (!breadcrumbItems.length) return null;

  const tooltipSlotProps = {
    popper: {
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, -14],
          },
        },
      ],
    },
  };

  const breadCrumbsContent = (items = []) => {
    if (!isDropdownNeeded) {
      return items.map((item, index) => {
        const breadcrumbsLabel = item?.[labelKey] || "";

        return (
          <Tooltip
            title={breadcrumbsLabel}
            key={index}
            arrow={false}
            slotProps={tooltipSlotProps}
          >
            <Label
              variant="body1"
              {...breadcrumbLabelProps}
              {...(index === items.length - 1 && lastBreadcrumbLabelProps)}
              sx={{
                maxWidth: "18rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: "#78909C",
                ...breadcrumbLabelProps?.sx,
                ...(index === items.length - 1
                  ? { ...lastBreadcrumbLabelProps?.sx }
                  : {}),
              }}
              onClick={index === items.length - 1 ? () => {} : item?.onClick}
            >
              {breadcrumbsLabel}
            </Label>
          </Tooltip>
        );
      });
    }

    const firstItemLabel = items[0]?.[labelKey] || "";
    const lastItemLabel = items[items.length - 1]?.[labelKey] || "";

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Tooltip
          title={firstItemLabel}
          arrow={false}
          slotProps={tooltipSlotProps}
        >
          <Label
            variant="body1"
            cursor="pointer"
            sx={{
              maxWidth: "18rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
              color: "#78909C",
              ...breadcrumbLabelProps?.sx,
            }}
            onClick={items[0]?.onClick}
          >
            {firstItemLabel}
          </Label>
        </Tooltip>
        {separatorElement}
        {overflowItems.length > 0 && (
          <Icon
            outeIconName="OUTEMoreHorizIcon"
            onClick={handleMenuOpen}
            buttonProps={{
              sx: {
                padding: "0.25rem",
                "&:hover": {
                  cursor: "pointer",
                  background: "#E5EAF1",
                },
              },
              "data-testid": "dropdown-icon",
            }}
          />
        )}
        {separatorElement}
        <Tooltip
          title={lastItemLabel}
          arrow={false}
          slotProps={tooltipSlotProps}
        >
          <Label
            variant="body1"
            {...breadcrumbLabelProps}
            {...lastBreadcrumbLabelProps}
            sx={{
              maxWidth: "18rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
              ...breadcrumbLabelProps?.sx,
              ...lastBreadcrumbLabelProps?.sx,
            }}
          >
            {lastItemLabel}
          </Label>
        </Tooltip>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          data-testid="dropdown-menu"
          sx={{
            borderRadius: "0.375rem",
          }}
        >
          {overflowItems.map((item, index) => {
            const breadcrumbsLabel = item?.[labelKey] || "";
            return (
              <Tooltip
                title={breadcrumbsLabel}
                key={index}
                arrow={false}
                slotProps={tooltipSlotProps}
              >
                <MenuItem
                  onClick={() => {
                    item?.onClick();
                    handleMenuClose();
                  }}
                >
                  <Label
                    variant="body1"
                    {...dropDownLabelProps}
                    data-testid={`dropdown-item-${breadcrumbsLabel}`}
                    sx={{
                      boxSizing: "border-box",
                      minWidth: "10rem",
                      maxWidth: "18rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "#78909C",
                      whiteSpace: "nowrap",
                      ...dropDownLabelProps?.sx,
                    }}
                  >
                    {breadcrumbsLabel}
                  </Label>
                </MenuItem>
              </Tooltip>
            );
          })}
        </Menu>
      </div>
    );
  };

  return (
    breadcrumbItems.length > 0 && (
      <Breadcrumbs
        data-testid="breadcrumb-container"
        separator={separatorElement}
      >
        {breadCrumbsContent(breadcrumbItems)}
      </Breadcrumbs>
    )
  );
};

export default ODSBreadcrumbs;
