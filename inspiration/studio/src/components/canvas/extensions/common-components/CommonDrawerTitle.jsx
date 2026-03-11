import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import animationData from "../../assets/lotties/premium.json";
import EditTitlePopover from "./EditTitlePopover";

const CommonDrawerTitle = ({
  title,
  showEditButton = true,
  node = {},
  onTitleSave = () => {},
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-center justify-between",
        "gap-4"
      )}
    >
      {/* <AdvancedLabel
        fullWidth={false}
        labelText={title.name}
        labelSubText={node?.name !== title?.name?.trim() ? node.name : ""}
        style={{
          maxWidth: "max-content",
          width: "auto",
        }}
        data-testid="drawer-title"
        labelProps={{
          sx: {
            color: "var(--grey-darken-4, #263238)",
            font: "var(--h5)",
            letterSpacing: "var(--h5-letter-spacing)",
          },
        }}
        leftAdornment={
          title.icon ? (
            <Icon
              imageProps={{
                src: title.icon,
                style: {
                  borderRadius: "50%",
                  border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
                  width: "1.5rem",
                  height: "1.5rem",
                },
                "data-testid": "drawer-icon",
              }}
            />
          ) : null
        }
        rightAdornment={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {!!title.hoverDescription && (
              <Tooltip
                title={title.hoverDescription}
                style={{
                  font: "var(--body1) !important",
                  letterSpacing: "var(--body1-letter-spacing) !important",
                }}
                arrow={false}
                data-test-id="drawer-description-tooltip"
              >
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    outeIconName="OUTEInfoIcon"
                    outeIconProps={{
                      sx: { cursor: "pointer" },
                      "data-testid": "drawer-description-icon",
                    }}
                  />
                </div>
              </Tooltip>
            )}
            {!!showEditButton && (
              <Icon
                outeIconName="OUTEEditIcon"
                buttonProps={{
                  sx: { padding: 0 },
                  "data-testid": "drawer-edit-icon",
                }}
                onClick={onEditTitleClicked}
              />
            )}
          </div>
        }
      /> */}
      <div className="flex items-center gap-3 min-w-0">
        {title.icon && (
          <div
            className={cn(
              "flex-shrink-0 w-7 h-7 rounded-full",
              "border bg-white",
              "flex items-center justify-center",
              "shadow-island-sm"
            )}
            style={{
              borderColor: "#cfd8dc",
            }}
            data-testid="node-drawer-icon"
          >
            <img
              src={title.icon}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <Label
              className={cn(
                "text-lg font-semibold text-[#263238]",
                "tracking-[-0.02rem] leading-[1.75rem]",
                "truncate"
              )}
              data-testid="node-drawer-title"
            >
              {title.name}
            </Label>
            {!!title.hoverDescription && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex-shrink-0 w-4 h-4",
                        "flex items-center justify-center",
                        "text-[#607d8b] hover:text-[#263238]",
                        "transition-colors duration-200",
                        "cursor-pointer"
                      )}
                      data-testid="node-drawer-description-icon"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="text-sm font-normal max-w-xs"
                    data-test-id="node-drawer-description-tooltip"
                  >
                    {title.hoverDescription}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!!showEditButton && (
              <EditTitlePopover
                data={title}
                onSave={onTitleSave}
                iconColor="#607d8b"
                triggerClassName="flex-shrink-0 hover:bg-gray-100"
              />
            )}
          </div>
          {node?.name !== title?.name?.trim() && (
            <Label
              className={cn(
                "text-xs font-normal text-[#607D8B]",
                "leading-[1.5rem] tracking-[0.01rem]",
                "truncate mt-0.5"
              )}
              data-testid="node-drawer-subtitle"
            >
              {node.name}
            </Label>
          )}
        </div>
      </div>
      {title?.premium && (
        <div
          className={cn(
            "flex items-center gap-2",
            "border border-[#f1b747] bg-[#fff6e4]",
            "px-3 py-1.5 rounded-island-sm",
            "shadow-island-sm"
          )}
        >
          <Lottie
            animationData={animationData}
            loop={true}
            className="w-9 h-9"
          />
          <Label className="text-xs font-semibold uppercase tracking-[0.078125rem] text-[#f1b747]">
            PREMIUM
          </Label>
        </div>
      )}
    </div>
  );
};

export default CommonDrawerTitle;
