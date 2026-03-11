import { useState, useEffect, useCallback, CSSProperties } from "react";
import { shuffle } from "lodash";
import { WrappedEditor } from "@src/module/wrappededitor";
import { CHARACTERS, Mode } from "@oute/oute-ds.core.constants";
import { getMcqFillerContainerStyles } from "./styles";
import { getAlphabetValue, isOptionDisabled } from "./utils";
import OtherScq from "./components/OtherScq";
import TextScq from "./components/TextScq";
export function FillerSCQ({
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
}) {
  // Added to remove older node other option 21/Moy
  const hasOther = question?.settings?.other;
  const allowOtherInput = question?.settings?.allowOtherInput;

  const [optionsArray, setOptionsArray] = useState(options);
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  useEffect(() => {
    const defaultValue = question?.settings?.defaultValue;
    if (
      typeof defaultValue === "string" &&
      question?.settings?.defaultValue &&
      !isAnswered
    ) {
      if (defaultValue?.toLowerCase() !== "other") {
        handleOnChange(defaultValue);
      }
      if (defaultValue?.toLowerCase() === "other") {
        if (!allowOtherInput) {
          handleOnChange(defaultValue);
        }
        setIsOtherSelected(true);
      }
    }

    if (typeof value === "string" && value) {
      if (!optionsArray?.includes(value)) {
        setIsOtherSelected(true);
      }
    }
    if (question?.settings?.randomize) {
      let updatedOptions = shuffle(options);

      setOptionsArray(updatedOptions);
    }
  }, []);

  const handleClick = useCallback(
    (optionIndex: number) => {
      const clickedOption = optionsArray[optionIndex];
      handleOnChange(clickedOption);
      setIsOtherSelected(false);
    },
    [handleOnChange, optionsArray]
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
          handleClick(index);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enableKeyboardShortcuts, mode, options, value, handleClick]);

  return (
    <div
      style={{
        ...getMcqFillerContainerStyles({
          questionAlignment: question?.settings?.questionAlignment,
          mode,
          isAlignmentVertical: question?.settings?.isAlignmentVertical,
          theme,
        }),
        ...style,
      }}
      data-testid="multi-choice-options-container"
    >
      {optionsArray?.map((option, i) => {
        const isSelected = value === option;
        return (
          <WrappedEditor
            key={`${option}-${i}`}
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
              handleClick(i);
            }}
            inputType={"Radio"}
            tabIndex={0}
            customStyle={{
              container: {
                maxWidth: "100%",
              },
            }}
            theme={theme}
            isReadOnly={true}
          />
        );
      })}
      {hasOther && (
        <OtherScq
          isOtherSelected={isOtherSelected}
          optionsArray={optionsArray}
          disabled={false}
          theme={theme}
          handleOnChange={() => {
            if (allowOtherInput) {
              handleOnChange("");
            } else {
              handleOnChange("Other");
            }
            setIsOtherSelected(true);
          }}
        />
      )}
      {hasOther && isOtherSelected && allowOtherInput && (
        <TextScq theme={theme} value={value} handleOnChange={handleOnChange} />
      )}
    </div>
  );
}
