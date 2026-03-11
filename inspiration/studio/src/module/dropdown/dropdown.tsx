import  {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { QuestionTab } from "@oute/oute-ds.core.constants";
import Autocomplete from "./components/autocomplete/index";
import { getAddChoiceStyles, getContainerStyles } from "./styles";
import {
  getSortedOptionsForDynamicDropdown,
  getSortedOptionsForStaticDropdown,
} from "./utils";

const deriveSourceType = (settings: any): "static" | "tinyTable" | "dynamic" => {
  if (settings?.sourceType) return settings.sourceType;
  if (settings?.dynamicInputs?.sourceNode) return "tinyTable";
  if (settings?.dynamicInputs?.variable?.blocks?.length > 0) return "dynamic";
  return "static";
};
export type DropDownProps = {
  options?: any;
  value?: any;
  onChange: any;
  viewPort?: string;
  isCreator?: boolean;
  settings?: any;
  variables?: any;
  question?: any;
  answers?: any;
  disabled?: boolean;
  isInputValid?: boolean;
  isIntegration?: boolean;
  theme?: any;
  placeholder?: string;
  goToTab?: (questionTab: string, options?: { highlightDataSource?: boolean }) => void;
  isAnswered?: boolean;
  isPreview?: boolean;
};

export const Dropdown = forwardRef(
  (
    {
      value,
      viewPort,
      onChange,
      isCreator = true,
      settings,
      answers,
      options: optionsFromProps = [],
      disabled = false,
      isInputValid,
      isIntegration,
      theme = {},
      goToTab = () => {},
      placeholder = "Select achoice",
      isAnswered = false,
      isPreview = false,
    }: DropDownProps,
    ref
  ) => {
    const [options, setOptions] = useState([]);
    const sourceType = deriveSourceType(settings || {});

    const resolveOptions = (initialAnswers = {}, staticOptions = optionsFromProps) => {
      if (sourceType === "static") {
        const optionsTemp = getSortedOptionsForStaticDropdown({
          options: staticOptions,
          settings,
        });
        setOptions(optionsTemp ?? []);
      } else {
        const optionsTemp = getSortedOptionsForDynamicDropdown({
          settings,
          answers: initialAnswers,
        });
        setOptions(optionsTemp ?? []);
      }
    };

    useEffect(() => {
      resolveOptions(answers, optionsFromProps);
    }, []);

    const isMultiSelect = settings?.selectionType !== "Single";

    useEffect(() => {
      if (!isCreator && value === undefined && !isAnswered) {
        if (isMultiSelect) {
          onChange(settings?.defaultChoice || "");
        } else {
          const dc = settings?.defaultChoice;
          const single = Array.isArray(dc) ? dc?.[0] ?? "" : (dc ?? "");
          onChange(single);
        }
      }
    }, [isCreator, value, settings?.defaultChoice, onChange, isMultiSelect]);

    useImperativeHandle(ref, () => {
      return {
        refresh: (answers) => resolveOptions(answers),
      };
    }, [resolveOptions]);

    return (
      <section
        style={{ ...getContainerStyles({ theme }), zIndex: isCreator ? undefined : 100 }}
        data-testid="dropdown-dynamic-container"
      >
        <div style={{ cursor: "pointer" }}>
          <Autocomplete
            disabled={disabled}
            options={options}
            value={value}
            onChange={onChange}
            viewPort={viewPort}
            isCreator={isCreator}
            isPreview={isPreview}
            multiple={isMultiSelect}
            isInputValid={isInputValid}
            isIntegration={isIntegration}
            theme={theme}
            placeholder={placeholder}
            enableSearch={settings?.searchable !== false}
          />
        </div>

        {isCreator && (
          <div
            role="button"
            tabIndex={0}
            style={getAddChoiceStyles({ theme })}
            className="focus:outline-none focus:ring-0"
            onClick={() => {
              if (isCreator) {
                goToTab?.(QuestionTab.SETTINGS, { highlightDataSource: true });
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && isCreator) {
                e.preventDefault();
                goToTab?.(QuestionTab.SETTINGS, { highlightDataSource: true });
              }
            }}
            data-testid="dropdown-add-choice"
          >
            <span data-testid="dropdown-edit-choice">Add Choice</span>
          </div>
        )}
      </section>
    );
  }
);
