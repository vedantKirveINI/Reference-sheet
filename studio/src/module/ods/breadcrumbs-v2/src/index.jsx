import React, { useState } from "react";
import { ODSLabel as Label, ODSIcon as Icon, ODSTooltip as Tooltip } from "../../index.js";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ODSBreadcrumbs = ({
  breadcrumbItems = [],
  maxItems = 3,
  separator = "/",
  labelKey = "label",
  breadcrumbLabelProps = {},
  dropDownLabelProps = {},
  lastBreadcrumbLabelProps = {},
}) => {
  const [open, setOpen] = useState(false);
  const isDropdownNeeded = breadcrumbItems.length > maxItems;
  const overflowItems = isDropdownNeeded ? breadcrumbItems.slice(1, -1) : [];

  const separatorElement = separator ? separator : "/";

  const handleMenuClose = () => {
    setOpen(false);
  };

  if (!breadcrumbItems.length) return null;

  const breadCrumbsContent = (items = []) => {
    if (!isDropdownNeeded) {
      return items.map((item, index) => {
        const breadcrumbsLabel = item?.[labelKey] || "";
        const isLast = index === items.length - 1;

        return (
          <BreadcrumbItem key={`item_${index}`}>
            {index > 0 && <BreadcrumbSeparator>{separatorElement}</BreadcrumbSeparator>}
            <Tooltip title={breadcrumbsLabel}>
              {isLast ? (
                <BreadcrumbPage>
                  <Label
                    variant="body1"
                    {...breadcrumbLabelProps}
                    {...lastBreadcrumbLabelProps}
                    className={cn(
                      "max-w-[18rem] overflow-hidden text-ellipsis whitespace-nowrap cursor-default text-[#78909C]",
                      breadcrumbLabelProps.className,
                      lastBreadcrumbLabelProps.className
                    )}
                  >
                    {breadcrumbsLabel}
                  </Label>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    item?.onClick && item.onClick(e);
                  }}
                  className="hover:text-foreground"
                >
                  <Label
                    variant="body1"
                    {...breadcrumbLabelProps}
                    className={cn(
                      "max-w-[18rem] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer text-[#78909C]",
                      breadcrumbLabelProps.className
                    )}
                  >
                    {breadcrumbsLabel}
                  </Label>
                </BreadcrumbLink>
              )}
            </Tooltip>
          </BreadcrumbItem>
        );
      });
    }

    const firstItemLabel = items[0]?.[labelKey] || "";
    const lastItemLabel = items[items.length - 1]?.[labelKey] || "";

    return (
      <>
        <BreadcrumbItem>
          <Tooltip title={firstItemLabel}>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                items[0]?.onClick && items[0].onClick(e);
              }}
              className="hover:text-foreground"
            >
              <Label
                variant="body1"
                {...breadcrumbLabelProps}
                className={cn(
                  "max-w-[18rem] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer text-[#78909C]",
                  breadcrumbLabelProps.className
                )}
              >
                {firstItemLabel}
              </Label>
            </BreadcrumbLink>
          </Tooltip>
        </BreadcrumbItem>
        <BreadcrumbSeparator>{separatorElement}</BreadcrumbSeparator>
        {overflowItems.length > 0 && (
          <>
            <BreadcrumbItem>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="dropdown-icon"
                    className="p-1 hover:bg-[#E5EAF1] rounded cursor-pointer"
                  >
                    <Icon outeIconName="OUTEMoreHorizIcon" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  data-testid="dropdown-menu"
                  className="rounded-md"
                >
                  {overflowItems.map((item, index) => {
                    const breadcrumbsLabel = item?.[labelKey] || "";
                    return (
                      <Tooltip key={index} title={breadcrumbsLabel}>
                        <DropdownMenuItem
                          onClick={() => {
                            item?.onClick && item.onClick();
                            handleMenuClose();
                          }}
                        >
                          <Label
                            variant="body1"
                            {...dropDownLabelProps}
                            data-testid={`dropdown-item-${breadcrumbsLabel}`}
                            className={cn(
                              "box-border min-w-[10rem] max-w-[18rem] overflow-hidden text-ellipsis text-[#78909C] whitespace-nowrap",
                              dropDownLabelProps.className
                            )}
                          >
                            {breadcrumbsLabel}
                          </Label>
                        </DropdownMenuItem>
                      </Tooltip>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator>{separatorElement}</BreadcrumbSeparator>
          </>
        )}
        <BreadcrumbItem>
          <Tooltip title={lastItemLabel}>
            <BreadcrumbPage>
              <Label
                variant="body1"
                {...breadcrumbLabelProps}
                {...lastBreadcrumbLabelProps}
                className={cn(
                  "max-w-[18rem] overflow-hidden text-ellipsis whitespace-nowrap cursor-default",
                  breadcrumbLabelProps.className,
                  lastBreadcrumbLabelProps.className
                )}
              >
                {lastItemLabel}
              </Label>
            </BreadcrumbPage>
          </Tooltip>
        </BreadcrumbItem>
      </>
    );
  };

  return (
    breadcrumbItems.length > 0 && (
      <Breadcrumb
        data-testid="breadcrumb-container"
        separator={separatorElement}
      >
        {breadCrumbsContent(breadcrumbItems)}
      </Breadcrumb>
    )
  );
};

export default ODSBreadcrumbs;
