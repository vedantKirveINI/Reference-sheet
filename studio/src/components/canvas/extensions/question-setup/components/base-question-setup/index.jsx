import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { generateUUID } from "@/lib/utils";
import classes from "./index.module.css";

import {
  QuestionType,
  SETTINGS_INPUT_NAMES,
  SidebarKey,
} from "@oute/oute-ds.core.constants";
import {
  useCanvasConfigContext,
  useQuestionContext,
} from "@oute/oute-ds.core.contexts";
import { motion } from "framer-motion";

import CommonDrawer from "../../../common-components/CommonDrawer";
import TabContainer from "../../../common-components/TabContainer";
import { QUESTIONS_NODES } from "../../constants/questionNodes";
import { useQuestionModuleTabsV2 } from "../../hooks/useQuestionModuleTabsV2";
import { ADD_SIDEBAR_COMPONENT } from "../../../../config";
import {
  extractTextContentFromLexicalString,
  getSearchConfigBasedOnQuestionType,
  getTransformedQuetionGoData,
} from "../../utils";
import ComponentRenderer from "../../../common-components/ComponentRenderer";
import { useQuestionAnimation } from "../../hooks/useQuestionAnimation";

const BaseQuestionSetup = forwardRef((props, ref) => {
  const {
    nodeData,
    autoSave = () => {},
    onDiscard = () => {},
    onAddNode = () => {},
    sidebarActions = [],
    onSidebarActionClick = () => {},
    onUpdateTitle = () => {},
    onSideBarToggle = () => {},
    workspaceId = "",
    nodeConfigsRef = {},
  } = props;

  const {
    mode,
    viewPort,
    question,
    onSettingsInputToFocusChange,
    onThemeChange,
    onViewPortChange,
    onModeChange,
    onImageChange,
    onSettingsChange,
    onQuestionDataChange,
    onQuestionChange,
    onActiveQuestionIdToShowChange,
    onGoToTabTriggerConfigChange,
    onGoToTabEventFinish,
    setQuestion,
    getNodeErrors,
  } = useQuestionContext();

  const { variables } = useCanvasConfigContext();

  const drawerRef = useRef();
  const goToTabRef = useRef(null);
  const showSidebarRef = useRef(null);

  const { scope, showingPreviewAnimation, hidePreviewAnimation } =
    useQuestionAnimation();

  useImperativeHandle(
    ref,
    () => {
      return {
        refereshTheme: (_theme) => {
          onThemeChange(_theme);
        },
      };
    },
    [onThemeChange]
  );

  const stableGoToTab = useCallback(
    (questionTab, options) => {
      if (goToTabRef.current) {
        goToTabRef.current(questionTab, options);
      }
    },
    []
  );

  const stableShowSidebar = useCallback(
    (sidebarKey, options = {}) => {
      if (showSidebarRef.current) {
        showSidebarRef.current(sidebarKey, options);
      }
    },
    []
  );

  const onNodeSave = useCallback(async () => {
    const { errors, settingsErrors } = getNodeErrors({ initialSave: false });

    const extractedQuestionContent = extractTextContentFromLexicalString(
      question?.question
    );

    const transformedQuestion = getTransformedQuetionGoData({
      question: {
        ...question,
        settings: {
          ...question?.settings,
          errors: {
            ...(question?.settings?.errors || {}),
            ...settingsErrors,
          },
        },
      },
    });

    await autoSave(
      {
        ...(transformedQuestion || {}),
        label: extractedQuestionContent,
        // Preserve hasCustomName flag if it was previously set
        hasCustomName: nodeData?.go_data?.hasCustomName,
      },
      { description: extractedQuestionContent, errors: errors },
      true
    );
  }, [autoSave, getNodeErrors, question, nodeData?.go_data?.hasCustomName]);

  const { tabData, tabsIndexMapping, imagePickerRef, tabRef } =
    useQuestionModuleTabsV2({
      questionType: question?.type,
      question,
      onSettingsChange,
      onImageChange,
      onQuestionDataChange,
      setQuestion,
      mode,
      viewPort,
      variables,
      workspaceId,
      goToTab: stableGoToTab,
      showSidebar: stableShowSidebar,
      onModeChange,
      onViewPortChange,
      onSave: onNodeSave,
      onDiscard,
      scope,
    });

  const goToTab = useCallback(
    (questionTab, options) => {
      if (tabsIndexMapping[questionTab] === undefined) return;

      if (drawerRef.current && drawerRef?.current?.isActionOpen?.()) {
        drawerRef?.current?.closeSidebarPanel();
      }

      if (tabRef.current) {
        tabRef.current.goToTab(tabsIndexMapping[questionTab]);
        if (options?.focusCta)
          onSettingsInputToFocusChange(SETTINGS_INPUT_NAMES.CTA_EDITOR);
        if (options?.openAddImage) {
          onGoToTabTriggerConfigChange(options);
        }
        if (options?.openImageToolbar) {
          setTimeout(() => {
            imagePickerRef?.current?.openImageToolbar();
          }, 0);
        }
        if (options?.closeImageToolbar) {
          setTimeout(() => {
            imagePickerRef?.current?.closeImageToolbar();
          }, 0);
        }
      }
    },
    [
      imagePickerRef,
      onGoToTabTriggerConfigChange,
      onSettingsInputToFocusChange,
      tabRef,
      tabsIndexMapping,
    ]
  );

  goToTabRef.current = goToTab;

  const onAddNewNodeInQuestion = useCallback(
    (item, selectedQuestionId) => {
      const newQuestionGoData = item?.go_data || {};
      const newQuestionId = generateUUID();

      const prevQuestions = question?.questions || {};

      const updatedQuestions = { ...prevQuestions };
      // If a selected question exists, find its position
      if (selectedQuestionId && updatedQuestions[selectedQuestionId]) {
        // Create an array of question IDs to manipulate order
        const questionIds = Object.keys(updatedQuestions);
        const selectedIndex = questionIds.indexOf(selectedQuestionId);

        const reorderedQuestions = {};
        for (let i = 0; i < questionIds.length; i++) {
          const id = questionIds[i];
          reorderedQuestions[id] = updatedQuestions[id];
          if (selectedIndex === i) {
            reorderedQuestions[newQuestionId] = {
              ...newQuestionGoData,
              _id: newQuestionId,
              id: newQuestionId,
            };
          }
        }

        onQuestionChange({ ...question, ["questions"]: reorderedQuestions });
      }

      if (drawerRef.current) {
        drawerRef.current?.closeSidebarPanel();
      }

      onActiveQuestionIdToShowChange(newQuestionId);
      // goToTab(QuestionTab.SETTINGS);
      return;
    },
    [onActiveQuestionIdToShowChange, onQuestionChange, question]
  );

  const showSidebar = useCallback(
    (sidebarKey, options = {}) => {
      if (drawerRef.current) {
        if (sidebarKey === SidebarKey.NESTED_QUESTION_ADD_NODE) {
          const selectedQuestionId = options?.selectedQuestionId;
          const actionToShow = {
            id: sidebarKey,
            name: "Add Node",
            panel: (
              <ComponentRenderer
                component={ADD_SIDEBAR_COMPONENT.component}
                {...{
                  tabData: getSearchConfigBasedOnQuestionType(question?.type),
                  onClick: (item) =>
                    onAddNewNodeInQuestion(item, selectedQuestionId),
                }}
              />
            ),
          };
          drawerRef.current.openSidebarPanel(actionToShow);
        }
      }
    },
    [onAddNewNodeInQuestion, question?.type]
  );

  showSidebarRef.current = showSidebar;

  const onTabChange = useCallback(
    (index) => {
      if (index === 0) {
        hidePreviewAnimation();
      } else {
        showingPreviewAnimation();
      }

      onSettingsInputToFocusChange(null);
      onGoToTabEventFinish();
    },
    [
      hidePreviewAnimation,
      onSettingsInputToFocusChange,
      showingPreviewAnimation,
      onGoToTabEventFinish,
    ]
  );

  const onSidebarToggleHandler = useCallback(
    (open, id) => {
      const shouldShowPreviewAnimation =
        (open && id === SidebarKey.THEME_MANAGER) ||
        (open &&
          id === SidebarKey.NESTED_QUESTION_ADD_NODE &&
          question?.type === QuestionType.MULTI_QUESTION_PAGE);

      if (shouldShowPreviewAnimation) {
        showingPreviewAnimation();
        return;
      }

      if (tabRef.current) {
        const activeTabIndex = tabRef.current.getActiveTabIndex();
        tabRef.current.goToTab(activeTabIndex);
      }

      onSideBarToggle?.(open, id);
    },
    [onSideBarToggle, question?.type, showingPreviewAnimation, tabRef]
  );
  const autoSaveHandler = useCallback(
    async (openNodeAfterCreate = false, initialSave = false) => {
      const { errors = [], settingsErrors = {} } = getNodeErrors({
        initialSave,
      });
      const extractedQuestionContent = extractTextContentFromLexicalString(
        question?.question
      );
      const transformedQuestion = getTransformedQuetionGoData({
        question: {
          ...question,
          settings: {
            ...question?.settings,
            errors: {
              ...(question?.settings?.errors || {}),
              ...settingsErrors,
            },
          },
        },
      });

      await autoSave(
        {
          ...(transformedQuestion || {}),
          label: extractedQuestionContent,
          // Preserve hasCustomName flag if it was previously set
          hasCustomName: nodeData?.go_data?.hasCustomName,
        },
        {
          description: extractedQuestionContent,
          errors: errors,
        },
        true,
        openNodeAfterCreate
      );
    },
    [autoSave, getNodeErrors, question, nodeData?.go_data?.hasCustomName]
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        refereshTheme: (_theme) => {
          onThemeChange(_theme);
        },
        saveNode: autoSaveHandler,
      };
    },
    [autoSaveHandler, onThemeChange]
  );

  const MemorizedDrawer = useMemo(() => {
    return (
      <CommonDrawer
        ref={drawerRef}
        allowContentOverflow={true}
        onClose={async (e) => {
          onDiscard(e);
          autoSaveHandler();
          nodeConfigsRef.current.showDefaultTheme = false;
        }}
        onSave={autoSaveHandler}
        title={{
          nodeModule: nodeData?.module,
          nodeType: nodeData?.type,
          name: nodeData?.name,
          icon: QUESTIONS_NODES[nodeData?.type]?._src,
          foreground: "#fff",
          background:
            "linear-gradient(213deg, #FD5D2D 8.86%, #FB6A2B 27.97%, #F58024 44.96%, #F2901D 60.3%, #F09A19 94.4%)",
          dark: "#FD5D2D",
          light: "#F09A19",
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={QUESTIONS_NODES[nodeData?.type]}
        // saveOnClose={true}
        // onSave={async () => {
        //   let questionTemp = stringHelpers.removeTagsFromString(
        //     question?.question
        //   );
        //   const errors = Object.values(question?.settings?.errors || {}).filter(
        //     (error) => error.trim() !== ""
        //   );
        //   await autoSave(
        //     question,
        //     { description: questionTemp, errors: errors },
        //     true
        //   );
        // }}
        onSidebarToggle={onSidebarToggleHandler}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <motion.div
          key="mainContent"
          className={`${classes["question-node-container"]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeIn", delay: 0.2 }}
        >
          <div className={classes["question-tabs-panel-container"]}>
            <TabContainer
              ref={tabRef}
              tabs={tabData || []}
              colorPalette={{
                foreground: "#fff",
                dark: "#FD5D2D",
                light: "#F09A19",
              }}
              onTabSwitch={(index) => onTabChange(index)}
            />
          </div>
        </motion.div>
      </CommonDrawer>
    );
  }, [
    autoSaveHandler,
    nodeConfigsRef,
    nodeData?.hoverDescription,
    nodeData?.module,
    nodeData?.name,
    nodeData?.type,
    onAddNode,
    onDiscard,
    onSidebarActionClick,
    onSidebarToggleHandler,
    onTabChange,
    onUpdateTitle,
    sidebarActions,
    tabData,
    tabRef,
  ]);

  useEffect(() => {
    if (nodeConfigsRef?.current?.showDefaultTheme) {
      const timeOut = setTimeout(() => {
        drawerRef?.current?.clickAction("theme-manager");
      }, 100);

      return () => {
        clearTimeout(timeOut);
        nodeConfigsRef.current.showDefaultTheme = false;
      };
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!nodeData?.go_data?.last_updated) {
      setTimeout(() => {
        autoSaveHandler(true, true);
      }, 100);
    }
  }, [autoSaveHandler, nodeData?.go_data?.last_updated]);

  return MemorizedDrawer;
});

export default BaseQuestionSetup;
