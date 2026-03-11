import { ODSIcon } from "@src/module/ods";
import { ODSTooltip as ToolTip } from "@src/module/ods";
import { getAlignmentIconStyle } from "./styles";
export const ImageAlignmentButton = ({
  title,
  iconName,
  iconColor,
  onClick,
  isDisabled,
  testId,
}) => (
  <ToolTip
    title={title}
    placement="bottom"
    arrow={false}
    componentsProps={{
      tooltip: {
        sx: {
          fontSize: "0.975em",
        },
      },
    }}
  >
    <div
      style={{
        cursor: isDisabled ? "not-allowed" : "pointer",
        overflow: "hidden",
      }}
    >
      <ODSIcon
        outeIconName={iconName}
        onClick={onClick}
        outeIconProps={{
          "data-testid": testId,
          sx: getAlignmentIconStyle({
            iconColor: iconColor,
          }),
        }}
        buttonProps={{
          disabled: isDisabled,
          sx: { padding: "0rem" },
        }}
      />
    </div>
  </ToolTip>
);
