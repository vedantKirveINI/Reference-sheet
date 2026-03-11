import { lazy } from "react";
import { SEQUENCE_NODE_TYPES } from "../constants";

const TriggerDrawer = lazy(() => import("@/components/canvas/extensions/trigger-setup"));
const EndNodeDialogV3 = lazy(() => import("@/components/canvas/extensions/end-v3"));
const IfElseDialog = lazy(() => import("@/components/canvas/extensions/if-else"));
const HITLDrawerV2 = lazy(() => import("@/components/canvas/extensions/hitl-v2"));

import TinyModule from "./tiny-module";
import MergeJoin from "./merge-join";
import Wait from "./wait";
import Loop from "./loop";

import { TINY_MODULE_NODE_TYPE } from "./tiny-module/constants";
import { MERGE_JOIN_NODE_TYPE } from "./merge-join/constants";
import { WAIT_NODE_TYPE } from "./wait/constants";
import { LOOP_START_NODE_TYPE, LOOP_END_NODE_TYPE } from "./loop/constants";

export {
  TinyModule,
  MergeJoin,
  Wait,
  Loop,
};

export const SEQUENCE_EXTENSIONS = {
  [SEQUENCE_NODE_TYPES.TRIGGER]: TriggerDrawer,
  [SEQUENCE_NODE_TYPES.EXIT]: EndNodeDialogV3,
  [SEQUENCE_NODE_TYPES.CONDITIONAL]: IfElseDialog,
  [SEQUENCE_NODE_TYPES.HITL]: HITLDrawerV2,
  [WAIT_NODE_TYPE]: Wait,
  [TINY_MODULE_NODE_TYPE]: TinyModule,
  [MERGE_JOIN_NODE_TYPE]: MergeJoin,
  [LOOP_START_NODE_TYPE]: Loop,
  [LOOP_END_NODE_TYPE]: Loop,
};

export const getSequenceExtension = (nodeType) => {
  return SEQUENCE_EXTENSIONS[nodeType] || null;
};

export default SEQUENCE_EXTENSIONS;
