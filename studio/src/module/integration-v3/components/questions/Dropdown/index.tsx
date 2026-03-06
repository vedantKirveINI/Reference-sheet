import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Autocomplete from "./components/autocomplete/index";
import { getSortedOptions } from "./utils/getSortedOptions";
export type DropDownProps = {
  options?: any;
  value?: any;
  onChange: any;
  isCreator?: boolean;
  settings?: any;
  question?: any;
  answers?: any;
  disabled?: boolean;
  dataTestId?: string;
  // Controls refresh behavior for DropdownV2 in integration-v2
  showRefreshButton?: boolean;
  onRefresh?: () => Promise<void> | void;
};

export const Dropdown = forwardRef(
  (
    {
      options: optionsFromProps = [],
      value = null,
      onChange,
      isCreator = true,
      settings,
      answers,
      disabled = false,
      question,
      dataTestId,
    }: DropDownProps,
    ref
  ) => {
    const [options, setOptions] = useState([]);
    const isMultiSelect = settings?.selectionType !== "Single";

    const safeValue = useMemo(() => {
      try {
        if (isMultiSelect) {
          return (
            value?.filter?.((v) => options?.some?.((o) => o?.id === v?.id)) ??
            []
          );
        }

        const exists = options?.some?.((o) => o?.id === value?.id);
        return exists ? value : null;
      } catch (error) {
        return value;
      }
    }, [options, value, isMultiSelect]);

    const resolveOptions = (initialAnswers = {}) => {
      const optionsTemp = getSortedOptions({
        options: optionsFromProps,
        settings,
        answers: initialAnswers,
        question,
      });

      try {
        if (isMultiSelect) {
          const filteredValue = value?.filter?.((v) =>
            optionsTemp?.some?.((o) => o?.id === v?.id)
          );
          if (filteredValue?.length !== value?.length) {
            onChange(filteredValue);
          }
        } else {
          const selectedOption = optionsTemp?.find?.(
            (option) => option?.id === value?.id
          ) || null;

          onChange(selectedOption);
          
        }
      } catch (error) {
      }

      setOptions(optionsTemp);
    };

    useEffect(() => {
      resolveOptions(answers);
    }, [optionsFromProps]);

    useImperativeHandle(ref, () => {
      return {
        refresh: (answers) => resolveOptions(answers),
      };
    }, [resolveOptions]);

    return (
      <div
        data-testid={dataTestId ? dataTestId + "-container" : "dropdown-root"}
      >
        <Autocomplete
          disabled={disabled}
          options={options}
          multiple={isMultiSelect}
          value={safeValue}
          onChange={onChange}
          dataTestId={dataTestId}
        />
      </div>
    );
  }
);
