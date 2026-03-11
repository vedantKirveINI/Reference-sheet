import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import classes from "./index.module.css";

import {
  QuestionTab,
  QuestionType,
  SETTINGS_INPUT_NAMES,
  SidebarKey,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import { QuestionCreator } from "@oute/oute-ds.skeleton.question-creator";
import { QuestionSettings } from "../settings-footer";
import {
  useCanvasConfigContext,
  useQuestionContext,
} from "@oute/oute-ds.core.contexts";
import { motion } from "framer-motion";

import CommonDrawer from "../../../common-components/CommonDrawer";
import TabContainer from "../../../common-components/TabContainer";
import { QUESTIONS_NODES } from "../../constants/questionNodes";
import Footer from "../footer";
import { useQuestionModuleTabs } from "../../hooks/useQuestionModuleTabs";
import { ADD_SIDEBAR_COMPONENT } from "../../../../config";
import {
  extractTextContentFromLexicalString,
  getSearchConfigBasedOnQuestionType,
  getTransformedQuetionGoData,
} from "../../utils";
import ComponentRenderer from "../../../common-components/ComponentRenderer";
import { useQuestionAnimation } from "../../hooks/useQuestionAnimation";
import bulb from "../../assets/bulb.svg";

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

  const { tabData, tabsIndexMapping, imagePickerRef, tabRef } =
    useQuestionModuleTabs({
      questionType: question?.type,
      QuestionSettings,
      question,
      onSettingsChange,
      onImageChange,
      onQuestionDataChange,
      setQuestion,
      mode,
      viewPort,
      variables,
      workspaceId,
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

  const onAddNewNodeInQuestion = useCallback(
    (item, selectedQuestionId) => {
      const newQuestionGoData = item?.go_data || {};
      const newQuestionId = crypto.randomUUID();

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
        },
        {
          description: extractedQuestionContent,
          errors: errors,
        },
        true,
        openNodeAfterCreate
      );
    },
    [autoSave, getNodeErrors, question]
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
      },
      { description: extractedQuestionContent, errors: errors },
      true
    );
  }, [autoSave, getNodeErrors, question]);

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
            <div
              ref={scope}
              className={`${classes["responsive-mobile"]} ${
                viewPort === ViewPort.DESKTOP
                  ? classes["responsive-desktop"]
                  : ""
              }`}
            >
              <QuestionCreator goToTab={goToTab} showSidebar={showSidebar} />
              {viewPort === ViewPort.DESKTOP && (
                <span
                  data-testid="question-user-tip"
                  className={classes["user-guide"]}
                >
                  <img className={classes["tip-bulb"]} src={bulb} alt="bulb" />
                  Tip: For the best designing experience, mobile view is
                  recommended.
                </span>
              )}
              <Footer
                mode={mode}
                onModeChange={onModeChange}
                viewPort={viewPort}
                onViewPortChange={onViewPortChange}
                onSave={onNodeSave}
                onDiscard={onDiscard}
              />
            </div>
          </div>
        </motion.div>
      </CommonDrawer>
    );
  }, [
    autoSaveHandler,
    goToTab,
    mode,
    nodeConfigsRef,
    nodeData?.hoverDescription,
    nodeData?.module,
    nodeData?.name,
    nodeData?.type,
    onAddNode,
    onDiscard,
    onModeChange,
    onNodeSave,
    onSidebarActionClick,
    onSidebarToggleHandler,
    onTabChange,
    onUpdateTitle,
    onViewPortChange,
    scope,
    showSidebar,
    sidebarActions,
    tabData,
    tabRef,
    viewPort,
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
