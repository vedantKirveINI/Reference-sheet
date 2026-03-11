import React, { Fragment, useEffect, useRef, useState } from "react";
import { ODSIcon, ODSLabel, ODSPopover } from "@src/module/ods";
import { isEmpty, lowerCase, toUpper } from "lodash";
import { cn } from "@/lib/utils";

import NESTED_FIELD_MAPPING from "../../../../constant/nestedFieldMapping";
import SearchField from "../SearchField";
import QUESTION_TYPE_ICON from "../../../../constant/questionTypeIcon";
const getFieldValue = ({ fieldValue, nestedField }) => {
  if (nestedField) {
    return `${fieldValue} (${nestedField})`;
  }

  if (isEmpty(fieldValue)) {
    return "Select a field";
  }

  return fieldValue || "";
};

const getLabelValue = (label: string) => {
  if (label.length < 50) return label;

  return `${label.slice(0, 50)}...`;
};

function FieldSelect({ data, schema = [], onFieldChangeHandler }) {
  const [open, setOpen] = useState(false);
  const [expandedField, setExpandedField] = useState({});
  const [optionList, setOptionList] = useState(schema);
  const inputRef = useRef(null);

  const handleExpandedField = (name) => {
    setExpandedField((prev) => ({
      [name]: !prev[name],
    }));
  };

  const closeHandler = () => {
    setOpen(false);
    setExpandedField({});
  };

  const handleFieldSelect = ({ field, nestedField }) => {
    closeHandler();
    onFieldChangeHandler({
      property: "key",
      newValue: { fieldInfo: field, nestedField },
    });
  };

  const getFilterOptions = (searchValue) => {
    setOptionList(() => {
      return schema.filter((opt) => {
        return lowerCase(opt?.name).includes(lowerCase(searchValue));
      });
    });
  };

  useEffect(() => {
    if (open && data?.nested_key) {
      setExpandedField(() => ({
        [data.key]: true,
      }));
    }
  }, [open, data?.nested_key, data?.key]);

  const selectedField = data?.nested_key || data?.key;
  const displayValue = getFieldValue({
    fieldValue: data?.key,
    nestedField: data?.nested_key,
  });

  return (
    <>
      <div
        ref={inputRef}
        onClick={() => setOpen((p) => !p)}
        className="border border-[#CFD8DC] flex items-center justify-between px-2.5 py-2.5 rounded-md flex-[3] max-w-[70%] h-11 bg-white box-border"
        data-testid="filter-field"
      >
        <ODSLabel
          variant="body1"
          color={!isEmpty(data?.key) ? "#263238" : "#BEC9D0"}
          className="truncate"
        >
          {displayValue}
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
        onClose={closeHandler}
      >
        <div 
          className="p-3 rounded-md border border-[#cfd8dc] bg-white shadow-lg mt-1 min-w-[10.5rem] max-w-none" 
          style={{ width: inputRef.current?.offsetWidth || undefined }}
          data-testid="filter-field-popover"
        >
          <SearchField
            getFilterOptions={getFilterOptions}
            placeholder="Find fields"
          />

          <div className="overflow-y-auto max-h-[35rem]">
            <div className="flex flex-col gap-3 mt-3">
              {optionList.map((field, index) => {
                const hasNestedField =
                  !!NESTED_FIELD_MAPPING[toUpper(field?.type)];

                return (
                  <Fragment key={field?.id || index}>
                    <div
                      data-testid={`filter-field-${index}`}
                      className={cn(
                        "flex items-center py-3 px-2 gap-2 rounded-md cursor-pointer hover:bg-gray-100",
                        selectedField === field?.name && "bg-[#212121] text-white hover:bg-[#212121]"
                      )}
                      onClick={(e) => {
                        const target = e.target;

                        if (
                          (target as Element).closest('[data-click="nested"]')
                        ) {
                          handleExpandedField(field?.name);
                          return;
                        }

                        handleFieldSelect({ field, nestedField: undefined });
                      }}
                    >
                      {QUESTION_TYPE_ICON[field?.type] ? (
                        <ODSIcon
                          imageProps={{
                            src: QUESTION_TYPE_ICON[field?.type],
                            width: "20px",
                            height: "20px",
                          }}
                        />
                      ) : null}

                      <span className="text-[#263238] font-inter text-base font-normal leading-6 tracking-[0.03125rem] flex-1 truncate">{getLabelValue(field?.name)}</span>

                      {hasNestedField && (
                        <div className="flex items-center gap-2 text-[#607D8B] font-inter text-sm font-normal leading-5 cursor-pointer ml-3" data-click="nested">
                          <span>
                            {expandedField[field?.name]
                              ? "Hide Field"
                              : "Show Field"}
                          </span>
                          <ODSIcon
                            outeIconName="OUTEChevronRightIcon"
                            outeIconProps={{
                              className: cn(
                                "transition-transform duration-100 ease-in",
                                expandedField[field?.name] ? "-rotate-90" : "rotate-90",
                                selectedField === field?.name ? "text-white" : ""
                              ),
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {hasNestedField && expandedField[field?.name] && (
                      <div className="flex flex-col gap-3 overflow-hidden transition-[max-height] duration-100 ease-linear">
                        {NESTED_FIELD_MAPPING[toUpper(field?.type)].map(
                          (nestedField) => (
                            <span
                              key={nestedField?.key}
                              className={cn(
                                "text-[#263238] font-inter text-base font-normal leading-6 tracking-[0.03125rem] flex-1 truncate py-3 px-14 rounded-md flex-shrink-0 cursor-pointer hover:bg-gray-100",
                                selectedField === nestedField?.key && "bg-[#212121] text-white hover:bg-[#212121]"
                              )}
                              onClick={() => {
                                handleFieldSelect({
                                  field,
                                  nestedField: nestedField?.key,
                                });
                              }}
                            >
                              {getLabelValue(nestedField?.label)}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </ODSPopover>
    </>
  );
}

export default FieldSelect;
