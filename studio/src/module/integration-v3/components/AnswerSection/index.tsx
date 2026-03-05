import { forwardRef, lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { QuestionType, ViewPort } from "@src/module/constants";
import { Loader2 } from "lucide-react";

const Dropdown = lazy(() =>
  import("../questions/Dropdown/dropdown-v2").then((module) => ({
    default: module.DropdownV2,
  }))
);

const YesNo = lazy(() =>
  import("../questions/YesNo").then((module) => ({
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
  import("../questions/TextPreview").then((module) => ({
    default: module.TextPreview,
  }))
);

const Date = lazy(() =>
  import("@oute/oute-ds.molecule.date").then((module) => ({
    default: module.Date,
  }))
);

const FilePicker = lazy(() =>
  import("../questions/FilePicker").then((module) => ({
    default: module.FilePicker,
  }))
);

const KeyValueTable = lazy(() =>
  import("../questions/KeyValueTable").then((module) => ({
    default: module.KeyValueTable,
  }))
);

const QuestionRepeator = lazy(() =>
  import("../questions/QuestionRepeator").then((module) => ({
    default: module.QuestionRepeator,
  }))
);

interface SuspenseWrapperProps {
  children: React.ReactNode;
}

const SuspenseWrapper = ({ children }: SuspenseWrapperProps) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    }
  >
    {children}
  </Suspense>
);

interface AnswerSectionProps {
  question: any;
  isCreator?: boolean;
  type: string;
  answers?: any;
  error?: string;
  isMapActive?: boolean;
  loading?: boolean;
  mode?: any;
  onChange: (value: any, options?: any) => void;
  style?: React.CSSProperties;
  theme?: any;
  value?: any;
  variables?: any;
  viewPort?: any;
  id: string;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
}

const AnswerSection = forwardRef<any, AnswerSectionProps>(
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
    },
    ref
  ) => {
    const { options = [], placeholder = "", settings = {} } = question || {};

    if (type === QuestionType.FORMULA_BAR) {
      return (
        <SuspenseWrapper>
          <FormulaBar
            isReadOnly={loading}
            type={question?.settings?.valueType || "any"}
            hideInputBorders={false}
            defaultInputContent={value?.response?.blocks}
            onInputContentChanged={(content: any) => {
              if (isCreator) {
                onChange("response", { type: "fx", blocks: content });
              } else {
                onChange({ type: "fx", blocks: content });
              }
            }}
            variables={variables}
            placeholder={placeholder || "Enter value..."}
            inputMode="text"
            allowFormulaExpansion={true}
            slotProps={{
              container: {
                "data-testid": id,
                "data-node-type": "fx",
                style: {
                  background: "#FFF",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: "0.375rem",
                },
              },
            }}
          />
        </SuspenseWrapper>
      );
    }

    if (isMapActive) {
      return (
        <SuspenseWrapper>
          <div className="w-full">
            <FormulaBar
              isReadOnly={false}
              type={question?.settings?.valueType || "any"}
              hideInputBorders={false}
              defaultInputContent={value?.response?.blocks}
              onInputContentChanged={(content: any) => {
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
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: "0.5rem",
                    overflow: "auto",
                  },
                },
              }}
            />
          </div>
        </SuspenseWrapper>
      );
    }

    return (
      <div className="w-full">
        {type === QuestionType.KEY_VALUE_TABLE && (
          <SuspenseWrapper>
            <KeyValueTable
              value={isCreator ? question?.value : value?.response}
              onChange={(_value: any, block: any) => {
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
          </SuspenseWrapper>
        )}

        {type === QuestionType.QUESTION_REPEATER && (
          <SuspenseWrapper>
            <QuestionRepeator
              question={question}
              value={isCreator ? value : value?.response}
              onChange={(key: any, _value: any) => {
                if (isCreator) {
                  onChange("response", _value);
                } else {
                  onChange(_value);
                }
              }}
              variables={variables}
              answers={answers}
              theme={theme}
              key="question-repeator"
            />
          </SuspenseWrapper>
        )}

        {(type === "DROP_DOWN" || type === "DROP_DOWN_STATIC") && (
          <SuspenseWrapper>
            <Dropdown
              ref={ref}
              disabled={loading}
              value={isCreator ? [] : value?.response}
              options={options}
              onChange={(val: any, key: any, options: any) => {
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
          </SuspenseWrapper>
        )}

        {type === QuestionType.YES_NO && (
          <SuspenseWrapper>
            <YesNo
              dataTestId={`${id}`}
              disabled={loading}
              vertical={question?.settings?.vertical}
              value={
                isCreator ? question?.settings?.defaultChoice : value?.response
              }
              onChange={(value: any, options: any) => {
                if (isCreator) {
                  onChange("value", value);
                } else {
                  onChange(value, options);
                }
              }}
              question={question}
              error={error}
              isCreator={isCreator}
            />
          </SuspenseWrapper>
        )}

        {type === QuestionType.TEXT_PREVIEW && (
          <SuspenseWrapper>
            <TextPreview
              dataTestId={`${id}-text-preview`}
              goToTab={() => {}}
              isCreator={isCreator}
              question={question}
              answers={answers}
              theme={theme}
            />
          </SuspenseWrapper>
        )}

        {type === QuestionType.FILE_PICKER && (
          <SuspenseWrapper>
            <FilePicker
              ref={ref}
              disabled={loading}
              isCreator={isCreator}
              value={value?.response}
              onChange={(_value: any) => {
                if (isCreator) {
                  return;
                }
                onChange(_value);
              }}
              settings={question?.settings}
              error={error}
            />
          </SuspenseWrapper>
        )}

        {type === QuestionType.DATE && (
          <SuspenseWrapper>
            <Date
              ref={ref}
              disabled={loading}
              isCreator={isCreator}
              question={question}
              value={isCreator ? value : value?.response}
              onChange={(_value: any, options: any) => {
                if (isCreator) {
                  // Do nothing
                } else {
                  onChange(_value, options);
                }
              }}
              theme={theme}
              error={error}
              dataTestId={`${id}-date`}
            />
          </SuspenseWrapper>
        )}
      </div>
    );
  }
);

AnswerSection.displayName = "AnswerSection";

export default AnswerSection;
