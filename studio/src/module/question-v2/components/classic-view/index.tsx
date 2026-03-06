import React, { forwardRef, useEffect } from "react";
import { QuestionRendererProps } from "../../shared/lib/types";
import { getAnsContainer, getAugmentorStyle, getContainerStyles, getErroStyle, getQuestionSectionContainerStyles, SCROLLBAR_CLASS } from "./styles";
import "../shared-styles.css";
import QuotationMarkIcon from "../../assets/icon/quotation-mark";
import { Mode, QuestionType, SidebarKey, ViewPort,  } from "@oute/oute-ds.core.constants";
import { LoadingSourceUploader } from "../loading-source-uploader";
import { QuestionSection } from "../question-section";
import { MultiQuestionPage } from "../multi-question-page";
import { AnswerSection } from "../answer-section";
import { ODSError as Error } from "@src/module/ods";
import { QuestionAugmentor } from "@oute/oute-ds.skeleton.question-augmentor";

export const ClassicView = forwardRef(
  (
    {
      handlers,
      questionData,
      stateConfig,
      uiConfig,
      value,
      autoFocus,
      error,
      id,
      loading,
      nodeConfig,
      questionIndex,
      variables,
      canvasConfig = {},
    }: QuestionRendererProps,
    ref: any
  ) => {
    const augmentorAlignment = questionData?.augmentor?.alignment;
    const isAugmentorAvailable = !!questionData?.augmentor?.url;
    const isError = Boolean(error);
    const isRequired = questionData?.settings?.required;
    const questionAlignment = questionData?.settings?.questionAlignment;

    const quotationMark = questionData?.settings?.quotationMark;

    useEffect(() => {
      if (handlers?.onMount) {
        handlers.onMount();
      }
    }, []);

    return (
      <div
        style={getContainerStyles({
          viewPort: uiConfig.viewPort,
          isAugmentorAvailable,
          augmentorAlignment,
          isCreator: stateConfig.isCreator,
        })}
        id={id}
        data-testid={`question_${id}_classic`}
      >
        <div
          className={SCROLLBAR_CLASS}
          style={getQuestionSectionContainerStyles({
            isAugmentorAvailable,
            viewPort: uiConfig.viewPort,
            type: questionData?.type,
            mode: uiConfig.mode,
            isCreator: stateConfig.isCreator,
            questionAlignment,
          })}
          id="question-section"
        >
          {quotationMark && (
            <QuotationMarkIcon fill={uiConfig?.theme?.styles?.questions} />
          )}
          {questionData?.type === QuestionType.LOADING &&
            questionData?.loadingUrl && (
              <LoadingSourceUploader
                isCreator={stateConfig?.isCreator}
                image={questionData?.loadingUrl}
                goToTab={handlers?.goToTab}
              />
            )}
          <QuestionSection
            questionData={questionData}
            questionIndex={questionIndex}
            editable={stateConfig?.isCreator}
            onChange={handlers?.onChange}
            theme={uiConfig?.theme}
            isRequired={isRequired}
            questionAlignment={questionAlignment}
            mode={Mode.CLASSIC}
            variables={variables}
            answers={stateConfig?.answers}
            viewPort={uiConfig.viewPort}
            style={{
              width:
                isAugmentorAvailable || uiConfig?.viewPort === ViewPort.MOBILE
                  ? "100%"
                  : "70%",
            }}
            onFocus={handlers?.onQuestionEditorFocus}
            hideQuestionIndex={stateConfig?.hideQuestionIndex}
          />
          {questionData?.type === QuestionType.MULTI_QUESTION_PAGE ? (
            <MultiQuestionPage
              question={questionData}
              mode={Mode.CARD}
              viewPort={uiConfig?.viewPort}
              onChange={handlers?.onChange}
              theme={uiConfig?.theme}
              isCreator={stateConfig?.isCreator}
              variables={variables}
              answers={stateConfig?.answers}
              node={nodeConfig?.node}
              state={nodeConfig?.state}
              onAddQuestionClick={(selectedQuestionId: string) => {
                handlers?.showSidebar(SidebarKey.MULTI_QUESTION_ADD_NODE, {
                  selectedQuestionId,
                });
              }}
              onQuestionSelect={handlers?.onSubQuestionSelect}
              selectedQuestionId={stateConfig?.selectedSubQuestionId}
              value={value?.response || {}}
            />
          ) : (
            <AnswerSection
              loading={loading}
              viewPort={uiConfig?.viewPort}
              isCreator={stateConfig?.isCreator}
              questionData={questionData}
              theme={uiConfig?.theme}
              value={value}
              onChange={handlers?.onChange}
              error={error}
              mode={Mode.CLASSIC}
              ref={ref}
              autoFocus={autoFocus}
              variables={variables}
              answers={stateConfig?.answers}
              annotation={stateConfig?.annotation}
              node={nodeConfig?.node}
              style={getAnsContainer({
                isAugmentorAvailable,
                viewPort: uiConfig?.viewPort,
                augmentorAlignment,
                mode: uiConfig.mode,
              })}
              state={nodeConfig?.state}
              goToTab={handlers?.goToTab}
              isPreviewMode={stateConfig?.isPreviewMode}
              onRestart={handlers?.onRestart}
              onCountryClick={handlers?.onCountryClick}
              workspaceId={canvasConfig?.workspaceId}
              isAnswered={stateConfig?.isAnswered}
            />
          )}
          {/* Error outside when its classic mode */}
          {isError && <Error text={error} style={getErroStyle()} />}
        </div>
        <QuestionAugmentor
          viewPort={uiConfig?.viewPort}
          mode={Mode.CLASSIC}
          question={questionData}
          onChange={handlers?.onChange}
          isCreator={stateConfig?.isCreator}
          style={getAugmentorStyle({ viewPort: uiConfig?.viewPort })}
        />
      </div>
    );
  }
);
