import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";

import { QuestionRepeatorProps } from "../../types";
import { fillerViewStyles, getTextStyles } from "../../styles";
import { getDefaultAnswerByIndex } from "../../utils";

import { ODSButton, ODSTextField } from "@src/module/ods";
type FillerViewprops = {
  question: QuestionRepeatorProps["question"];
  onChange: QuestionRepeatorProps["onChange"];
  value: QuestionRepeatorProps["value"];
  theme: QuestionRepeatorProps["theme"];
};

export const FillerView = forwardRef(
  ({ question, value = [], onChange, theme = {} }: FillerViewprops, ref) => {
    const children = question.settings.collectionData.children || [];

    const onAddItem = useCallback(() => {
      const newCollectionAnswer = getDefaultAnswerByIndex(
        question.settings.collectionData
      );
      onChange("collectionData", [...value, newCollectionAnswer]);
    }, [onChange, question.settings.collectionData, value]);

    const onChildValueChange = useCallback(
      (key: string, newValue: string, answerIndex: number) => {
        const newCollectionAnswer = [...value];
        newCollectionAnswer[answerIndex] = {
          ...(newCollectionAnswer[answerIndex] || {}),
          [key]: newValue,
        };
        onChange("collectionData", newCollectionAnswer);
      },
      [onChange, value]
    );

    useEffect(() => {
      const firstCollectionAnswer = getDefaultAnswerByIndex(
        question.settings.collectionData
      );
      onChange("collectionData", [firstCollectionAnswer]);
    }, []);

    useImperativeHandle(ref, () => {
      return {
        validate: () => {},
      };
    }, []);

    return (
      <div style={fillerViewStyles.getRootStyles()}>
        {value.map((item, index) => (
          <div key={index} style={fillerViewStyles.getValuesRootStyles()}>
            <div style={fillerViewStyles.getGroupRootStyles()}>
              <span
                style={getTextStyles({
                  fontFamily: theme?.styles?.fontFamily,
                  fontSize: "1.3em",
                  color: theme?.styles?.questions,
                })}
              >
                {question.settings.collectionData.title + " " + (index + 1)}
              </span>
              <div style={fillerViewStyles.getChildrenRootStyles()}>
                {children.map((child) => (
                  <div
                    key={child.title + index}
                    style={fillerViewStyles.getInputContainerStyles()}
                  >
                    <span
                      style={getTextStyles({
                        fontFamily: theme?.styles?.fontFamily,
                        color: theme?.styles?.questions,
                      })}
                    >
                      {child.title}
                    </span>
                    <ODSTextField
                      style={{
                        width: "80%",
                        fontFamily: theme?.styles?.fontFamily || "inherit",
                      }}
                      value={item[child.title]}
                      onChange={(event) =>
                        onChildValueChange(
                          child.title,
                          event.target.value,
                          index
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <ODSButton
          
          variant="black"
          label={`Add a ${question.settings.collectionData.title}`}
          onClick={onAddItem}
        />
      </div>
    );
  }
);
