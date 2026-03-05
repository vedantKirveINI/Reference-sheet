import React, { forwardRef } from "react";
import { CreatorView } from "./components/creator-view";
import { FillerView } from "./components/filler-view";
import type { QuestionRepeatorProps } from "./types";

export const QuestionRepeator = forwardRef(
  (
    {
      isCreator = false,
      question,
      onChange,
      answers,
      theme,
      variables,
      value = [],
    }: QuestionRepeatorProps,
    ref
  ) => {
    return (
      <>
        {isCreator ? (
          <CreatorView />
        ) : (
          <FillerView
            key={"filler-view"}
            onChange={onChange}
            question={question}
            value={value}
            theme={theme}
          />
        )}
      </>
    );
  }
);
