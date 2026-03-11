import {
  ALL_FLOW_CONTROL_COMPONENTS,
  FLOW_CONTROLS,
} from "./flow-control-constants";

export const ALL_COMPONENTS = [
  ...ALL_FLOW_CONTROL_COMPONENTS.map((c) => ({
    ...c,
    module: FLOW_CONTROLS,
  })),
];
