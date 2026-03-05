import { forwardRef, useEffect } from "react";

import { getContainerStyles, getQuestionSectionContainerStyles, getAnsContainer, getCTAContainer, getErroStyle, getAugmentorStyle, SCROLLBAR_CLASS } from "./styles";
import "../shared-styles.css";
import { shouldRenderCTA } from "../../utils";
import QuotationMarkIcon from "../../assets/icon/quotation-mark";
import { LoadingSourceUploader } from "../loading-source-uploader";
import { QuestionRendererProps } from "../../shared/lib/types";
import { CTASection } from "../cta-section";
import { AnswerSection } from "../answer-section";
import { QuestionSection } from "../question-section";

import { QuestionAugmentor } from "@oute/oute-ds.skeleton.question-augmentor";
import { Mode, QuestionType, SidebarKey, ViewPort,  } from "@oute/oute-ds.core.constants";
import { ODSError as Error } from "@src/module/ods";
import { MultiQuestionPage } from "../multi-question-page";
import { CreatorQuestionRepeator } from "../creator-question-repeator";
import { RetryStatus } from "../retry-status";

export const CardView = forwardRef(
  (
    {
      questionData,
      error = "",
      handlers,
      uiConfig,
      stateConfig,
      id = "",
      variables,
      questionIndex = "",
      value = "",
      nodeConfig,
      loading = false,
      autoFocus = false,
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

    const renderCTA = shouldRenderCTA({
      mode: Mode.CARD,
      isError,
      questionType: questionData?.type,
    });

    useEffect(() => {
      if (handlers?.onMount) {
        handlers?.onMount();
      }
    }, []);

    return (
      <div
        style={getContainerStyles({
          viewPort: uiConfig.viewPort,
          isAugmentorAvailable,
          augmentorAlignment,
          isCreator: stateConfig.isCreator,
          questionAlignment,
        })}
        id={id}
        data-alignment={questionAlignment}
        data-testid={`question-root-container`}
      >
        <div
          className={SCROLLBAR_CLASS}
          style={getQuestionSectionContainerStyles({
            isAugmentorAvailable,
            viewPort: uiConfig.viewPort,
            questionAlignment,
            isCreator: stateConfig.isCreator,
            augmentorAlignment,
            showHelp: stateConfig?.showHelp,
          })}
          id="question-section"
        >
          {quotationMark && (
            <QuotationMarkIcon fill={uiConfig?.theme?.styles?.questions} />
          )}
          {questionData?.type === QuestionType.LOADING &&
            questionData?.loadingUrl && (
              <LoadingSourceUploader
                isCreator={stateConfig.isCreator}
                image={questionData?.loadingUrl}
                goToTab={handlers?.goToTab}
              />
            )}
          <QuestionSection
            questionData={questionData}
            questionIndex={questionIndex}
            editable={stateConfig.isCreator}
            onChange={handlers.onChange}
            theme={uiConfig.theme}
            isRequired={isRequired}
            questionAlignment={questionAlignment}
            mode={Mode.CARD}
            variables={variables}
            answers={stateConfig?.answers || {}}
            viewPort={uiConfig.viewPort}
            style={{
              width:
                isAugmentorAvailable || uiConfig.viewPort === ViewPort.MOBILE
                  ? "100%"
                  : "70%",
            }}
            onFocus={handlers.onQuestionEditorFocus}
          />

          {questionData?.type === QuestionType.MULTI_QUESTION_PAGE ? (
            <MultiQuestionPage
              question={questionData}
              mode={Mode.CARD}
              viewPort={uiConfig.viewPort}
              onChange={handlers?.onChange}
              theme={uiConfig.theme}
              isCreator={stateConfig.isCreator}
              variables={variables}
              answers={stateConfig?.answers}
              node={nodeConfig?.node}
              state={nodeConfig?.state}
              onAddQuestionClick={(selectedQuestionId: string) => {
                handlers?.showSidebar(SidebarKey.NESTED_QUESTION_ADD_NODE, {
                  selectedQuestionId,
                });
              }}
              onQuestionSelect={handlers?.onSubQuestionSelect}
              selectedQuestionId={stateConfig?.selectedSubQuestionId || ""}
              value={value?.response || {}}
            />
          ) : questionData?.type === QuestionType.QUESTION_REPEATER ? (
            <CreatorQuestionRepeator
              mode={uiConfig.mode}
              viewPort={uiConfig.viewPort}
              isCreator={stateConfig.isCreator}
              onChange={handlers.onChange}
              theme={uiConfig?.theme}
              variables={variables}
              state={nodeConfig?.state}
              answers={stateConfig?.answers}
              question={questionData}
              node={nodeConfig?.node}
              onAddQuestionClick={(selectedQuestionId: string) => {
                handlers?.showSidebar(SidebarKey.NESTED_QUESTION_ADD_NODE, {
                  selectedQuestionId,
                });
              }}
              onQuestionSelect={handlers?.onSubQuestionSelect}
              selectedQuestionId={stateConfig?.selectedSubQuestionId || ""}
              value={value?.response || {}}
            />
          ) : (
            <AnswerSection
              isCreator={stateConfig.isCreator}
              mode={uiConfig.mode}
              viewPort={uiConfig.viewPort}
              onChange={handlers.onChange}
              theme={uiConfig?.theme}
              questionData={questionData}
              value={value}
              annotation={stateConfig?.annotation}
              answers={stateConfig?.answers}
              autoFocus={autoFocus}
              error={error}
              goToTab={handlers?.goToTab}
              isAnswered={stateConfig?.isAnswered}
              node={nodeConfig?.node}
              state={nodeConfig?.state}
              variables={variables}
              isPreviewMode={stateConfig?.isPreviewMode}
              loading={loading}
              onRestart={handlers?.onRestart}
              ref={ref}
              style={getAnsContainer({
                isAugmentorAvailable,
                viewPort: uiConfig?.viewPort,
                augmentorAlignment,
                showHelp: stateConfig?.showHelp,
              })}
              onCountryClick={handlers?.onCountryClick}
              workspaceId={canvasConfig?.workspaceId}
            />
          )}
          {/* Error outside when its classic mode */}
          {isError && <Error text={error} style={getErroStyle()} />}
          {/* Error inside button when its card mode */}
          {renderCTA && (
            <div style={getCTAContainer({ showHelp: stateConfig?.showHelp })}>
              <CTASection
                content={questionData?.buttonLabel || ""}
                editable={stateConfig.isCreator}
                questionData={questionData}
                theme={uiConfig.theme}
                loading={loading}
                onClick={(props) => {
                  if (stateConfig.isCreator) {
                    handlers?.onCTAClick?.();
                  } else {
                    handlers?.onSubmit(props);
                  }
                }}
              />
            </div>
          )}

          {stateConfig.isRetrying && (
            <RetryStatus
              isRetrying={stateConfig.isRetrying}
              theme={uiConfig.theme}
              style={{
                marginTop: "1.25em",
              }}
              questionAlignment={questionAlignment}
            />
          )}
        </div>
        <QuestionAugmentor
          viewPort={uiConfig.viewPort}
          mode={Mode.CARD}
          question={questionData}
          onChange={handlers?.onChange}
          goToTab={handlers?.goToTab}
          isCreator={stateConfig.isCreator}
          style={getAugmentorStyle({ viewPort: uiConfig?.viewPort })}
          answers={stateConfig?.answers}
        />
      </div>
    );
  }
);
