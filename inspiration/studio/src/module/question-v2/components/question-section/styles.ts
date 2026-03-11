import { Mode, QuestionType, QuestionAlignments, ViewPort } from "@oute/oute-ds.core.constants";

export const getQuestionContainerStyles = ({
  mode,
  questionAlignment,
}) => {
  // Only apply alignment in CARD and CLASSIC modes
  const shouldApplyAlignment = mode === Mode.CARD || mode === Mode.CLASSIC;
  const alignment = shouldApplyAlignment && questionAlignment 
    ? questionAlignment 
    : QuestionAlignments.LEFT;
  
  return {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: alignment,
  } as const;
};

export const getQuestionFontStyles = ({
  questionTheme,
  questionAlignment,
  questionType,
  mode,
}: {
  isRequired?: boolean;
  questionTheme?: { color?: string; fontSize?: string; fontFamily?: string; fontWeight?: number };
  isQuestionEmpty?: boolean;
  questionIndex?: number;
  hideQuestionIndex?: boolean;
  editable?: boolean;
  questionAlignment?: string;
  questionType?: string;
  mode?: string;
}) => {
  const {
    color = "#263238",
    fontFamily = "Noto Serif",
    fontWeight = 500,
  } = questionTheme || {};

  const isLoadingQuestionType = questionType === QuestionType.LOADING;

  const getClassicLayoutStyles = () => {
    // Classic mode now inherits font-size from theme (same as Card/Chat) for consistency
    if (mode === Mode.CLASSIC) {
      return {};
    }
    return {};
  };

  // Calculate textAlign based on questionAlignment
  const getTextAlign = () => {
    if (isLoadingQuestionType) return "center";
    
    // Only apply alignment in CARD and CLASSIC modes
    const shouldApplyAlignment = mode === Mode.CARD || mode === Mode.CLASSIC;
    if (!shouldApplyAlignment || !questionAlignment) return "left";
    
    if (questionAlignment === QuestionAlignments.CENTER) return "center";
    if (questionAlignment === QuestionAlignments.RIGHT) return "right";
    return "left";
  };

  return {
    width: "100%",
    color: color,
    fontFamily: fontFamily,
    fontStyle: "normal",
    fontWeight: fontWeight,
    ...getClassicLayoutStyles(),
    textAlign: getTextAlign(),
    "--editor-theme-color": color,
    "--editor-theme-font": fontFamily,
  } as const;
};

export const getDescriptionFontStyles = ({
  questionAlignment,
  questionType,
  theme,
  mode,
}: {
  questionAlignment?: string;
  questionType?: string;
  theme?: { color?: string };
  mode?: string;
}) => {
  const { color = "#263238" } = theme || {};
  const isLoadingQuestionType = questionType === QuestionType.LOADING;
  
  // Classic mode layout: reduced margin-top (font-size now inherits for consistency)
  const getClassicLayoutStyles = () => {
    if (mode === Mode.CLASSIC) {
      return {
        marginTop: "0.25rem", // mt-1 equivalent
      };
    }
    return {
      marginTop: "0.875em",
    };
  };

  // Calculate textAlign based on questionAlignment
  const getTextAlign = () => {
    if (isLoadingQuestionType) return "center";
    
    // Only apply alignment in CARD and CLASSIC modes
    const shouldApplyAlignment = mode === Mode.CARD || mode === Mode.CLASSIC;
    if (!shouldApplyAlignment || !questionAlignment) return "left";
    
    if (questionAlignment === QuestionAlignments.CENTER) return "center";
    if (questionAlignment === QuestionAlignments.RIGHT) return "right";
    return "left";
  };

  return {
    width: "100%",
    minWidth: "30%",
    ...getClassicLayoutStyles(),
    color: color,
    fontFamily: "Noto Serif",
    fontStyle: "normal",
    fontWeight: 400,
    letterSpacing: " 0.25px",
    textAlign: getTextAlign(),
    "--editor-theme-color": color,
  } as const;
};

export const getquestionTitleStickyStyles = ({
  questionTheme = {},
  viewPort,
}: any) => {
  return {
    position: "absolute",
    borderBottom: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
    background: "rgba(255, 255, 255, 0.80)",
    top: 0,
    left: 0,
    width: "100%",
    color: questionTheme.color,
    fontSize: "1.25rem",
    fontWeight: "500",
    backdropFilter: "blur(1em)",
    padding: viewPort === ViewPort.DESKTOP ? "1.25em 2em" : "1em",
    transition: "background-color 0.2s ease-out, opacity 0.2s ease-out",
    boxShadow: "0px 4px 6px 0px rgba(183, 190, 202, 0.12)",
    zIndex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  } as const;
};

export const getInteractionGuidelineStyles = ({ questionAlignment, theme }) => {
  // Convert flex alignment values to text-align values
  const getTextAlign = () => {
    if (!questionAlignment) return "left";
    if (questionAlignment === QuestionAlignments.CENTER) return "center";
    if (questionAlignment === QuestionAlignments.RIGHT) return "right";
    return "left";
  };

  return {
    marginLeft: "1px",
    marginTop: "2rem",
    width: "100%",
    fontSize: "1.125rem",
    fontStyle: "bold",
    fontWeight: 400,
    lineHeight: "1.2375rem",
    letterSpacing: "0.01563rem",
    textAlign: getTextAlign(),
    color: theme?.styles?.buttons,
  };
};

export const toolTipStyles = {
  fontSize: "0.8rem",
  backgroundColor: "rgba(33, 33, 33, 0.90)",
  color: "#fff",
  fontFamily: "Inter",
};

// Inject keyframes via style tag (similar to text-preview approach)
if (typeof document !== 'undefined' && !document.getElementById('question-v2-shine-animation')) {
  const style = document.createElement('style');
  style.id = 'question-v2-shine-animation';
  style.textContent = `
    @keyframes shine {
      to {
        background-position: right -40px top 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export const skeletonStyle = {
  width: "100%",
  height: "1.8em",
  borderRadius: "4px",
  backgroundColor: "#dfe6eb",
  backgroundImage: `linear-gradient(
    90deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.5) 50%, 
    rgba(255, 255, 255, 0) 100%
  )`,
  backgroundSize: "8rem 100%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left -4rem top 0",
  animation: "shine 2s ease infinite",
};
