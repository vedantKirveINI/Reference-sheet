
import { QuestionRenderer } from "@oute/oute-ds.skeleton.question-v2";

import { styles, transitions } from "./styles";
import { TEndingScreenProps } from "./types";
import { motion } from "framer-motion";
import { Mode } from "@src/module/constants";

const EndingScreen = ({
  answers,
  autoFocus,
  error,
  onSubmit,
  question,
  questionRef,
  theme,
  viewport,
  onRestart = () => {},
  isPreviewMode,
}: TEndingScreenProps) => {
  return (
    <motion.div
      key={`Ending-screen-${question?.id}`}
      style={styles.container}
      variants={transitions}
      initial="hidden"
      animate="show"
      exit="remove"
    >
      <QuestionRenderer
        key={`Ending-screen-question-${question?.id}`}
        uiConfig={{
          mode: Mode.CARD,
          viewPort: viewport,
          theme: theme,
        }}
        handlers={{
          onRestart: onRestart,
          onChange: () => {},
          onSubmit: onSubmit,
        }}
        nodeConfig={{}}
        stateConfig={{
          isCreator: false,
          isPreviewMode: isPreviewMode,
          answers: answers,
        }}
        loading={false}
        ref={questionRef}
        questionIndex={null}
        questionData={question}
        value={answers}
        error={error}
        autoFocus={autoFocus}
      />
    </motion.div>
  );
};

export default EndingScreen;
