import { SHORT_TEXT_DEFAULT_SETUP } from "@oute/oute-ds.core.constants";
import { generateUUID } from "@/lib/utils";

const DEFAULT_QUESTION_ID = generateUUID();

export const DEFAULT_QUESTON = {
  [DEFAULT_QUESTION_ID]: {
    ...SHORT_TEXT_DEFAULT_SETUP,
    _id: DEFAULT_QUESTION_ID,
    id: DEFAULT_QUESTION_ID,
  },
};
