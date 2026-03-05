import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { isEmpty, cloneDeep } from "lodash";
import { ODSLabel as Label } from "@src/module/ods";
import ConditionGroup from "./components/ConditionGroup";
import Footer from "./components/Footer";
import { getWhereClauseStr } from "./utils/getWhereClauseStr";
import sanitizeAndProcessData from "./utils/getSanitizedData";
import UNSUPPORTED_QUESTION_TYPES from "./constant/unsupportedQuestionTypes";

export type ConditionComposerProps = {
  initialValue: any;
  schema: any;
  onChange: any;
  variables: any;
};

const DEFAULT_VALUE = {
  id: `${Date.now()}_`,
  condition: "and",
  childs: [
    {
      id: `${Date.now()}`,
    },
  ],
};

export const ConditionComposer = forwardRef(
  (
    {
      initialValue = {},
      schema: initialSchema = [],
      onChange = () => {},
      variables = {},
    }: ConditionComposerProps,
    ref
  ) => {
    const [value, setValue] = useState(cloneDeep(initialValue));

    const schema = useMemo(() => {
      return initialSchema.filter(
        (item) => !UNSUPPORTED_QUESTION_TYPES.includes(item.type)
      );
    }, [initialSchema]);

    const onChangeHandler = (updatedValue) => {
      setValue(updatedValue);

      const sanitizedValue = sanitizeAndProcessData(cloneDeep(updatedValue));

      const whereClauseStr = getWhereClauseStr({
        initialVal: sanitizedValue,
        includeWhere: true,
      });

      onChange(sanitizedValue, whereClauseStr);
    };

    useEffect(() => {
      if (isEmpty(initialValue)) {
        setValue(() => cloneDeep(DEFAULT_VALUE));
      }
    }, []);

    useImperativeHandle(ref, () => {
      return {
        getValue: () => value,
        getSanitizedData: () => sanitizeAndProcessData(value),
      };
    }, [value]);

    return (
      <>
        <Label
          variant="subtitle2"
          color="#666"
          style={{
            lineHeight: "1.37rem",
            fontFamily: "Inter",
            ...(isEmpty(value?.childs) ? { marginBottom: "1.25rem" } : {}),
          }}
        >
          {isEmpty(value?.childs) ? (
            "No filter conditions are applied"
          ) : (
            <>
              In this view, show records{" "}
              <span
                style={{
                  fontFamily: "Inter",
                  fontSize: "1rem",
                  fontWeight: 600,
                  lineHeight: "2.25rem",
                  letterSpacing: " 0.078rem",
                  color: "#333",
                  marginLeft: "0.75rem",
                }}
              >
                WHERE
              </span>
            </>
          )}
        </Label>

        <ConditionGroup
          rootValues={value}
          conditions={value}
          nestedLevel={0}
          setValue={setValue}
          schema={schema}
          onChange={onChange}
          variables={variables}
          onChangeHandler={onChangeHandler}
        />

        <Footer
          schema={schema}
          onChangeHandler={onChangeHandler}
          rootValues={value}
        />
      </>
    );
  }
);
