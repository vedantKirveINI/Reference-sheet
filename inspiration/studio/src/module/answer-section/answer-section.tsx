import { forwardRef, lazy, useState } from "react";
import {
  Mode,
  QuestionTab,
  QuestionType,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import SuspenseComponent from "./components/suspense-component";
import { ODSInfoCard as InfoCard, FormulaBar } from "@src/module/ods";
import { getBoxesPerRowForPicture } from "./utils/helper";

const ShortText = lazy(() =>
  import("@oute/oute-ds.molecule.short-text").then((module) => ({
    default: module.ShortText,
  }))
);

const LongText = lazy(() =>
  import("@oute/oute-ds.molecule.long-text").then((module) => ({
    default: module.LongText,
  }))
);

const PictureCreator = lazy(() =>
  import("@oute/oute-ds.molecule.picture").then((module) => ({
    default: module.PictureCreator,
  }))
);

const PictureFiller = lazy(() =>
  import("@oute/oute-ds.molecule.picture").then((module) => ({
    default: module.PictureFiller,
  }))
);

const CreatorMCQOptionsGroup = lazy(() =>
  import("@oute/oute-ds.molecule.mcq").then((module) => ({
    default: module.CreatorMCQOptionsGroup,
  }))
);

const FillerMCQOptionsGroup = lazy(() =>
  import("@oute/oute-ds.molecule.filler-mcq-options-group").then((module) => ({
    default: module.FillerMCQOptionsGroup,
  }))
);

const PhoneNumber = lazy(() =>
  import("@oute/oute-ds.molecule.phone-number").then((module) => ({
    default: module.PhoneNumber,
  }))
);

const ZipCode = lazy(() =>
  import("@oute/oute-ds.molecule.zip-code").then((module) => ({
    default: module.ZipCode,
  }))
);

const Dropdown = lazy(() =>
  import("@oute/oute-ds.molecule.dropdown").then((module) => ({
    default: module.Dropdown,
  }))
);

const YesNo = lazy(() =>
  import("@oute/oute-ds.molecule.yes-no").then((module) => ({
    default: module.YesNo,
  }))
);

const Ranking = lazy(() =>
  import("@oute/oute-ds.molecule.ranking").then((module) => ({
    default: module.Ranking,
  }))
);

const Connection = lazy(() =>
  import("@oute/oute-ds.molecule.connection").then((module) => ({
    default: module.Connection,
  }))
);

const Email = lazy(() =>
  import("@oute/oute-ds.molecule.email").then((module) => ({
    default: module.Email,
  }))
);


const Ending = lazy(() =>
  import("@oute/oute-ds.molecule.ending").then((module) => ({
    default: module.Ending,
  }))
);

const Date = lazy(() =>
  import("@oute/oute-ds.molecule.date").then((module) => ({
    default: module.Date,
  }))
);

const Currency = lazy(() =>
  import("@oute/oute-ds.molecule.currency").then((module) => ({
    default: module.Currency,
  }))
);

const KeyValueTable = lazy(() =>
  import("@oute/oute-ds.molecule.key-value-table").then((module) => ({
    default: module.KeyValueTable,
  }))
);

const Number = lazy(() =>
  import("@oute/oute-ds.molecule.number").then((module) => ({
    default: module.Number,
  }))
);

const FilePicker = lazy(() =>
  import("@oute/oute-ds.molecule.file-picker").then((module) => ({
    default: module.FilePicker,
  }))
);

const Time = lazy(() =>
  import("@oute/oute-ds.molecule.time").then((module) => ({
    default: module.Time,
  }))
);

const Signature = lazy(() =>
  import("@oute/oute-ds.molecule.signature").then((module) => ({
    default: module.Signature,
  }))
);

const Address = lazy(() =>
  import("@oute/oute-ds.molecule.address").then((module) => ({
    default: module.Address,
  }))
);

const QuestionsGrid = lazy(() =>
  import("@oute/oute-ds.molecule.questions-grid").then((module) => ({
    default: module.QuestionsGrid,
  }))
);

const Autocomplete = lazy(() =>
  import("@oute/oute-ds.molecule.autocomplete").then((module) => ({
    default: module.Autocomplete,
  }))
);

const PdfViewer = lazy(() =>
  import("@oute/oute-ds.molecule.pdf-viewer").then((module) => ({
    default: module.PdfViewer,
  }))
);

const QuestionRepeator = lazy(() =>
  import("@oute/oute-ds.molecule.question-repeater").then((module) => ({
    default: module.QuestionRepeator,
  }))
);

const TextPreview = lazy(() =>
  import("@oute/oute-ds.molecule.text-preview").then((module) => ({
    default: module.TextPreview,
  }))
);

export type AnswerSectionProps = {
  type?: string;
  placeholder?: string;
  question?: any;
  isCreator?: boolean;
  theme?: any;
  node?: any;
  viewPort?: string;
  onChange?: any;
  value?: any;
  error?: string | undefined;
  mode?: Mode;
  ref?: any;
  autoFocus?: boolean;
  variables?: any;
  answers?: any;
  loading?: boolean;
  annotation?: any;
  style?: any;
  state?: any;
  isAnswered?: boolean;
  isPreviewMode?: boolean;
  onRestart?: any;
  goToTab?: (questionTab: string, options?: any) => void;
};

const AnswerSection = forwardRef(
  (
    {
      viewPort,
      type,
      question = {},
      isCreator = true,
      theme,
      value,
      onChange,
      error,
      node,
      mode,
      autoFocus = false,
      variables = {},
      answers = {},
      loading = false,
      style = {},
      state,
      isAnswered = false,
      goToTab = () => {},
      isPreviewMode,
      onRestart = () => {},
    }: AnswerSectionProps,
    ref: any
  ) => {
    const { augmentor, options, placeholder, settings = {} } = question;
    const isAugmentorAvailable = augmentor?.url;
    const [showHelperText, setShowHelperText] = useState(false);

    return (
      <div
        style={{
          marginLeft: "1px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          ...style,
        }}
      >
        {type === "AUTOCOMPLETE" ? (
          <SuspenseComponent>
            <Autocomplete
              isCreator={isCreator}
              value={isCreator ? "" : value?.response}
              onChange={(_value) => {
                if (!isCreator) {
                  onChange(_value);
                }
              }}
              answers={answers}
              settings={question?.settings}
              theme={theme}
              autoFocus={autoFocus}
            />
          </SuspenseComponent>
        ) : null}
        {type === "SHORT_TEXT" ? (
          <SuspenseComponent>
            <ShortText
              disabled={loading}
              isCreator={isCreator}
              maxLength={question?.settings?.maxChar}
              value={isCreator ? value : value?.response}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("placeholder", _value);
                } else {
                  onChange(_value);
                }
              }}
              placeholder={placeholder}
              theme={theme}
              question={question}
              error={error}
              autoFocus={autoFocus}
              answers={answers}
              isAnswered={isAnswered}
              state={state}
              onFocus={() => setShowHelperText(true)}
            />
          </SuspenseComponent>
        ) : null}
        {type === "LONG_TEXT" ? (
          <SuspenseComponent>
            <LongText
              disabled={loading}
              isCreator={isCreator}
              minimumRows={6}
              maxLength={question?.settings?.maxChar}
              value={isCreator ? value : value?.response}
              placeholder={placeholder}
              helperText={true}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("placeholder", _value);
                } else {
                  onChange(_value);
                }
              }}
              theme={theme}
              error={error}
              question={question}
              autoFocus={autoFocus}
              answers={answers}
              state={state}
              onFocus={() => setShowHelperText(true)}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.PICTURE ? (
          isCreator ? (
            <SuspenseComponent>
              <PictureCreator
                // workspaceId={workspaceId}
                onChange={(key, value) => onChange(key, value)}
                theme={theme}
                options={options}
                boxesPerRow={getBoxesPerRowForPicture({
                  viewPort,
                  mode,
                  isAugmentorAvailable,
                  augmentor: question?.augmentor,
                })}
                settings={settings}
              />
            </SuspenseComponent>
          ) : (
            <SuspenseComponent>
              <PictureFiller
                onChange={(value) => onChange(value)}
                theme={theme}
                options={options}
                value={value?.response || []}
                settings={settings}
                boxesPerRow={getBoxesPerRowForPicture({
                  viewPort,
                  mode,
                  isAugmentorAvailable,
                  augmentor: question?.augmentor,
                })}
                isAnswered={isAnswered}
              />
            </SuspenseComponent>
          )
        ) : null}
        {type === QuestionType.MCQ || type === QuestionType.SCQ ? (
          isCreator ? (
            <SuspenseComponent>
              <CreatorMCQOptionsGroup
                key={"creator-mcq-options-group"}
                mode={mode}
                question={question}
                optionArray={options}
                onChange={onChange}
                boxesPerRow={
                  viewPort === ViewPort.MOBILE ||
                  isAugmentorAvailable ||
                  question?.settings?.isAlignmentVertical
                    ? 1
                    : 2
                }
                theme={theme}
                viewPort={viewPort}
              />
            </SuspenseComponent>
          ) : (
            <SuspenseComponent>
              <FillerMCQOptionsGroup
                key={"filler-mcq-options-group"}
                mode={mode}
                question={question}
                optionType={type === "MCQ" ? "Checkbox" : "Radio"}
                options={options}
                value={value?.response || []}
                handleOnChange={(_value, options) => {
                  onChange(_value, options);
                }}
                disabled={loading}
                theme={theme}
                isAnswered={isAnswered}
                viewPort={viewPort}
                boxesPerRow={
                  viewPort === ViewPort.MOBILE ||
                  isAugmentorAvailable ||
                  question?.settings?.isAlignmentVertical
                    ? 1
                    : 2
                }
              />
            </SuspenseComponent>
          )
        ) : null}
        {type === "DROP_DOWN" ? (
          <SuspenseComponent>
            <Dropdown
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
              placeholder={placeholder}
              isCreator={isCreator}
              viewPort={viewPort}
              settings={settings}
              variables={variables}
              question={question}
              goToTab={goToTab}
              answers={answers}
              isInputValid={isCreator ? true : !error}
              isIntegration={false}
              theme={theme}
            />
          </SuspenseComponent>
        ) : null}

        {type === "PHONE_NUMBER" ? (
          <SuspenseComponent>
            <PhoneNumber
              disabled={loading}
              value={
                isCreator ? question?.settings?.defaultCountry : value?.response
              }
              onChange={(_value) => {
                if (isCreator) {
                  onChange("placeholder", _value);
                } else {
                  onChange(_value);
                }
              }}
              placeholder={placeholder}
              settings={question?.settings}
              viewPort={viewPort}
              isInputValid={isCreator ? true : !error}
              ref={ref}
              autoFocus={autoFocus}
              isCreator={isCreator}
              theme={theme}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.ZIP_CODE ? (
          <SuspenseComponent>
            <ZipCode
              disabled={loading}
              isCreator={isCreator}
              value={isCreator ? value : value?.response}
              placeholder={placeholder}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("placeholder", _value);
                } else {
                  onChange(_value);
                }
              }}
              viewPort={viewPort}
              settings={question?.settings}
              theme={theme}
              autoFocus={autoFocus}
              isAnswered={isAnswered}
              onFocus={() => setShowHelperText(true)}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.YES_NO ? (
          <SuspenseComponent>
            <YesNo
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
              mode={mode}
              isCreator={isCreator}
              enableKeyboardShortcuts={!isCreator}
              viewPort={viewPort as ViewPort}
              theme={theme}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.RANKING ? (
          <SuspenseComponent>
            <Ranking
              value={isCreator ? options : value?.response}
              isCreator={isCreator}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("options", _value);
                } else {
                  onChange(_value);
                }
              }}
              options={options}
              question={question}
              mode={mode}
              theme={theme}
              answers={answers}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.EMAIL ? (
          <SuspenseComponent>
            <Email
              ref={ref}
              disabled={loading}
              isCreator={isCreator}
              value={isCreator ? value : value?.response}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("placeholder", _value);
                } else {
                  onChange(_value);
                }
              }}
              question={question}
              placeholder={question?.settings?.placeholder ?? placeholder}
              theme={theme}
              error={error}
              autoFocus={autoFocus}
              answers={answers}
              state={state}
              viewPort={viewPort}
              onFocus={() => setShowHelperText(true)}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.SIGNATURE ? (
          <SuspenseComponent>
            <Signature
              ref={ref}
              isCreator={isCreator}
              value={isCreator ? value : value?.response}
              onChange={(_value) => {
                if (!isCreator) {
                  onChange(_value);
                }
              }}
              question={question}
              theme={theme}
              error={error}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.DATE ? (
          <SuspenseComponent>
            <Date
              disabled={loading}
              isCreator={isCreator}
              value={isCreator ? value : value?.response}
              onChange={(_value, options) => {
                if (isCreator) {
                } else {
                  onChange(_value, options);
                }
              }}
              question={question}
              theme={theme}
              error={error}
              autoFocus={autoFocus}
              viewPort={viewPort}
              mode={mode}
              isAnswered={isAnswered}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.TIME ? (
          <SuspenseComponent>
            <Time
              disabled={loading}
              isCreator={isCreator}
              value={isCreator ? {} : value?.response}
              onChange={(_value) => {
                if (isCreator) {
                } else {
                  onChange(_value);
                }
              }}
              question={question}
              theme={theme}
              error={error}
              autoFocus={autoFocus}
              mode={mode}
              isAnswered={isAnswered}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.CURRENCY ? (
          <SuspenseComponent>
            <Currency
              ref={ref}
              disabled={loading}
              isCreator={isCreator}
              isPreview={isPreviewMode}
              value={isCreator ? value : value?.response}
              placeholder={placeholder}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("placeholder", _value);
                } else {
                  onChange(_value);
                }
              }}
              theme={theme}
              autoFocus={autoFocus}
              settings={question?.settings}
              viewPort={viewPort}
              isAnswered={isAnswered}
              onFocus={() => setShowHelperText(true)}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.NUMBER ? (
          <SuspenseComponent>
            <Number
              ref={ref}
              disabled={loading}
              isCreator={isCreator}
              value={isCreator ? value : value?.response}
              placeholder={placeholder}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("placeholder", _value);
                } else {
                  onChange(_value);
                }
              }}
              theme={theme}
              autoFocus={autoFocus}
              settings={question?.settings}
              answers={answers}
              isAnswered={isAnswered}
              isInputValid={isCreator ? true : !error}
              onFocus={() => setShowHelperText(true)}
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
        {type === QuestionType.PDF_VIEWER ? (
          <SuspenseComponent>
            <PdfViewer
              ref={ref}
              isCreator={isCreator}
              value={question?.value}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("value", _value);
                }
              }}
              variables={variables}
              question={question}
              answers={answers}
              theme={theme}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.TEXT_PREVIEW ? (
          <SuspenseComponent>
            <TextPreview
              isCreator={isCreator}
              previewText={question?.previewText}
              onChange={(_value) => {
                if (isCreator) {
                  onChange("previewText", _value);
                }
              }}
              question={question}
              answers={answers}
              theme={theme}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.ADDRESS ? (
          <SuspenseComponent>
            <Address
              value={isCreator ? value : value?.response}
              onChange={(_value) => {
                onChange(_value);
              }}
              isCreator={isCreator}
              theme={theme}
              settings={question?.settings}
              autoFocus={autoFocus}
              viewPort={viewPort}
              mode={mode}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.CONNECTION ? (
          <SuspenseComponent>
            <Connection
              isCreator={isCreator}
              value={value?.response}
              onChange={(_value) => {
                onChange(_value);
              }}
              disabled={isCreator}
              question={question}
              node={node}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.FORMULA_BAR ? (
          <SuspenseComponent>
            <FormulaBar
              isReadOnly={false}
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
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.KEY_VALUE_TABLE ? (
          <SuspenseComponent>
            <KeyValueTable
              value={isCreator ? question?.value : value?.response}
              onChange={(_value, block) => {
                if (isCreator) {
                  onChange(_value, block);
                  // return;
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
        {/* for form start there is no answer section */}
        {type === QuestionType.WELCOME ? <></> : null}
        {type === QuestionType.ENDING ? (
          <SuspenseComponent>
            <Ending
              onRestart={onRestart}
              isPreviewMode={isPreviewMode}
              isCreator={isCreator}
              theme={theme}
              question={question}
              onChange={onChange}
              focusButtonLabelEditor={() => {
                goToTab(QuestionTab.SETTINGS, { focusCta: true });
              }}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.QUESTIONS_GRID ? (
          <SuspenseComponent>
            <QuestionsGrid
              isCreator={isCreator}
              value={isCreator ? question?.value : value?.response}
              question={question}
              onChange={(changeType, _value) => {
                if (changeType) {
                  onChange(changeType, _value);
                } else {
                  onChange(_value);
                }
              }}
              isAnswered={isAnswered}
              theme={theme}
            />
          </SuspenseComponent>
        ) : null}
        {type === QuestionType.QUESTION_REPEATER ? (
          <SuspenseComponent>
            <QuestionRepeator
              isCreator={isCreator}
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
            />
          </SuspenseComponent>
        ) : null}
        {/* for quote there is no answer section  */}
        {type === QuestionType.QUOTE ? <></> : null}
        {isCreator && showHelperText && (
          <InfoCard
            helperText={
              <div data-testid="answer-section-helper-text">
                {
                  "Over here you can edit the placeholder, which will be displayed in preview and filler mode."
                }
              </div>
            }
            style={{
              marginTop: "0.69em",
              alignSelf: question?.settings?.questionAlignment,
            }}
            onClickAway={() => setShowHelperText(false)}
          />
        )}
      </div>
    );
  }
);

export { AnswerSection };
