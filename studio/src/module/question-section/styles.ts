import { Mode, QuestionType, ViewPort } from "@oute/oute-ds.core.constants";

export const getQuestionContainerStyles = ({
  mode,
  questionAlignmentCenter,
}) => {
  return {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems:
      mode === Mode.CARD && questionAlignmentCenter ? "center" : "flex-start",
  } as const;
};

export const getQuestionFontStyles = ({
  isRequired,
  questionTheme,
  isQuestionEmpty,
  questionIndex,
  hideQuestionIndex,
  isCreator,
  questionAlignmentCenter,
  questionType,
}) => {
  const {
    color = "#263238",
    fontSize = "1em",
    fontFamily = "Noto Serif",
    fontWeight = 500,
  } = questionTheme || {};

  const isLoadingQuestionType = questionType === QuestionType.LOADING;

  let questionSection = document.getElementById("question-section-editor");
  const italicTags = questionSection?.getElementsByClassName(
    "PlaygroundEditorTheme__textItalic"
  );
  const boldTags = questionSection?.getElementsByClassName(
    "PlaygroundEditorTheme__textBold"
  );

  const getIndexStyles = () => {
    if (italicTags?.length > 0 && boldTags?.length > 0) {
      return { fontStyle: "italic", fontWeight: "bold" };
    }
    if (italicTags?.length > 0) {
      return { fontStyle: "italic" };
    }
    if (boldTags?.length > 0) {
      return { fontWeight: "bold" };
    }
  };

  return {
    width: "100%",
    color: "#263238",
    fontFamily: "Noto Serif",
    fontStyle: "normal",
    fontWeight: fontWeight,
    textAlign: isLoadingQuestionType
      ? "center"
      : questionAlignmentCenter
        ? "center"
        : "left",
    "& .content-editor": {
      "& .PlaygroundEditorTheme__ltr": {
        textAlign: "unset !important",
      },
      "& .PlaygroundEditorTheme__link": {
        color: color,
        textDecoration: "underline",
      },
    },

    "& .content-editor p:last-of-type:last-child:after": {
      content: isRequired && !isQuestionEmpty ? '"*"' : '""',
    },
    "& p:first-of-type:before": !isCreator && {
      content: hideQuestionIndex
        ? '""'
        : questionIndex
          ? `"${questionIndex}. "`
          : '""',
      display: "contents",
      color: color,
      fontFamily: fontFamily,
      fontStyle: "normal",
      fontSize: fontSize,
      fontWeight: fontWeight,
      ...getIndexStyles(),
    },
  };
};

export const getDescriptionFontStyles = ({
  questionAlignmentCenter,
  questionType,
  theme,
}) => {
  const { color = "#263238" } = theme || {};
  const isLoadingQuestionType = questionType === QuestionType.LOADING;
  return {
    width: "100%",
    minWidth: "30%",
    marginTop: "0.875em",
    color: color,
    fontFamily: "Noto Serif",
    fontStyle: "normal",
    fontWeight: 400,
    letterSpacing: " 0.25px",
    textAlign: isLoadingQuestionType
      ? "center"
      : questionAlignmentCenter
        ? "center"
        : "left",
    "& .content-editor": {
      "& .PlaygroundEditorTheme__ltr": {
        textAlign: "unset !important",
      },
      "& .PlaygroundEditorTheme__link": {
        color: `${color} !important`,
        textDecoration: "underline",
      },
    },
  };
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

export const getInteractionGuidelineStyles = () => {
  return {
    marginLeft: "1px",
    marginTop: "2rem",
    width: "100%",
    fontSize: "1.125rem",
    fontStyle: "bold",
    fontWeight: 400,
    lineHeight: "1.2375rem",
    letterSpacing: "0.01563rem",
  };
};

export const toolTipStyles = {
  fontSize: "0.8rem",
  backgroundColor: "rgba(33, 33, 33, 0.90)",
  color: "#fff",
  fontFamily: "Inter",
};

// Inject keyframes via style tag (similar to text-preview approach)
if (typeof document !== 'undefined' && !document.getElementById('question-section-shine-animation')) {
  const style = document.createElement('style');
  style.id = 'question-section-shine-animation';
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
