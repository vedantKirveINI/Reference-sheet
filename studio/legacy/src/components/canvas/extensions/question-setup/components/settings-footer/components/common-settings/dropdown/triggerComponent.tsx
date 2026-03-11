/** @jsxImportSource @emotion/react */
import React from "react";
import { ODSTooltip as Tooltip, ODSIcon as Icon } from "@src/module/ods";
import { styles } from "./styles";

type TAutocompleteTriggerProps = {
  defaultValue: any;
  isOpen: boolean;
  viewPort: string;
  style?: any;
  multiple?: boolean;
  onChange?: any;
  showToolTip?: boolean;
};

const isEmptyObject = (obj: any) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const AutocompleteTrigger = ({
  defaultValue,
  isOpen,
  viewPort,
  style,
  multiple,
  onChange,
  showToolTip = false,
}: TAutocompleteTriggerProps): React.JSX.Element => {
  const handleRemove = (value: any): void => {
    const newList = defaultValue?.filter((item: any) =>
      item?.label ? item?.label !== value?.label : item !== value
    );
    onChange(newList);
  };

  const renderChip = (value: any) => (
    <span css={styles.autocomplete.chip}>
      <span>{value?.label ?? value}</span>
      <div css={styles.closeIconContainer}>
        <Icon
          outeIconName="OUTECloseIcon"
          outeIconProps={{
            sx: {
              color: "#000",
              width: "0.75em",
              height: "0.75em",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleRemove(value);
          }}
        />
      </div>
    </span>
  );

  const renderChips = (): React.ReactNode => {
    if (
      !defaultValue ||
      defaultValue.length === 0 ||
      isEmptyObject(defaultValue)
    ) {
      return <span>Select value</span>;
    }
    return (
      <span css={styles.selectedOptions} data-testid="selected-options">
        {renderChip(defaultValue[0])}
        {defaultValue.length > 1 && <span>+ {defaultValue.length - 1}</span>}
      </span>
    );
  };

  const renderTooltipContent = (): React.ReactNode => {
    if (!showToolTip || !defaultValue || defaultValue.length === 0) return null;

    return (
      <div css={styles.tooltipContainer} data-testid="tooltip-container">
        {defaultValue.map((value: any, index: number) => (
          <React.Fragment key={index}>
            <span data-testid="tooltip-item">{value?.label ?? value}</span>
            {index < defaultValue.length - 1 && <span>|</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderSingleValue = (): React.ReactNode => {
    if (!defaultValue || defaultValue.length === 0) {
      return <span>Select value</span>;
    }
    return <span>{defaultValue.label ?? defaultValue}</span>;
  };

  return (
    <>
      <Tooltip title={renderTooltipContent()} placement="bottom-start">
        <div
          role="button"
          aria-description="autocomplete-trigger"
          css={styles.autocompleteTriggerContainer({
            isActive: false,
            viewPort,
            style,
          })}
          data-testid="settings-default-value-trigger"
        >
          <div
            css={styles.chipContainer}
            data-testid="settings-default-value-container"
          >
            {multiple ? renderChips() : renderSingleValue()}
          </div>

          <Icon
            outeIconName="OUTEExpandLessIcon"
            outeIconProps={{
              sx: {
                color: "#000",
                width: "1.5em",
                height: "1.5em",
                transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
              },
              "data-testid": "settings-dropdown-icon",
            }}
          />
        </div>
      </Tooltip>
    </>
  );
};
