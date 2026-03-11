import { TQuestion, TTheme, ViewPort } from "@oute/oute-ds.core.constants";

export type OpionionScaleProps = {
  onChange?: (value: number) => void;
  disabled?: boolean;
  theme?: TTheme;
  question?: TQuestion;
  isCreator?: boolean;
  viewPort?: ViewPort;
  value?: number;
  isAnswered?: boolean;
};
