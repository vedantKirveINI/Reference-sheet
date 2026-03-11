import React, { useMemo } from "react";
import { COLUMN_TYPES } from "../../constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-2 w-full" data-testid={dataTestId}>
      <h4 className="text-sm font-medium text-foreground">
        Unmapped Questions ({unmappedQuestions.length})
      </h4>
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        {unmappedQuestions.map((question) => (
          <Badge
            key={question.id}
            variant="outline"
            className="text-sm font-normal text-muted-foreground border-border"
          >
            {question.question}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default UnmappedQuestions;
