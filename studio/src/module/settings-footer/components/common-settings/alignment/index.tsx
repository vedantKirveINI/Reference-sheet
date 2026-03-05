import { Mode, QuestionAlignments, ViewPort,  } from "@oute/oute-ds.core.constants";
import { ODSLabel } from "@src/module/ods";
import { getAlignmentTabContainerStyle, getAlignmentTabsContainerStyle, getQuestionAlignmentContainerStyles, getQuestionAlignmentTextStyles,  } from "./styles";
import leftAlignWhite from "../../../assets/left-align.svg";
import centerAlignBlack from "../../../assets/center-align.svg";
import leftAlignBlack from "../../../assets/left-align-black.svg";
import centerAlignWhite from "../../../assets/center-align-white.svg";
interface QuestionAlignmentProps {
  settings?: any;
  onChange?: (key: any, val: any) => void;
  viewPort?: ViewPort;
  style?: any;
  mode?: any;
  disabled?: boolean;
}

const QuestionAlignment = ({
  settings,
  onChange,
  style,
  mode,
  disabled = false,
}: QuestionAlignmentProps) => {
  const isQuestionLeftAlign =
    mode === Mode.CARD
      ? settings?.questionAlignment !== QuestionAlignments.CENTER
      : true;
  return (
    <div style={getQuestionAlignmentContainerStyles(style, disabled)}>
      <div
        style={getAlignmentTabsContainerStyle({ mode, disabled })}
        data-testid="settings-question-alignment-tabs"
      >
        <div
          style={getAlignmentTabContainerStyle({
            isSelected: isQuestionLeftAlign,
          })}
          onClick={() => {
            if (mode !== Mode.CARD) return;
            onChange("questionAlignment", QuestionAlignments.LEFT);
          }}
          data-testid="settings-question-alignment-left"
        >
          <img
            src={isQuestionLeftAlign ? leftAlignWhite : leftAlignBlack}
            alt=""
            data-testid="settings-question-alignment-left-icon"
          />
        </div>
        <div
          style={getAlignmentTabContainerStyle({
            isSelected: !isQuestionLeftAlign,
          })}
          onClick={() => {
            if (disabled) return;
            onChange("questionAlignment", QuestionAlignments.CENTER);
          }}
          data-testid="settings-question-alignment-center"
        >
          <img
            src={!isQuestionLeftAlign ? centerAlignWhite : centerAlignBlack}
            alt=""
            data-testid="settings-question-alignment-center-icon"
          />
        </div>
      </div>
      <ODSLabel variant="body1" style={getQuestionAlignmentTextStyles()}>
        Question Alignment
      </ODSLabel>
    </div>
  );
};

export default QuestionAlignment;
