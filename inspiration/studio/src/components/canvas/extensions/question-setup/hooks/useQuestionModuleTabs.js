import { useEffect, useMemo, useRef } from "react";

import { QuestionTab, QuestionType } from "../../../../../module/constants";
import {
  QuestionWithDataTabs,
  QuestionWithoutSettingsTab,
} from "../constants/question-features";
import { QuestionData } from "../../../../../module";
import { ImagePicker } from "@src/module/image-picker";
import { useQuestionContext } from "../../../../../module/contexts";
import { icons } from "@/components/icons";
import _ from "lodash";

export const useQuestionModuleTabs = ({
  setQuestion,
  QuestionSettings,
  question,
  onSettingsChange,
  onImageChange,
  onQuestionDataChange,
  mode,
  viewPort,
  variables,
  workspaceId,
}) => {
  const {
    activeQuestionIdToShow,
    onNestedQuestionSettingsChange,
    onNestedQuestionDataChange,
  } = useQuestionContext();

  const tabRef = useRef(null);

  const imagePickerRef = useRef(null);

  const getQuestionSettingProps = useMemo(() => {
    const questionSettings = {
      questionType: question?.type,
      question,
      onChange: onSettingsChange,
      mode,
      viewPort,
      variables,
      workspaceId,
      setQuestion,
    };

    if (
      question?.type !== QuestionType.MULTI_QUESTION_PAGE &&
      question?.type !== QuestionType.QUESTION_REPEATER
    )
      return questionSettings;

    const selectedQuestion = question?.questions[activeQuestionIdToShow];
    if (!selectedQuestion) return questionSettings;

    return {
      questionType: selectedQuestion?.type,
      question: selectedQuestion,
      onChange: onNestedQuestionSettingsChange,
      mode,
      viewPort,
      variables,
      isMultiQuestionType: true,
      setQuestion,
    };
  }, [
    question,
    onSettingsChange,
    mode,
    viewPort,
    variables,
    activeQuestionIdToShow,
    onNestedQuestionSettingsChange,
  ]);

  const getQustionDataProps = useMemo(() => {
    const defaultQuestionDataProps = {
      question,
      onChange: onQuestionDataChange,
      mode: mode,
      viewPort: viewPort,
      variables,
    };

    if (
      question?.type !== QuestionType.MULTI_QUESTION_PAGE &&
      question?.type !== QuestionType.QUESTION_REPEATER
    )
      return defaultQuestionDataProps;

    const selectedQuestion = question?.questions[activeQuestionIdToShow];

    if (!selectedQuestion) return defaultQuestionDataProps;

    return {
      ...defaultQuestionDataProps,
      onChange: onNestedQuestionDataChange,
      question: selectedQuestion,
    };
  }, [
    question?.type,
    question?.options,
    question?.settings,
    // question?.settings?.optionsType,
    // question?.settings?.dynamicInputs,
    activeQuestionIdToShow,
    variables,
  ]);

  const hasDataTab = useMemo(() => {
    if (
      (question?.type === QuestionType.MULTI_QUESTION_PAGE ||
        question?.type === QuestionType.QUESTION_REPEATER) &&
      activeQuestionIdToShow
    ) {
      return QuestionWithDataTabs.includes(
        question?.questions[activeQuestionIdToShow]?.type
      );
    }
    return QuestionWithDataTabs.includes(question?.type);
  }, [question?.type, activeQuestionIdToShow]);

  const hasSettingsTab = useMemo(
    () => !QuestionWithoutSettingsTab.includes(question?.type),
    [question?.type]
  );

  const getTabIcon = (label) => {
    const iconMap = {
      [QuestionTab.DESIGN]: icons.palette,
      [QuestionTab.SETTINGS]: icons.settings,
      [QuestionTab.DATA]: icons.database,
      [QuestionTab.IMAGE]: icons.image,
    };
    return iconMap[label];
  };

  const tabData = useMemo(() => {
    const data = [
      {
        label: _.capitalize(QuestionTab.DESIGN),
        panelComponent: () => "",
        icon: getTabIcon(QuestionTab.DESIGN),
      },
      {
        label: _.capitalize(QuestionTab.IMAGE),
        panelComponent: ImagePicker,
        panelComponentProps: {
          ref: imagePickerRef,
          onClose: () => {},
          onChange: onImageChange,
          isLoadingQuestionType: question?.type === QuestionType.LOADING,
          val: {
            url: question?.loadingUrl,
            ...question?.augmentor,
          },
          variables,
          workspaceId,
        },
        icon: getTabIcon(QuestionTab.IMAGE),
      },
    ];

    if (hasSettingsTab) {
      data.splice(1, 0, {
        label: _.capitalize(QuestionTab.SETTINGS),
        panelComponent: QuestionSettings,
        panelComponentProps: { ...(getQuestionSettingProps || {}) },
        icon: getTabIcon(QuestionTab.SETTINGS),
      });
    }

    if (hasDataTab) {
      data.splice(1, 0, {
        label: _.capitalize(QuestionTab.DATA),
        panelComponent: QuestionData,
        panelComponentProps: { ...(getQustionDataProps || {}) },
        icon: getTabIcon(QuestionTab.DATA),
      });
    }

    return data.filter(Boolean);
  }, [
    hasDataTab,
    question,
    onSettingsChange,
    onImageChange,
    onQuestionDataChange,
    mode,
    viewPort,
    variables,
    question,
    getQuestionSettingProps,
    getQustionDataProps,
  ]);

  const tabsIndexMapping = {};

  tabData.forEach((tab, index) => {
    if (tab.label) {
      tabsIndexMapping[tab.label] = index;
    }
  });

  useEffect(() => {
    if (activeQuestionIdToShow) {
      tabRef?.current?.goToTab(tabsIndexMapping[QuestionTab.SETTINGS]);
    }
  }, [activeQuestionIdToShow]);

  return {
    tabData,
    tabsIndexMapping,
    imagePickerRef,
    tabRef,
  };
};
