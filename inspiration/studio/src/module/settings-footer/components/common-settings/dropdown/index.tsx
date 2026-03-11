import React, { useEffect } from "react";
import { ClickAwayListener } from "@src/module/utils/hooks";
import { ODSPopper as Popper } from "@src/module/ods";
import { ODSAutocomplete as ODSAutoComplete, ODSCheckbox, ODSIcon as Icon } from "@src/module/ods";
import { ViewPort } from "@oute/oute-ds.core.constants";
import { styles } from "./styles";
import { AutocompleteTrigger } from "./triggerComponent";
// StyledPopper component using ODSPopper with inline styles
const StyledPopper = ({ 
  open, 
  anchorEl, 
  placement,
  children,
  ...other 
}: { 
  open: boolean;
  anchorEl: HTMLElement | null;
  placement?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  const popperStyles: React.CSSProperties = {
    zIndex: 1300, // theme.zIndex.modal equivalent
    fontSize: 13,
    width: "fit-content",
    minWidth: 50,
    maxWidth: 350,
    height: "fit-content",
    padding: 5,
    borderRadius: "12px",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    background: "var(--Button-color, #FFF)",
    boxShadow: "0px 4px 8px 0px rgba(122, 124, 141, 0.20)",
    marginBottom: "10px",
    marginTop: "10px",
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      style={popperStyles}
      {...other}
    >
      {children}
    </Popper>
  );
};

type TDropdownProps = {
  value: any; //should be an array of objects with label and value or only array of values
  options: any;
  onChange: (value: any) => void;
  includeAll?: boolean;
  multiple: boolean;
  viewPort?: ViewPort;
  groupBy?: any;
  isSearchable?: boolean;
  showToolTip?: boolean;
  style?: {
    containerStyle?: any;
    labelStyle?: any;
    listStyle?: any;
    inputStyle?: any;
  };
};

type PopperComponentProps = {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
  disableCloseOnSelect?: boolean;
  children?: React.ReactNode;
};

function PopperComponent(props: PopperComponentProps) {
  const { disablePortal, anchorEl, open, disableCloseOnSelect, children, ...other } =
    props;
  
  // Custom styling to mimic MUI Autocomplete classes
  // autocompleteClasses.popperDisablePortal -> position: relative
  // autocompleteClasses.paper -> shadow: none, margin: 0, height: 100%, border: none
  // autocompleteClasses.listbox -> background white/dark, height: 100%
  
  return (
    <div 
      className={`w-full !important h-[85%] ${disablePortal ? "relative" : ""}`}
      {...other}
    >
      <div className="shadow-none m-0 text-inherit h-full border-none [&_.MuiAutocomplete-paper]:shadow-none [&_.MuiAutocomplete-paper]:m-0 [&_.MuiAutocomplete-paper]:h-full [&_.MuiAutocomplete-paper]:border-none [&_.MuiAutocomplete-listbox]:h-full [&_.MuiAutocomplete-listbox]:bg-white dark:[&_.MuiAutocomplete-listbox]:bg-[#1c2128]">
         {children}
      </div>
    </div>
  );
}

function paperComponent(props: any) {
  const { paperProps, handleSelectAll, selectAll, includeAll } = props;
  const { children, className, ...restPaperProps } = paperProps;
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-[0px_4px_8px_0px_rgba(122,124,141,0.20)] border-[0.75px] border-black/20 overflow-hidden ${className || ""}`}
      {...restPaperProps}
    >
      {includeAll && (
        <div 
          className="mt-[5px] ml-[5px] w-full rounded-[0.75em] hover:bg-[#DBEDFF] transition-colors"
        >
          <label 
            className="flex items-center h-[20px] ml-0 p-[0.625em] text-[0.9em] cursor-pointer"
            onClick={(e) => {
              e.preventDefault(); // prevent blur
              handleSelectAll();
            }}
          >
            <ODSCheckbox
              id="select-all-checkbox"
              style={{ marginRight: "0.75em" }}
              checked={selectAll}
            />
            <span className="text-inherit !text-sm">Select all</span>
          </label>
        </div>
      )}
      {children}
    </div>
  );
}

const Dropdown = ({
  value,
  options,
  multiple,
  onChange,
  viewPort,
  isSearchable = true,
  groupBy,
  style = {},
  showToolTip = false,
  includeAll = false,
}: TDropdownProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectAll, setSelectAll] = React.useState(false);

  const open = Boolean(anchorEl);
  const id = open ? "autocomplete-label" : undefined;

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      handleClose();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: any,
    reason: any
  ) => {
    if (reason === "clear" || reason === "removeOption") {
      setSelectAll(false);
    }
    if (reason === "selectOption" && data.length === options.length) {
      setSelectAll(true);
    }
    onChange(data);
    if (!multiple) {
      handleClose();
    }
  };

  const handleSelectAll = () => {
    const updatedValue = selectAll ? [] : [...options];
    setSelectAll(!selectAll);
    onChange(updatedValue);
  };

  useEffect(() => {
    if (value?.length === options?.length) {
      setSelectAll(true);
    }
  }, [value]);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (!id && !anchorEl) return;
      let element = document.getElementById(id);

      if (
        element &&
        !element.contains(event.target) &&
        anchorEl &&
        !anchorEl.contains(event.target)
      ) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, anchorEl]);

  return (
    <>
      <div
        role="button"
        aria-description="autocomplete-trigger"
        onClick={handleClick}
        style={{ cursor: "pointer", width: "100%", ...style?.containerStyle }}
        data-testid="settings-autocomplete-trigger"
      >
        <AutocompleteTrigger
          defaultValue={value}
          isOpen={open}
          viewPort={viewPort}
          style={style?.labelStyle}
          multiple={multiple}
          onChange={onChange}
          showToolTip={showToolTip}
        />
      </div>
      <StyledPopper
        open={open}
        anchorEl={anchorEl}
        placement="top-start"
        style={{
          padding: !isSearchable ? "5px" : "16px",
        }}
        onClick={(event) => {
          // Stop propagation to prevent ClickAwayListener from closing the dropdown
          // when selecting an option in multiple selection mode.
          if (multiple) {
            event.stopPropagation();
          }
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <ODSAutoComplete
            open
            autoHighlight
            options={options}
            multiple={multiple}
            blurOnSelect={false}
            searchable={isSearchable}
            groupBy={groupBy}
            noOptionsText="No labels"
            data-testid="settings-autocomplete"
            value={value}
            slotProps={{
              paper: {
                sx: {
                  ...styles?.autocomplete?.paper(viewPort),
                },
              },
            }}
            ListboxProps={{
              sx: {
                ...styles?.autocomplete?.listbox(viewPort, style?.listStyle),
              },
              "data-testid": "settings-autocomplete-listbox",
            }}
            textFieldProps={{
              size: "small",
              InputProps: {
                "data-testid": "settings-autocomplete-input",
                startAdornment: isSearchable && (
                  <Icon
                    outeIconName="OUTESearchIcon"
                    outeIconProps={{
                      sx: {
                        height: "1.2em",
                        width: "1.2em",
                      },
                    }}
                  />
                ),
                endAdornment: null,
              },
            }}
            getOptionLabel={(option) => {
              if (Array.isArray(option) && option.length === 0) {
                return "";
              }
              return option?.label ? String(option?.label) : String(option);
            }}
            isOptionEqualToValue={(option, value) => {
              return option?.label
                ? option?.label === value?.label
                : option === value;
            }}
            onChange={handleChange}
            PopperComponent={PopperComponent}
            PaperComponent={(paperProps) =>
              paperComponent({
                paperProps,
                handleSelectAll,
                selectAll,
                includeAll,
              })
            }
            renderOption={(props, option, { selected, index }) => {
              return (
                <div
                  {...props}
                  key={`${option?.label ? option?.label : option}-${index}`}
                  style={styles.autocomplete.option}
                  data-testid="settings-autocomplete-option"
                >
                  {multiple && <ODSCheckbox checked={selected} />}
                  <span
                    style={{
                      ...(styles.autocomplete.option.text({
                        flex: 1,
                      })),
                      wordBreak: "break-all",
                    }}
                  >
                    {option?.label ? option?.label : option}
                  </span>
                </div>
              );
            }}
          />
        </ClickAwayListener>
      </StyledPopper>
    </>
  );
};

export default Dropdown;
