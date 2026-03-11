import "./filler-mcq-options-group.css";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import { shuffle } from "lodash-es";
import { WrappedEditor } from "@src/module/wrappededitor";
import { CHARACTERS, Mode, ViewPort } from "@oute/oute-ds.core.constants";
import { getMcqFillerContainerStyles } from "./styles";
import { getMcqOptionGroupStyles } from "@src/module/mcq/styles";
import { getAlphabetValue, isOptionDisabled } from "./utils";
import OtherScq from "./components/OtherScq";
import TextScq from "./components/TextScq";

export type FillerMCQOptionsGroupProps = {
  mode?: Mode;
  question?: any;
  options: any[];
  handleOnChange: any;
  disabled: boolean;
  value?: any;
  theme?: any;
  enableKeyboardShortcuts?: boolean;
  style?: CSSProperties;
  isAnswered?: boolean;
  viewPort?: typeof ViewPort[keyof typeof ViewPort];
  boxesPerRow?: number;
};

export function FillerMCQOptionsGroup({
  mode,
  question,
  options,
  handleOnChange,
  theme,
  value,
  enableKeyboardShortcuts = true,
  style = {},
  disabled = false,
  isAnswered = false,
  viewPort,
  boxesPerRow = 1,
}: FillerMCQOptionsGroupProps) {
  // Added to remove older node other option 21/Moy
  const hasOther = question?.settings?.other;
  const allowOtherInput = question?.settings?.allowOtherInput;

  // const transformedOptions =
  //   hasOther && lastOption !== "other" ? [...options, "Other"] : options;
  const [optionsArray, setOptionsArray] = useState(options);
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  useEffect(() => {
    const defaultValue = question?.settings?.defaultValue;
    if (defaultValue && !isAnswered) {
      handleOnChange({
        value: defaultValue,
        __to_string: defaultValue?.join(", "),
      });

      const isOtherInDefaultValue = defaultValue?.find(
        (item) => item?.toLowerCase() === "other"
      );
      if (isOtherInDefaultValue) {
        setIsOtherSelected(true);
      }
    }

    const isOtherInValue = value?.value?.find(
      (item) => item?.toLowerCase() === "other" || !optionsArray?.includes(item)
    );

    if (isOtherInValue) {
      setIsOtherSelected(true);
    }

    if (question?.settings?.randomize) {
      let updatedOptions = shuffle(options);
      // if (hasOther && lastOption !== "other") {
      //   updatedOptions.push("Other");
      // }
      setOptionsArray(updatedOptions);
    }
  }, []);

  const handleClick = useCallback(
    (clickedOption) => {
      // const clickedOption = optionsArray[optionIndex];

      if (value?.value?.includes(clickedOption)) {
        const _tempOpts = [
          ...value?.value.filter((option) => option !== clickedOption),
        ];
        return handleOnChange({
          value: _tempOpts,
          __to_string: _tempOpts?.join(", "),
        });
      }
      // const updatedOptions = optionsArray?.filter((option, index) => {
      //   if (index === optionIndex) {
      //     return option;
      //   }
      // });

      const _tempOpt = [...value?.value, clickedOption];
      handleOnChange({
        value: _tempOpt,
        __to_string: _tempOpt?.join(", "),
      });
    },
    [handleOnChange, optionsArray, value]
  );

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (
        !enableKeyboardShortcuts ||
        mode == Mode.CLASSIC ||
        event?.target?.localName === "textarea"
      )
        return;

      const { key } = event;
      if (/^[a-zA-Z]$/.test(key.toLowerCase())) {
        const index = getAlphabetValue(key);

        if (index >= 0 && index < options.length) {
          handleClick(optionsArray[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enableKeyboardShortcuts, mode, options, value, handleClick]);

  const gridStyle = getMcqOptionGroupStyles({
    column: boxesPerRow,
    viewPort,
  });

  return (
    <div
      style={{
        ...getMcqFillerContainerStyles({
          questionAlignment: question?.settings?.questionAlignment,
          mode,
          isAlignmentVertical: question?.settings?.isAlignmentVertical,
          theme,
          viewPort,
        }),
        ...style,
      }}
      data-testid="multi-choice-options-container"
    >
      <div
        className="filler-mcq-options-grid"
        style={gridStyle}
        data-columns={boxesPerRow}
      >
        {optionsArray?.map((option, i) => {
          const isSelected = value?.value?.includes(option);
          return (
            <div
              key={i}
              className="filler-mcq-option-wrapper"
              data-testid={`multi-choice-option-wrapper-${i}`}
            >
              <WrappedEditor
                dataTestId={`multi-choice-option-${i}`}
                onValueChange={() => {}}
                value={option}
                isSelected={isSelected}
                leftIcon={CHARACTERS[i]}
                disabled={
                  disabled ||
                  (!isSelected && isOptionDisabled(value?.value, question))
                }
                onClick={() => {
                  handleClick(option);
                }}
                inputType={"Checkbox"}
                tabIndex={0}
                customStyle={{
                  container: {
                    width: "100%",
                    boxSizing: "border-box",
                    minWidth: 0,
                    justifyContent: "flex-start",
                  },
                }}
                theme={theme}
                isReadOnly={true}
              />
            </div>
          );
        })}
        {hasOther && (
          <div
            className="filler-mcq-option-wrapper"
            data-testid="multi-choice-option-wrapper-other"
          >
            <OtherScq
              isOtherSelected={isOtherSelected}
              optionsArray={optionsArray}
              disabled={false}
              theme={theme}
              handleOnChange={() => {
                if (!allowOtherInput) {
                  handleClick("Other");
                }
                if (isOtherSelected) {
                  const newOptions = value?.value?.filter((item) => {
                    return optionsArray?.includes(item);
                  });
                  handleOnChange({
                    value: [...newOptions],
                    __to_string: [...newOptions]?.join(", "),
                  });
                }
                setIsOtherSelected(!isOtherSelected);
              }}
            />
          </div>
        )}
        {hasOther && isOtherSelected && allowOtherInput && (
          <div
            className="filler-mcq-option-wrapper"
            data-testid="multi-choice-option-wrapper-other-text"
            style={boxesPerRow === 2 ? { gridColumn: "1 / -1" } : undefined}
          >
            <TextScq
              theme={theme}
              value={value?.value?.find((item) => {
                return (
                  !optionsArray?.includes(item) &&
                  item?.toLowerCase() !== "other"
                );
              })}
              handleOnChange={(e) => {
                const valuesExpectOther = value?.value?.filter((item) => {
                  return optionsArray?.includes(item);
                });
                handleOnChange({
                  value: [...valuesExpectOther, e],
                  __to_string: [...valuesExpectOther, e]?.join(", "),
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
