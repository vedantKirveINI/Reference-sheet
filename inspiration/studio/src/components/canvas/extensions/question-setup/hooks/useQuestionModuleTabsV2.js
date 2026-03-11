import { useMemo, useRef } from "react";
import { QuestionTab, QuestionType } from "../../../../../module/constants";
import {
  QuestionWithDataTabs,
  QuestionWithoutSettingsTab,
} from "../constants/question-features";
import { QuestionData } from "../../../../../module";
import { SettingsTab, AppearanceTab, DesignTabContent } from "../components/question-tabs-v2";
import { useQuestionContext } from "../../../../../module/contexts";
import { icons } from "@/components/icons";
import _ from "lodash";

export const useQuestionModuleTabsV2 = ({
  setQuestion,
  question,
  onSettingsChange,
  onImageChange,
  onQuestionDataChange,
  mode,
  viewPort,
  variables,
  workspaceId,
  goToTab,
  showSidebar,
  onModeChange,
  onViewPortChange,
  onSave,
  onDiscard,
  scope,
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
    workspaceId,
    setQuestion,
  ]);

  const getQuestionDataProps = useMemo(() => {
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
      "Appearance": icons.image,
    };
    return iconMap[label];
  };

  const tabData = useMemo(() => {
    const data = [
      {
        id: QuestionTab.DESIGN.toLowerCase(),
        label: _.capitalize(QuestionTab.DESIGN),
        panelComponent: DesignTabContent,
        panelComponentProps: {
          goToTab,
          showSidebar,
          mode,
          onModeChange,
          viewPort,
          onViewPortChange,
          onSave,
          onDiscard,
          scope,
        },
        icon: getTabIcon(QuestionTab.DESIGN),
      },
    ];

    if (hasSettingsTab) {
      data.push({
        id: QuestionTab.SETTINGS.toLowerCase(),
        label: _.capitalize(QuestionTab.SETTINGS),
        panelComponent: SettingsTab,
        panelComponentProps: {
          ...(getQuestionSettingProps || {}),
          viewPort,
        },
        icon: getTabIcon(QuestionTab.SETTINGS),
      });
    }

    if (hasDataTab) {
      data.splice(1, 0, {
        id: QuestionTab.DATA.toLowerCase(),
        label: _.capitalize(QuestionTab.DATA),
        panelComponent: QuestionData,
        panelComponentProps: { ...(getQuestionDataProps || {}) },
        icon: getTabIcon(QuestionTab.DATA),
      });
    }

    data.push({
      id: "appearance",
      label: "Appearance",
      panelComponent: AppearanceTab,
      panelComponentProps: {
        question,
        onChange: onSettingsChange,
        onImageChange,
        mode,
        viewPort,
        workspaceId,
      },
      icon: getTabIcon("Appearance"),
    });

    return data.filter(Boolean);
  }, [
    hasDataTab,
    hasSettingsTab,
    question,
    onSettingsChange,
    onImageChange,
    mode,
    viewPort,
    variables,
    getQuestionSettingProps,
    getQuestionDataProps,
    workspaceId,
    goToTab,
    showSidebar,
    onModeChange,
    onViewPortChange,
    onSave,
    onDiscard,
    scope,
  ]);

  const tabsIndexMapping = {};

  tabData.forEach((tab, index) => {
    if (tab.label) {
      tabsIndexMapping[tab.label] = index;
    }
  });

  return {
    tabData,
    tabsIndexMapping,
    imagePickerRef,
    tabRef,
  };
};
