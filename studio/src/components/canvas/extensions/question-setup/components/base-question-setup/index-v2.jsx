import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { generateUUID } from "@/lib/utils";
import classes from "./index.module.css";

import {
  QuestionTab,
  QuestionType,
  SETTINGS_INPUT_NAMES,
  SidebarKey,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import { QuestionCreator } from "@src/module/question-creator";
import {
  useCanvasConfigContext,
  useQuestionContext,
} from "@oute/oute-ds.core.contexts";
import { motion } from "framer-motion";
import { Palette, Settings, Image, Database, Asterisk, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

import WizardDrawer from "../../../../../../module/drawer/WizardDrawer";
import { QUESTIONS_NODES } from "../../constants/questionNodes";
import { getQuestionCategoryColor } from "../../constants/questionCategoryColors";
import { getQuestionTypeLabel } from "../../constants/questionTypeLabels";
import Footer from "../footer";
import { useQuestionModuleTabsV2 } from "../../hooks/useQuestionModuleTabsV2";
import { ADD_SIDEBAR_COMPONENT } from "../../../../config";
import {
  extractTextContentFromLexicalString,
  getSearchConfigBasedOnQuestionType,
  getTransformedQuetionGoData,
} from "../../utils";
import ComponentRenderer from "../../../common-components/ComponentRenderer";
import { useQuestionAnimation } from "../../hooks/useQuestionAnimation";
import bulb from "../../assets/bulb.svg";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const BaseQuestionSetupV2 = forwardRef((props, ref) => {
  const {
    nodeData,
    autoSave = () => {},
    onDiscard = () => {},
    onAddNode = () => {},
    sidebarActions = [],
    onSidebarActionClick = () => {},
    onUpdateTitle = () => {},
    onSideBarToggle = () => {},
    workspaceId: propsWorkspaceId = "",
    nodeConfigsRef = {},
  } = props;

  // Use workspaceId from props (ic-canvas), fallback to node/asset workspace_id so ImageSection upload can save to gallery
  const workspaceId = propsWorkspaceId || nodeData?.workspace_id || "";

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
  const scrollViewportRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState(null);
  const [sidebarTitle, setSidebarTitle] = useState("");
  const [activeSidebarId, setActiveSidebarId] = useState(null);
  const [activeTab, setActiveTab] = useState("design");
  const [lastTabTriggerOptions, setLastTabTriggerOptions] = useState({});

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
    });

  const pendingGoToTabQueue = useRef([]);

  const switchToTab = useCallback(
    (tabId, options = {}) => {
      setSidebarOpen(false);
      setActiveTab(tabId);
      setLastTabTriggerOptions(options || {});
      if (options?.highlightDataSource) {
        setTimeout(() => setLastTabTriggerOptions({}), 400);
      }

      if (tabId === "design") {
        hidePreviewAnimation();
      } else {
        showingPreviewAnimation();
      }

      if (options?.focusCta) {
        onSettingsInputToFocusChange(SETTINGS_INPUT_NAMES.CTA_EDITOR);
      } else {
        onSettingsInputToFocusChange(null);
      }
      
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
      
      onGoToTabEventFinish();
    },
    [
      imagePickerRef,
      onGoToTabTriggerConfigChange,
      onSettingsInputToFocusChange,
      onGoToTabEventFinish,
      hidePreviewAnimation,
      showingPreviewAnimation,
    ]
  );

  const goToTab = useCallback(
    (questionTab, options) => {
      const normalizedTabId = questionTab.toLowerCase();
      
      if (!tabData || tabData.length === 0) {
        pendingGoToTabQueue.current.push({ tabId: normalizedTabId, options });
        return;
      }
      
      let matchingTab = null;
      if (tabsIndexMapping[questionTab] !== undefined) {
        matchingTab = tabData[tabsIndexMapping[questionTab]];
      } else {
        matchingTab = tabData.find((tab) => tab.id === normalizedTabId);
      }
      
      if (!matchingTab) return;

      switchToTab(matchingTab.id, options);
    },
    [tabData, tabsIndexMapping, switchToTab]
  );

  useEffect(() => {
    if (tabData && tabData.length > 0 && pendingGoToTabQueue.current.length > 0) {
      const queue = [...pendingGoToTabQueue.current];
      pendingGoToTabQueue.current = [];
      
      queue.forEach(({ tabId, options }) => {
        const matchingTab = tabData.find((tab) => tab.id === tabId);
        if (matchingTab) {
          switchToTab(matchingTab.id, options);
        }
      });
    }
  }, [tabData, switchToTab]);

  // When Settings opens, scroll drawer to top only if we are NOT highlighting Data Source
  // (Add Choice → Settings: DropdownSettings uses scrollIntoView so we skip scrolling here)
  useEffect(() => {
    if (activeTab !== "settings") return;
    if (lastTabTriggerOptions?.highlightDataSource) return;
    const scrollToTop = () => {
      const el = scrollViewportRef.current;
      if (el && typeof el.scrollTo === "function") {
        el.scrollTo({ top: 0, behavior: "auto" });
      } else if (el && "scrollTop" in el) {
        el.scrollTop = 0;
      }
    };
    scrollToTop();
    const t1 = setTimeout(scrollToTop, 200);
    const t2 = setTimeout(scrollToTop, 500);
    const t3 = setTimeout(scrollToTop, 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeTab]);

  const onAddNewNodeInQuestion = useCallback(
    (item, selectedQuestionId) => {
      const newQuestionGoData = item?.go_data || {};
      const newQuestionId = generateUUID();

      const prevQuestions = question?.questions || {};

      const updatedQuestions = { ...prevQuestions };
      if (selectedQuestionId && updatedQuestions[selectedQuestionId]) {
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

      setSidebarOpen(false);
      onActiveQuestionIdToShowChange(newQuestionId);
      return;
    },
    [onActiveQuestionIdToShowChange, onQuestionChange, question]
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

      if (activeTab === "design") {
        hidePreviewAnimation();
      }

      onSideBarToggle?.(open, id);
    },
    [onSideBarToggle, question?.type, showingPreviewAnimation, activeTab, hidePreviewAnimation]
  );

  const showSidebar = useCallback(
    (sidebarKey, options = {}) => {
      setActiveSidebarId(sidebarKey);

      if (sidebarKey === SidebarKey.NESTED_QUESTION_ADD_NODE) {
        const selectedQuestionId = options?.selectedQuestionId;
        setSidebarTitle("Add Node");
        setSidebarContent(
          <ComponentRenderer
            component={ADD_SIDEBAR_COMPONENT.component}
            {...{
              tabData: getSearchConfigBasedOnQuestionType(question?.type),
              onClick: (item) =>
                onAddNewNodeInQuestion(item, selectedQuestionId),
            }}
          />
        );
        setSidebarOpen(true);
        onSidebarToggleHandler(true, sidebarKey);
      } else if (sidebarKey === SidebarKey.THEME_MANAGER) {
        const themeAction = sidebarActions.find(a => a.id === "theme-manager" || a.id === SidebarKey.THEME_MANAGER);
        if (themeAction) {
          setSidebarTitle(themeAction.name || "Theme Manager");
          setSidebarContent(themeAction.panel);
          setSidebarOpen(true);
          onSidebarToggleHandler(true, sidebarKey);
        }
      } else {
        const action = sidebarActions.find(a => a.id === sidebarKey);
        if (action) {
          setSidebarTitle(action.name || "Panel");
          setSidebarContent(action.panel);
          setSidebarOpen(true);
          onSidebarToggleHandler(true, sidebarKey);
        }
      }
    },
    [onAddNewNodeInQuestion, question?.type, sidebarActions, onSidebarToggleHandler]
  );

  const handleSidebarClose = useCallback((open) => {
    setSidebarOpen(open);
    if (!open) {
      onSidebarToggleHandler(false, activeSidebarId);
      setActiveSidebarId(null);
    }
  }, [activeSidebarId, onSidebarToggleHandler]);

  const handleSidebarActionClick = useCallback((action) => {
    onSidebarActionClick(action);
    if (action.panel) {
      setActiveSidebarId(action.id);
      setSidebarTitle(action.name || "Panel");
      setSidebarContent(action.panel);
      setSidebarOpen(true);
      onSidebarToggleHandler(true, action.id);
    }
  }, [onSidebarActionClick, onSidebarToggleHandler]);

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

  const handleClose = useCallback(
    async (e) => {
      onDiscard(e);
      autoSaveHandler();
      nodeConfigsRef.current.showDefaultTheme = false;
    },
    [onDiscard, autoSaveHandler, nodeConfigsRef]
  );

  const handleTitleChange = useCallback(
    (newTitle) => {
      // Legacy-aligned: pass only name (and hoverDescription if present) to onUpdateTitle
      const titleToSave =
        typeof newTitle === "string"
          ? { name: newTitle }
          : { name: newTitle?.name, hoverDescription: newTitle?.hoverDescription };
      onUpdateTitle(titleToSave);
    },
    [onUpdateTitle]
  );

  // Legacy-aligned drawer title: use only nodeData.name, never question content
  const typeLabel = getQuestionTypeLabel(nodeData?.type);
  const drawerTitle = nodeData?.name || typeLabel;
  const drawerSubtitle =
    nodeData?.name && nodeData.name.trim() !== typeLabel ? typeLabel : "";

  const questionProperties = useMemo(() => {
    const properties = [];
    const settings = question?.settings || {};
    
    if (settings.required) {
      properties.push({
        label: "Required",
        icon: Asterisk,
        color: "rgba(239, 68, 68, 0.1)",
        textColor: "#dc2626",
      });
    }
    
    if (settings.hidden) {
      properties.push({
        label: "Hidden",
        icon: EyeOff,
        color: "rgba(0, 0, 0, 0.04)",
        textColor: "#52525b",
      });
    }
    
    return properties;
  }, [question?.settings]);

  const categoryColors = useMemo(() => {
    return getQuestionCategoryColor(question?.type);
  }, [question?.type]);

  const questionTheme = useMemo(() => ({
    headerBg: "#ffffff",
    headerBorder: "rgba(0, 0, 0, 0.08)",
    activeTabBg: "#18181b",
    activeTabText: "#ffffff",
    inactiveTabText: "#71717a",
    tabContainerBg: "rgba(0, 0, 0, 0.04)",
    primaryButtonBg: "#18181b",
    primaryButtonText: "#ffffff",
    iconBg: categoryColors.light,
    iconBorder: `${categoryColors.primary}30`,
    iconColor: categoryColors.primary,
  }), [categoryColors]);

  const wizardTabs = useMemo(() => {
    return tabData.map((tab) => ({
      id: tab.id,
      label: tab.label,
      icon: tab.id === "design" ? Palette : 
            tab.id === "settings" ? Settings : 
            tab.id === "appearance" ? Image : 
            tab.id === "data" ? Database : Palette,
    }));
  }, [tabData]);

  const handleWizardTabChange = useCallback((tabId) => {
    switchToTab(tabId);
  }, [switchToTab]);

  const renderTabContent = useCallback(() => {
    const currentTabData = tabData.find((tab) => tab.id === activeTab);

    if (activeTab === "design") {
      return (
        <div
          ref={scope}
          className={`${classes["responsive-mobile"]} ${
            viewPort === ViewPort.DESKTOP ? classes["responsive-desktop"] : ""
          }`}
          style={{ left: 0 }}
        >
          <div style={{ height: "100%", width: "100%", minHeight: 0 }}>
            <QuestionCreator
              goToTab={goToTab}
              showSidebar={showSidebar}
              styles={{
                height: "100%",
                width: "100%",
                minHeight: 0,
                borderRadius: "1.25rem",
                overflow: "visible",
              }}
            />
          </div>
          {viewPort === ViewPort.DESKTOP && (
            <span
              data-testid="question-user-tip"
              className={classes["user-guide"]}
            >
              <img className={classes["tip-bulb"]} src={bulb} alt="bulb" />
              Tip: For the best designing experience, mobile view is recommended.
            </span>
          )}
        </div>
      );
    }

    if (currentTabData?.panelComponent) {
      const PanelComponent = currentTabData.panelComponent;
      const panelProps = { ...(currentTabData.panelComponentProps || {}) };
      if (activeTab === "settings") {
        panelProps.highlightDataSource = lastTabTriggerOptions?.highlightDataSource;
      }
      if (activeTab === "appearance") {
        panelProps.openReplaceSection = lastTabTriggerOptions?.openReplaceSection;
      }
      return <PanelComponent {...panelProps} />;
    }

    return null;
  }, [activeTab, tabData, scope, viewPort, goToTab, showSidebar, lastTabTriggerOptions]);

  useEffect(() => {
    if (!nodeData?.go_data?.last_updated) {
      setTimeout(() => {
        autoSaveHandler(true, true);
      }, 100);
    }
  }, [autoSaveHandler, nodeData?.go_data?.last_updated]);

  return (
    <>
      <WizardDrawer
        ref={drawerRef}
        scrollViewportRef={scrollViewportRef}
        open={true}
        icon={
          <img 
            src={QUESTIONS_NODES[nodeData?.type]?._src} 
            alt="" 
            className="w-5 h-5"
          />
        }
        title={drawerTitle}
        subtitle={drawerSubtitle}
        tabs={wizardTabs}
        activeTab={activeTab}
        onTabChange={handleWizardTabChange}
        onClose={handleClose}
        showEditTitle={true}
        onTitleChange={handleTitleChange}
        showSecondaryAction={false}
        theme={questionTheme}
        fullFooterComponent={
          <Footer
            mode={mode}
            onModeChange={onModeChange}
            viewPort={viewPort}
            onViewPortChange={onViewPortChange}
            onSave={onNodeSave}
            onDiscard={onDiscard}
            questionProperties={questionProperties}
            theme={questionTheme}
          />
        }
        sidebarActions={[]}
        onSidebarActionClick={handleSidebarActionClick}
      >
        <motion.div
          key={activeTab}
          className={cn(classes["question-node-container"], "h-full min-h-full")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeIn", delay: 0.1 }}
        >
          <div className={cn(classes["question-tabs-panel-container"], "h-full min-h-full")}>
            <div className={cn(classes["tab-content-wrapper"], "h-full")}>
              {renderTabContent()}
            </div>
          </div>
        </motion.div>
      </WizardDrawer>

      <Sheet open={sidebarOpen} onOpenChange={handleSidebarClose}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{sidebarTitle}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-auto max-h-[calc(100vh-120px)]">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});

BaseQuestionSetupV2.displayName = "BaseQuestionSetupV2";

export default BaseQuestionSetupV2;
