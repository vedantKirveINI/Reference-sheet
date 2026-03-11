//PROD
import { DELAY_NODE } from "../../../canvas/extensions";
import { HTTP_NODE } from "../../../canvas/extensions";
import { IF_ELSE_NODE } from "../../../canvas/extensions";

export const FLOW_CONTROLS = "Flow Controls";
export const IF_ELSE_FC = "If-Else";
export const LOOP_FC = "Loop";
export const BREAK_FC = "Break";
export const IGNORE_FC = "Ignore";
export const REPEATER_FC = "Repeater";
export const DELAY_FC = "Delay";
export const HTTP_FC = "HTTP";
export const ITERATOR_FC = "Iterator";

export const ALL_FLOW_CONTROL_COMPONENTS = [
  {
    ...IF_ELSE_NODE,
  },
  {
    ...HTTP_NODE,
  },
  {
    ...DELAY_NODE,
  },
];
