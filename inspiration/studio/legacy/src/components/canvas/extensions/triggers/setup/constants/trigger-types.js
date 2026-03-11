import { INTEGRATION_TYPE } from "../../../constants/types";
import SHEET_TRIGGER_NODE from "../../../sheet/trigger/constant";
import DATE_FIELD_TRIGGER_NODE from "../../date-field/constant";
import START_NODE from "../../../start/constant";
import TIME_BASED_TRIGGER_NODE from "../../../time-based-trigger/constant";
import WEBHOOK_NODE from "../../../webhook/constant";
import FORM_TRIGGER_NODE from "../../form/constants";

export const TRIGGER_TYPES = [
  START_NODE,
  TIME_BASED_TRIGGER_NODE,
  WEBHOOK_NODE,
  SHEET_TRIGGER_NODE,
  DATE_FIELD_TRIGGER_NODE,
  FORM_TRIGGER_NODE,
  {
    name: "App Based Trigger",
    type: INTEGRATION_TYPE,
    _src: "https://cdn-v1.tinycommand.com/1234567890/1749458455925/app-based-default.svg",
    hoverDescription:
      "Starts when a specific action in an app triggers the workflow automatically.",
  },
];
