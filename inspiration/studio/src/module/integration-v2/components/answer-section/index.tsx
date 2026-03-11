import { forwardRef, lazy } from "react";
import type { ComponentType } from "react";

import { SuspenseComponent } from "../suspense-component";

import { QuestionType, ViewPort } from "@oute/oute-ds.core.constants";
import { QuestionRepeator } from "../questions/QuestionRepeator";

const Dropdown = lazy(() =>
  import("../questions/dropdown/dropdown-v2").then((module) => ({
    default: module.DropdownV2,
  }))
);

const YesNo = lazy(() =>
  import("../questions/yes-no").then((module) => ({
    default: module.default,
  }))
);

type FormulaBarComponent = ComponentType<Record<string, unknown>>;

const FormulaBar = lazy<FormulaBarComponent>(() =>
  import("@src/components/formula-fx/src").then((module) => ({
    default: module.FormulaBar as FormulaBarComponent,
  }))
);

const TextPreview = lazy(() =>
  import("@oute/oute-ds.molecule.text-preview").then((module) => ({
    default: module.TextPreview,
  }))
);

const Date = lazy(() =>
  import("@oute/oute-ds.molecule.date").then((module) => ({
    default: module.Date,
  }))
);

const FilePicker = lazy(() =>
  import("@oute/oute-ds.molecule.file-picker").then((module) => ({
    default: module.FilePicker,
  }))
);

const KeyValueTable = lazy(() =>
  import("@src/module/integration-v2/components/questions/KeyValueTable").then(
    (module) => ({
      default: module.KeyValueTable,
    })
  )
);

const AnswerSection = forwardRef(
  (
    {
      question,
      isCreator,
      type,
      answers,
      error,
      isMapActive = false,
      loading = false,
      mode,
      onChange,
      style = {},
      theme,
      value,
      variables,
      viewPort,
      id,
      onRefresh,
      showRefreshButton,
    }: any,
    ref
  ) => {
    const { options = [], placeholder = "", settings = {} } = question;

    if (isMapActive || type === QuestionType.FORMULA_BAR) {
      return (
        <SuspenseComponent>
          <div
            style={{
              marginLeft: "1px",
              width: "100%",
              fontSize: "1rem",
              marginTop: "0.75em",
              ...style,
            }}
          >
            <FormulaBar
              isReadOnly={false}
              type={question?.settings?.valueType || "any"}
              hideInputBorders={false}
              defaultInputContent={value?.response?.blocks}
              onInputContentChanged={(content) => {
                if (isCreator) {
                  onChange("response", { type: "fx", blocks: content });
                } else {
                  onChange({ type: "fx", blocks: content });
                }
              }}
              variables={variables}
              wrapContent
              slotProps={{
                container: {
                  "data-testid": `${id}`,
                  "data-node-type": "fx",
                  style: {
                    background: "#FFF",
                    border: "1px solid rgba(0, 0, 0, 0.20)",
                    minHeight: "5rem",
                    overflow: "auto",
                  },
                },
              }}
            />
          </div>
        </SuspenseComponent>
      );
    }

    return (
      <div
        style={{
          marginLeft: "1px",
          width: "100%",
          marginTop: "0.75em",
          ...style,
        }}
      >
        {type === QuestionType.KEY_VALUE_TABLE ? (
          <SuspenseComponent>
            <KeyValueTable
              value={isCreator ? question?.value : value?.response}
              onChange={(_value, block) => {
                if (isCreator) {
                  onChange(_value, block);
                } else {
                  onChange(_value);
                }
              }}
              variables={variables}
              question={question}
              isCreator={isCreator}
              answers={answers}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.QUESTION_REPEATER ? (
          <SuspenseComponent>
            <QuestionRepeator
              question={question}
              value={isCreator ? value : value?.response}
              onChange={(key, _value) => {
                if (isCreator) {
                  onChange("response", _value);
                } else {
                  onChange(_value);
                }
              }}
              variables={variables}
              answers={answers}
              theme={theme}
              key={"question-repeator"}
            />
          </SuspenseComponent>
        ) : null}
        {type === "DROP_DOWN" ? (
          <SuspenseComponent>
            <Dropdown
              ref={ref}
              disabled={loading}
              value={isCreator ? [] : value?.response}
              options={options}
              onChange={(val, key, options) => {
                if (isCreator) {
                  onChange(key, val);
                } else {
                  onChange(val, options);
                }
              }}
              isCreator={isCreator}
              settings={settings}
              question={question}
              answers={answers}
              dataTestId={id}
              onRefresh={onRefresh}
              showRefreshButton={showRefreshButton}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.YES_NO ? (
          <SuspenseComponent>
            <YesNo
              dataTestId={`${id}`}
              disabled={loading}
              vertical={question?.settings?.vertical}
              value={
                isCreator ? question?.settings?.defaultChoice : value?.response
              }
              onChange={(value, options) => {
                if (isCreator) {
                  onChange("value", value);
                } else {
                  onChange(value, options);
                }
              }}
              question={question}
              error={error}
              isCreator={isCreator}
              optionStyle={{
                height: "2.5em",
                borderRadius: "0.375em",
                padding: "1.25rem 0.5rem",
                display: "flex",
                justifyContent: "center",
                minWidth: "8em",
                width: "8em",
              }}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.TEXT_PREVIEW ? (
          <SuspenseComponent>
            <TextPreview
              dataTestId={`${id}-text-preview`}
              goToTab={() => {}}
              isCreator={isCreator}
              // previewText={question?.previewText}
              // onChange={(_value) => {
              //   if (isCreator) {
              //     onChange("previewText", _value);
              //   }
              // }}
              question={question}
              answers={answers}
              theme={theme}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.FILE_PICKER ? (
          <SuspenseComponent>
            <FilePicker
              ref={ref}
              disabled={loading}
              isCreator={isCreator}
              value={value?.response}
              onChange={(_value) => {
                if (isCreator) {
                  return;
                }
                onChange(_value);
              }}
              settings={question?.settings}
              error={error}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.DATE ? (
          <SuspenseComponent>
            <Date
              ref={ref}
              disabled={loading}
              isCreator={isCreator}
              question={question}
              value={isCreator ? value : value?.response}
              onChange={(_value, options) => {
                if (isCreator) {
                } else {
                  onChange(_value, options);
                }
              }}
              theme={theme}
              error={error}
              dataTestId={`${id}-date`}
            />
          </SuspenseComponent>
        ) : null}
      </div>
    );
  }
);

export default AnswerSection;
