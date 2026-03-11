import { QuestionType } from "@oute/oute-ds.core.constants";
import { styles } from "./styles";
export const PressEnterGuide = ({ isCreator, theme, questionType }) => {
  if (
    !isCreator ||
    questionType === QuestionType.WELCOME ||
    questionType === QuestionType.QUOTE
  ) {
    return (
      <span
        style={styles.helperStyle({ theme })}
        data-testid="press-enter-helper-text"
      >
        press <strong>Enter ↵</strong>
      </span>
    );
  }
  return null;
};
