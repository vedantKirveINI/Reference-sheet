import { forwardRef } from "react";
import { QuestionRendererProps } from "../../shared/lib/types";
import { getAnsContainer, getContainerStyles, getQuestionContainer, SCROLLBAR_CLASS } from "./styles";
import "../shared-styles.css";
import { QuestionAugmentor } from "@src/module/question-augmentor";
import { Mode, QuestionType } from "@src/module/constants";
import { QuestionSection } from "../question-section";
import { AnswerSection } from "../answer-section";
import { AnswerInEditMode } from "../answer-in-edit-mode";
import QuotationMarkIcon from "../../assets/icon/quotation-mark";

const mode = Mode.CHAT;

export const ChatView = forwardRef(
  (
    {
      handlers,
      questionData,
      stateConfig,
      uiConfig,
      value,
      autoFocus = false,
      error = "",
      id = "",
      variables = {},
      questionIndex = "",
      nodeConfig = {},
      canvasConfig = {},
    }: QuestionRendererProps,
    ref: any
  ) => {
    const isRequired = questionData?.settings?.required;
    const isAnswering = stateConfig?.isAnswering ?? true;
    const isStripePaymentQuestion =
      questionData?.type === QuestionType.STRIPE_PAYMENT;
    const quotationMark = questionData?.settings?.quotationMark;

    const isCreator = stateConfig?.isCreator;

    return (
      <div
        className={SCROLLBAR_CLASS}
        style={getContainerStyles({
          viewPort: uiConfig.viewPort,
          isCreator,
          isPreviewMode: stateConfig?.isPreviewMode,
        })}
        data-testid={`question_${id}_${mode}`}
        id={id}
      >
        <div
          style={getQuestionContainer({
            viewPort: uiConfig.viewPort,
            isCreator,
          })}
        >
          <QuestionAugmentor
            viewPort={uiConfig.viewPort}
            question={questionData}
            onChange={handlers.onChange}
            isCreator={stateConfig.isCreator}
            goToTab={handlers?.goToTab}
            mode={mode}
            style={{
              padding: 0,
              width: "100%",
              height: "18.5em",
              borderRadius: "1.25em 1.25em 0 0",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1em 1.5em",
              width: "100%",
            }}
          >
            {quotationMark && (
              <QuotationMarkIcon
                fill={uiConfig?.theme?.styles?.questions}
                className="mb-1"
              />
            )}
            <QuestionSection
              questionData={questionData}
              questionIndex={questionIndex}
              editable={stateConfig.isCreator}
              onChange={handlers?.onChange}
              theme={uiConfig?.theme}
              isRequired={isRequired}
              mode={mode}
              variables={variables}
              answers={stateConfig?.answers}
              viewPort={uiConfig?.viewPort}
            />
          </div>
        </div>
        <div
          style={getAnsContainer({
            viewPort: uiConfig?.viewPort,
            isCreator,
            isAnswering: stateConfig?.isAnswering,
          })}
        >
          {isStripePaymentQuestion ? (
            <AnswerSection
              answers={stateConfig?.answers}
              viewPort={uiConfig?.viewPort}
              isCreator={stateConfig?.isCreator}
              onChange={handlers?.onChange}
              questionData={questionData}
              theme={uiConfig?.theme}
              value={value}
              error={error}
              node={nodeConfig?.node}
              mode={mode}
              ref={ref}
              autoFocus={autoFocus}
              variables={variables}
              state={nodeConfig?.state}
              isAnswered={stateConfig?.isAnswered}
              goToTab={handlers?.goToTab}
              isPreviewMode={stateConfig?.isPreviewMode}
              onRestart={handlers?.onRestart}
              onCountryClick={handlers?.onCountryClick}
              workspaceId={canvasConfig?.workspaceId}
              style={{
                display: !isAnswering ? "none" : "flex",
                visibility: !isAnswering ? "hidden" : "visible",
                opacity: !isAnswering ? 0 : 1,
                pointerEvents: !isAnswering ? "none" : "auto",
              }}
            />
          ) : null}

          {isAnswering && !isStripePaymentQuestion && (
            <AnswerSection
              answers={stateConfig?.answers}
              viewPort={uiConfig?.viewPort}
              isCreator={stateConfig?.isCreator}
              onChange={handlers?.onChange}
              questionData={questionData}
              theme={uiConfig?.theme}
              value={value}
              error={error}
              node={nodeConfig?.node}
              mode={mode}
              ref={ref}
              autoFocus={autoFocus}
              variables={variables}
              state={nodeConfig?.state}
              isAnswered={stateConfig?.isAnswered}
              goToTab={handlers?.goToTab}
              isPreviewMode={stateConfig?.isPreviewMode}
              onRestart={handlers?.onRestart}
              onCountryClick={handlers?.onCountryClick}
              workspaceId={canvasConfig?.workspaceId}
            />
          )}

          {!isAnswering && (
            <AnswerInEditMode
              index={questionIndex}
              value={value}
              type={questionData?.type}
              onEdit={stateConfig?.setIsAnswering}
              viewPort={uiConfig?.viewPort}
              theme={uiConfig?.theme}
              questionData={questionData}
            />
          )}
        </div>
      </div>
    );
  }
);
