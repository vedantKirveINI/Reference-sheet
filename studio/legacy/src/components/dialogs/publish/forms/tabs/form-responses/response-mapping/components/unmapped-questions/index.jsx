import React, { useMemo } from "react";
import { COLUMN_TYPES } from "../../constants";
import classes from "./index.module.css";

const UnmappedQuestions = ({
  questions = [],
  mappedQuestions = [],
  dataTestId,
}) => {
  const unmappedQuestions = useMemo(() => {
    const mappedQuestionIds = mappedQuestions
      .filter((row) => row.columnType === COLUMN_TYPES.QUESTION)
      .map((row) => row.value);

    return questions.filter(
      (question) => !mappedQuestionIds.includes(question.key),
    );
  }, [questions, mappedQuestions]);

  if (unmappedQuestions.length === 0) return null;

  return (
    <div className={classes.container} data-testid={dataTestId}>
      <h4>Unmapped Questions ({unmappedQuestions.length})</h4>
      <div className={classes.chipContainer}>
        {unmappedQuestions.map((question) => (
          <div key={question.id} className={classes.chip}>
            {question.question}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnmappedQuestions;
