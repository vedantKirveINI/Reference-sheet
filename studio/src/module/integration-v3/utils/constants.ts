import { QuestionType } from "@oute/oute-ds.core.constants";

const CONTROL_FLOW_NODES = [
  "HTTP",
  "IFELSE",
  "IFELSE_V2",
  "INTEGRATION",
  "TRANSFORMER",
  "CREATE_SHEET_RECORD",
  "UPDATE_SHEET_RECORD",
  "DELETE_SHEET_RECORD",
  "FIND_ALL_SHEET_RECORD",
  "FIND_ONE_SHEET_RECORD",
  "CREATE_SHEET_RECORD_V2",
  "UPDATE_SHEET_RECORD_V2",
  "DELETE_SHEET_RECORD_V2",
  "FIND_ALL_SHEET_RECORD_V2",
  "FIND_ONE_SHEET_RECORD_V2",
  "DB_INSERT",
  "DB_FIND",
  "DB_FIND_ONE",
  "DB_UPSERT",
  "DB_UPDATE_MANY",
  "DB_DELETE_MANY",
  "DB_EXECUTE_QUERY",
  "MATCH_PATTERN",
];

const QUESTION_NODES = Object.values(QuestionType);

const LOCALLY_EXECUTABLE_NODES = [
  "IFELSE",
  "IFELSE_V2",
  "Transformer",
  "MATCH_PATTERN",
];

const REFRESHABLE_QUESTION_TYPES = [QuestionType.DROP_DOWN];

const MAPPABLE_QUESTIONS = [
  QuestionType.NUMBER,
  QuestionType.SCQ,
  QuestionType.MCQ,
  QuestionType.RANKING,
  QuestionType.YES_NO,
  QuestionType.DROP_DOWN,
  QuestionType.DROP_DOWN_STATIC,
  QuestionType.DATE,
  QuestionType.TIME,
  QuestionType.PDF_VIEWER,
  QuestionType.KEY_VALUE_TABLE,
];

const VALIDATION_MESSAGE = {
  COMMON: {
    REQUIRED: "This field is required",
    INVALID_INPUT: "Invalid input",
  },
  DROPDOWN: {
    SINGLE_SELECTION: "Please select only one option",
    EXACT_NUMBER: (num: number) => `Please select ${num} option`,
    RANGE: (min: number, max: number) =>
      `Please select between ${min} and ${max}`,
  },
  DATE: {
    INVALID_DATE: "Invalid Date",
    PAST_DATE: "Date should not be past date",
    FUTURE_DATE: "Date should not be future date",
    MIN_DATE: (startDate: string) =>
      `Date should be greater than or equal to ${startDate}`,
    MAX_DATE: (endDate: string) =>
      `Date should be less than or equal to ${endDate}`,
  },
  TIME: {
    INVALID_TIME: "Invalid Time",
    TIME_REQUIRED: "Time is required",
  },
};

export {
  CONTROL_FLOW_NODES,
  QUESTION_NODES,
  LOCALLY_EXECUTABLE_NODES,
  REFRESHABLE_QUESTION_TYPES,
  MAPPABLE_QUESTIONS,
  VALIDATION_MESSAGE,
};
