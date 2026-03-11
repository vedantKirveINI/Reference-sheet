import { TQuestion, TTheme, ViewPort } from "@oute/oute-ds.core.constants";

export type SliderProps = {
  question: TQuestion;
  isCreator?: boolean;
  viewPort?: ViewPort;
  value?: number;
  isAnswered?: boolean;
  theme?: TTheme;
  onChange?: (value: number) => void;
};
