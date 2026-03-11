export type QuestionSectionProps = {
  // To add question text
  questionTitle?: string;
  // To add question desc text
  description?: string;
  // To add question index
  questionIndex?: number;
  // editable
  editable?: boolean;
  onChange?: any;
  sanitizeInputTheme?: any;
  theme?: any;
  isRequired?: boolean;
  questionIndexTheme?: any;
  questionAlignment?: string;
  mode?: string;
  hideQuestionIndex?: any;
  isCreator?: boolean;
  question?: any;
  variables?: any;
  answers?: any;
  questionType?: any;
  isAugmentorAvailable?: boolean;
  viewPort?: string;
  style?: any;
  onFocus?: () => void;
  autoFocus?: boolean;
};
