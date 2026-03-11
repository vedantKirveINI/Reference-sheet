import React, { useEffect, useRef } from "react";
import { ODSAutocomplete as ODSAutoComplete, ODSCheckbox, ODSIcon as Icon } from "@src/module/ods";
import { ViewPort } from "@oute/oute-ds.core.constants";
import { styles } from "./styles";
import { AutocompleteTrigger } from "./triggerComponent";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnClickOutside } from "@/module/editor/hooks/useOnClickOutside";
import { cn } from "@/lib/utils";

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
  const popperRef = useRef<HTMLDivElement>(null);

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

  useOnClickOutside(popperRef, handleClose, open);

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
      {open && anchorEl && (
        <div
          ref={popperRef}
          id={id}
          className={cn(
            "z-[1300] text-[13px] w-fit min-w-[50px] max-w-[350px] h-fit p-1.5 rounded-xl border border-black/20 bg-white shadow-md mb-2.5 mt-2.5",
            !isSearchable && "p-1.5",
            isSearchable && "p-4"
          )}
          style={{
            position: "absolute",
            top: anchorEl ? `${anchorEl.getBoundingClientRect().top - 10}px` : "auto",
            left: anchorEl ? `${anchorEl.getBoundingClientRect().left}px` : "auto",
            transform: "translateY(-100%)",
          }}
          onClick={(event) => {
            // Stop propagation to prevent click outside from closing the dropdown
            // when selecting an option in multiple selection mode.
            if (multiple) {
              event.stopPropagation();
            }
          }}
        >
          <div className={cn("w-full h-[85%]", !isSearchable && "hidden")}>
            {includeAll && (
              <div className="mt-1.5 ml-1.5 w-full rounded-[0.75em] hover:bg-[#DBEDFF]">
                <Label
                  htmlFor="select-all-checkbox"
                  className="h-5 ml-0 py-2.5 px-2.5 text-sm cursor-pointer flex items-center gap-3"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectAll();
                  }}
                >
                  <Checkbox
                    id="select-all-checkbox"
                    checked={selectAll}
                    className="mr-3"
                  />
                  <span className="text-sm">Select all</span>
                </Label>
              </div>
            )}
            <ODSAutoComplete
              options={options}
              searchable={isSearchable}
              getOptionLabel={(option) => {
                if (Array.isArray(option) && option.length === 0) {
                  return "";
                }
                return option?.label ? String(option?.label) : String(option);
              }}
              onChange={handleChange}
              value={value}
              data-testid="settings-autocomplete"
              className="w-full"
              textFieldProps={{
                size: "small",
                placeholder: isSearchable ? "Search..." : undefined,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Dropdown;
