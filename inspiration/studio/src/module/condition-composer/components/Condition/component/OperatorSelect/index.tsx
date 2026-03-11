import React, { useEffect, useRef, useState } from "react";
import { ODSLabel, ODSIcon, ODSPopover } from "@src/module/ods";
import SearchField from "../SearchField";
import { isEmpty, lowerCase } from "lodash";
import { cn } from "@/lib/utils";
interface OperatorOption {
  key: string;
  value: string;
}

interface OperatorSelectProps {
  data: {
    operator?: OperatorOption;
  };
  opertorOptions: OperatorOption[];
  onFieldChangeHandler: (args: {
    property: string;
    newValue: OperatorOption;
  }) => void;
}

function OperatorSelect({
  data,
  opertorOptions,
  onFieldChangeHandler,
}: OperatorSelectProps) {
  const [open, setOpen] = useState(false);
  const [optionList, setOptionList] = useState(opertorOptions);
  const inputRef = useRef<HTMLDivElement>(null);

  const getFilterOptions = (searchValue) => {
    setOptionList(() => {
      return opertorOptions.filter((opt) => {
        return lowerCase(opt?.value).includes(lowerCase(searchValue));
      });
    });
  };

  const onChangeHandler = (value: OperatorOption) => {
    onFieldChangeHandler({ property: "operator", newValue: value });
    setOpen(false);
  };

  useEffect(() => {
    if (!isEmpty(opertorOptions)) {
      setOptionList(opertorOptions);
    }
  }, [opertorOptions]);

  return (
    <>
      <div
        ref={inputRef}
        onClick={() => setOpen((p) => !p)}
        className="border border-[#CFD8DC] flex items-center justify-between p-2.5 box-border rounded-md flex-1 h-11 bg-white"
        data-testid="filter-condition"
      >
        <ODSLabel
          variant="body1"
          color={!isEmpty(data?.operator) ? "#263238" : "#BEC9D0"}
          className="truncate"
        >
          {data?.operator?.value || "Select a condition"}
        </ODSLabel>
        <ODSIcon
          outeIconName="OUTEChevronRightIcon"
          outeIconProps={{
            className: cn(
              "transition-transform duration-100 ease-in",
              open ? "-rotate-90" : "rotate-90"
            ),
          }}
        />
      </div>

      <ODSPopover
        open={open}
        anchorEl={inputRef.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        disablePortal={true}
        onClose={() => setOpen(false)}
      >
        <div 
          className="p-3 rounded-md border border-[#cfd8dc] bg-white shadow-[0px_6px_12px_0px_rgba(122,124,141,0.2)] z-[1] mt-1 min-w-[10rem] max-w-none" 
          style={{ width: inputRef.current?.offsetWidth || undefined }}
          data-testid="filter-condition-popover"
        >
          <SearchField
            getFilterOptions={getFilterOptions}
            placeholder="Find an operator"
          />

          <div className="flex flex-col mt-3">
            {optionList.map((option, index) => {
              const isSelected = data?.operator?.value === option?.value;

              return (
                <span
                  data-testid={`filter-condition-option-${index}`}
                  key={option?.key}
                  className={cn(
                    "p-3 text-[#263238] font-['Inter'] text-base font-normal leading-6 tracking-[0.03125rem] rounded-md cursor-pointer",
                    isSelected && "bg-[#212121] text-white"
                  )}
                  onClick={() => {
                    onChangeHandler(option);
                  }}
                >
                  {option?.value}
                </span>
              );
            })}
          </div>
        </div>
      </ODSPopover>
    </>
  );
}

export default OperatorSelect;
