import "./creator-mcq-options-group.css";
import { useCallback, useEffect, useState } from "react";
import { WrappedEditor } from "@src/module/wrappededitor";
import { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { Mode, QuestionType, ViewPort } from "@src/module/constants";
import { getMcqOptionGroupStyles, getMcqOptionsContainer, getWrappedEditorButtonStyles } from "./styles";
import { isEmpty } from "lodash-es";
import { icons } from "@/components/icons";
import { CHARACTERS } from "./utils/utils";
import { IOption } from "./types";
import DndKitProvider from "./provider/dnd-kit-provider";
import WrappedEditorSortableWrapper from "./wrapped-editor-sortable-wrapper";
import { isOptionRepeated } from "./utils/isOptionsRepeated";
import { ERROR_DISPLAY_DURATION, MAX_LABEL_LENGTH, MAX_OPTIONS } from "./constants";
import { checkWhetherStringContainsNewLineCharacters, splitStringIntoOptionsByNewLineChar } from "@src/module/utils";

export type CreatorMCQOptionsGroupProps = {
  mode?: Mode;
  question?: any;
  optionArray: IOption[];
  onChange: (key: string, value: any) => void;
  withImage?: boolean;
  boxesPerRow?: number;
  theme?: any;
  viewPort?: ViewPort;
};

export const CreatorMCQOptionsGroup = ({
  mode,
  question,
  onChange,
  theme,
  optionArray,
  boxesPerRow = 1,
  viewPort,
}: CreatorMCQOptionsGroupProps) => {
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [errorTimeoutId, setErrorTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [indexToFocus, setIndexToFocus] = useState<number | null>(null);
  const onChangeValue = (_label, index) => {
    if (errorTimeoutId) clearTimeout(errorTimeoutId);

    if (_label.length > MAX_LABEL_LENGTH) {
      setErrorIndex(index);
      const id = setTimeout(() => setErrorIndex(null), ERROR_DISPLAY_DURATION);
      setErrorTimeoutId(id);
      return;
    }
    setErrorIndex(null);
    const newOptionsArray = [...optionArray];

    if (checkWhetherStringContainsNewLineCharacters(_label)) {
      const optionsAfterSplit = splitStringIntoOptionsByNewLineChar(_label);

      if (optionsAfterSplit.length + optionArray.length > MAX_OPTIONS) return; //prevent adding more than 26 options

      // Insert options without replacing existing ones
      newOptionsArray.splice(index, 1, ...optionsAfterSplit);
      setIndexToFocus(newOptionsArray.length - 1);
    } else {
      newOptionsArray[index] = _label;
    }

    onChange("options", newOptionsArray);
  };
  const handleDelete = (index: number) => {
    const newOptions = optionArray.filter(
      (_, optionIndex) => optionIndex !== index
    );
    onChange("options", newOptions);
  };

  // fix: fixed the dynamic option index
  const handleAddOptions = () => {
    if (optionArray.length >= MAX_OPTIONS) return; //prevent adding more than 26 options
    const newOption: IOption = "";
    const updatedArray = [...optionArray, newOption];
    onChange("options", updatedArray);
    setIndexToFocus(updatedArray.length - 1);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const newOptions = (options: IOption[]) => {
        const oldIndex = optionArray.findIndex(
          (option) => option === active.id
        );
        const newIndex = optionArray.findIndex((option) => option === over?.id);
        return arrayMove(options, oldIndex, newIndex);
      };
      onChange("options", newOptions(optionArray));
    }
  };

  // Added to remove older node other option 21/Moy
  useEffect(() => {
    if (
      question?.settings?.other &&
      (optionArray[optionArray.length - 1] === "Other" ||
        optionArray[optionArray.length - 1] === "other")
    ) {
      const removedOtherOption = optionArray.splice(0, optionArray.length - 1);
      onChange("options", removedOtherOption);
    }
  }, []);

  const checkIsSelected = useCallback(
    (option: string) => {
      if (isEmpty(option)) return false;
      if (question?.type === QuestionType.MCQ) {
        return question?.settings?.defaultValue?.includes(option);
      }
      if (question?.type === QuestionType.SCQ) {
        return question?.settings?.defaultValue === option;
      }

      return false;
    },
    [question?.type, question?.settings?.defaultValue]
  );

  return (
    <>
      <div
        style={getMcqOptionsContainer({
          questionAlignment: question?.settings?.questionAlignment,
          mode,
          viewPort,
        })}
        data-testid="multi-choice-node-container"
      >
        <DndKitProvider
          onDragEnd={onDragEnd}
          shouldRestrictToVerticalAxis={boxesPerRow === 1}
        >
          <SortableContext items={optionArray} strategy={rectSortingStrategy}>
            <div
              className="mcq-creator-options-grid"
              style={getMcqOptionGroupStyles({
                column: boxesPerRow,
                viewPort,
              })}
              data-testid="multi-choice-options-container"
              data-columns={boxesPerRow}
            >
              {optionArray.map((option, index) => {
                const isSelected = checkIsSelected(option);

                // Other option container should not be draggable beacuse it should always be at last
                const isDraggable = !isOptionRepeated(optionArray, option);
                const RemoveIcon = icons.x;
                const DragIcon = icons.gripVertical;
                return (
                  <div
                    key={index}
                    className="mcq-creator-option-wrapper"
                    data-testid={`multi-choice-option-wrapper-${index}`}
                  >
                    <WrappedEditorSortableWrapper
                      id={option}
                      enableClickAnimation={false}
                      autoFocus={indexToFocus === index}
                      isSelected={isSelected}
                      leftIcon={CHARACTERS[index]}
                      hoverIcon={
                        <RemoveIcon
                          className="size-4 shrink-0"
                          style={{ color: theme?.styles?.buttonText }}
                          data-testid={`multi-choice-option-remove-icon-${index}`}
                        />
                      }
                      rightIcon={
                        <DragIcon
                          className="size-5 shrink-0 text-black"
                          data-testid={`multi-choice-option-drag-icon-${index}`}
                        />
                      }
                      value={option}
                      onValueChange={(label) => onChangeValue(label, index)}
                      onLeftIconClick={() => handleDelete(index)}
                      onInputKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === "Tab") && !e.shiftKey) {
                          setErrorIndex(null);
                          e.preventDefault();
                          handleAddOptions();
                        }
                      }}
                      isDraggable={isDraggable}
                      inputType={question?.type === QuestionType.MCQ ? "Checkbox" : "Radio"}
                      placeholder={`Option ${index + 1}`}
                      customStyle={{
                        container: {
                          width: "100%",
                          boxSizing: "border-box",
                          justifyContent: "flex-start",
                        },
                      }}
                      theme={theme}
                      error={errorIndex === index ? "CHARACTER LIMIT OF 150 EXCEEDED" : null}
                      onClick={() => {
                        if (errorIndex !== index) setErrorIndex(null);
                      }}
                      dataTestId={`multi-choice-option-${index}`}
                      isReadOnly={false}
                    />
                  </div>
                );
              })}

              {question?.settings?.other && (
                <div
                  className="mcq-creator-option-wrapper"
                  data-testid="multi-choice-option-wrapper-other"
                >
                  <WrappedEditor
                    enableClickAnimation={false}
                    customStyle={{
                      container: {
                        ...getWrappedEditorButtonStyles,
                      },
                    }}
                    isSelected={question?.settings?.defaultValue?.includes(
                      "Other"
                    )}
                    leftIcon={CHARACTERS[optionArray.length]}
                    value="Other"
                    onValueChange={() => {}}
                    theme={theme}
                    dataTestId="multi-choice-option-other"
                    inputType={
                      question?.type === QuestionType.MCQ ? "Checkbox" : "Radio"
                    }
                    isReadOnly
                  />
                </div>
              )}
              <div
                className="mcq-creator-option-wrapper"
                data-testid="multi-choice-option-wrapper-add"
              >
                <WrappedEditor
                  enableClickAnimation={false}
                  customStyle={{
                    container: {
                      ...getWrappedEditorButtonStyles,
                    },
                  }}
                  value="Tab/Enter to add option"
                  leftIcon={
                    <icons.cornerDownLeft
                      className="size-4 shrink-0"
                      style={{ color: theme?.styles?.buttonText }}
                      data-testid="multi-choice-add-option-icon"
                    />
                  }
                  disabled={false}
                  onValueChange={() => {}}
                  onClick={() => {
                    setErrorIndex(null);
                    handleAddOptions();
                  }}
                  theme={theme}
                  dataTestId="multi-choice-add-option"
                  inputType={question?.type === QuestionType.MCQ ? "Checkbox" : "Radio"}
                  isReadOnly
                />
              </div>
            </div>
          </SortableContext>
        </DndKitProvider>
      </div>
    </>
  );
};
