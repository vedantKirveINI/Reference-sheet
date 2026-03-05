import ReactDOM from "react-dom/client";
import { QuestionV2 } from "../../../module";
const { QuestionRenderer } = QuestionV2;
import { Mode, questionHelpers } from "../../../module/constants";
import { ViewPort } from "../../../module/constants";

export const createQuestionThumbnailElement = ({ theme, node, variables }) => {
  const question = node?.go_data;
  const questionBackgroundStyles = questionHelpers.getQuestionBackgroundStyles(
    theme,
    ViewPort.DESKTOP,
    Mode.CARD,
    question,
  );

  const element = document.createElement("div");
  element.id = "capture";
  element.style.height = "618px";
  element.style.width = "784px";
  element.style.position = "fixed";
  element.style.backgroundColor = questionBackgroundStyles.backgroundColor;
  element.style.backgroundImage = questionBackgroundStyles.backgroundImage;
  element.style.backgroundRepeat = questionBackgroundStyles.backgroundRepeat;
  element.style.backgroundSize = questionBackgroundStyles.backgroundSize;
  element.style.backgroundPosition =
    questionBackgroundStyles.backgroundPosition;
  element.style.left = "-100vh";
  const root = ReactDOM.createRoot(element);

  if (!node) return element;

  root.render(
    <QuestionRenderer
      uiConfig={{
        mode: Mode.CARD,
        viewPort: ViewPort.DESKTOP,
        theme: theme,
      }}
      handlers={{
        onSubQuestionSelect: () => {},
        onQuestionEditorFocus: () => {},
        onCTAClick: () => {},
      }}
      questionData={question}
      stateConfig={{
        isCreator: true,
      }}
      nodeConfig={{}}
      ref={{}}
      questionIndex={1}
      isCreator
      value={question?.placeholder || question?.blocks}
      variables={variables}
    />,
  );

  return element;
};
