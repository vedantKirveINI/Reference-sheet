import React, { forwardRef, lazy } from "react";
import { QuestionSetupContentV2 } from "./question-setup/index-v2";
import {
  ARRAY_AGGREGATOR_TYPE,
  CONNECTION_SETUP_TYPE,
  CREATE_SHEET_RECORD_TYPE,
  CREATE_TYPE,
  DELAY_TYPE,
  DELETE_TYPE,
  EXECUTE_TYPE,
  FIND_ALL_TYPE,
  FIND_ONE_SHEET_RECORD_TYPE,
  FIND_ALL_SHEET_RECORD_TYPE,
  FIND_ONE_TYPE,
  HTTP_TYPE,
  IF_ELSE_TYPE,
  INPUT_SETUP_TYPE,
  INTEGRATION_TYPE,
  ITERATOR_TYPE,
  LOG_TYPE,
  LOG_TYPE_V2,
  MATCH_PATTERN_TYPE,
  SUCCESS_SETUP_TYPE,
  TINY_GPT_TYPE,
  TRANSFORMER_TYPE,
  TRANSFORMER_TYPE_V3,
  FORMULA_FX_TYPE,
  UPDATE_TYPE,
  UPDATE_SHEET_RECORD_TYPE,
  DELETE_SHEET_RECORD_TYPE,
  WORKFLOW_SETUP_TYPE,
  TINY_GPT_RESEARCHER_TYPE,
  TINY_GPT_WRITER_TYPE,
  SKIP_TYPE,
  BREAK_TYPE,
  TINY_GPT_ANALYZER_TYPE,
  TINY_GPT_SUMMARIZER_TYPE,
  TINY_GPT_TRANSLATOR_TYPE,
  TINY_GPT_LEARNING_TYPE,
  TINY_GPT_CONSULTANT_TYPE,
  TINY_GPT_CREATIVE_TYPE,
  WEBHOOK_TYPE,
  TIME_BASED_TRIGGER,
  FIND_ONE_SHEET_RECORD_V2_TYPE_DEPRECATED,
  FIND_ALL_SHEET_RECORD_V2_TYPE_DEPRECATED,
  AGENT_TINY_SCOUT,
  AGENT_TINY_COMPOSER,
  SHEET_TRIGGER,
  UPDATE_SHEET_RECORD_TYPE_V2_DEPRECATED,
  CREATE_SHEET_RECORD_TYPE_V2_DEPRECATED,
  HITL_TYPE,
  AGENT_WORKFLOW,
  AGENT_OUTPUT,
  AGENT_INPUT,
  JUMP_TO_TYPE,
  TRIGGER_SETUP_TYPE,
  TOOL_INPUT_TYPE,
  TOOL_OUTPUT_TYPE,
  SEND_EMAIL_TO_YOURSELF_TYPE,
  SEND_EMAIL_TO_YOURSELF_V2_TYPE,
  TINY_SEARCH,
  TINY_SEARCH_V2,
  TINY_SEARCH_V3,
  PERSON_ENRICHMENT_TYPE,
  PERSON_ENRICHMENT_V2_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_V2_TYPE,
  COMPANY_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_V2_TYPE,
  DELAY_TYPE_V2,
  JUMP_TO_TYPE_V2,
  ITERATOR_TYPE_V2,
  ARRAY_AGGREGATOR_TYPE_V2,
  AGENT_TINY_COMPOSER_V2,
  AGENT_TINY_COMPOSER_V3,
  SHEET_TRIGGER_V2_TYPE,
  WEBHOOK_TYPE_V2,
  CONNECTION_SETUP_V2_TYPE,
  AGENT_INPUT_V2_TYPE,
  AGENT_OUTPUT_V2_TYPE,
  TIME_BASED_TRIGGER_V2_TYPE,
  START_NODE_V2_TYPE,
  END_NODE_TYPE,
  HITL_V2_TYPE,
  TOOL_INPUT_V2_TYPE,
  TOOL_OUTPUT_V2_TYPE,
  AGENT_WORKFLOW_V3,
  UPDATE_RECORD_V2_TYPE,
  UPDATE_SHEET_RECORDS_TYPE,
  CREATE_RECORD_V2_TYPE,
  DELETE_V2_TYPE,
  EXECUTE_V2_TYPE,
  FIND_ALL_V2_TYPE,
  FIND_ONE_V2_TYPE,
  LOOP_START_TYPE,
  LOOP_END_TYPE,
  FOR_EACH_TYPE,
  REPEAT_TYPE,
  LOOP_UNTIL_TYPE,
  IF_ELSE_TYPE_V2,
} from "./constants/types";
import ToolInputDialog from "./tool-input";
import ToolOutputDialog from "./tool-output";
import SendEmailToYourselfDialog from "./send-email-to-yourself";
const FindOneRecordDialog = lazy(() => import("./crud-operations/find-one"));
const FindAllRecordDialog = lazy(() => import("./crud-operations/find-all"));
const DeleteRecordDialog = lazy(
  () => import("./crud-operations/delete-record")
);
const CreateRecordDialog = lazy(
  () => import("./crud-operations/create-record")
);
const ExecuteQueryDialog = lazy(
  () => import("./crud-operations/execute-query")
);
const UpdateRecordDialog = lazy(
  () => import("./crud-operations/update-record")
);
const MatchPatternDialog = lazy(() => import("./text-parsers/match-pattern"));
const ArrayAggregatorDialog = lazy(() => import("./array-aggregator"));
const ConnectionSetupDialog = lazy(() => import("./connection-setup"));
const DelayDialog = lazy(() => import("./delay"));
const IntegrationNodeDialog = lazy(() => import("./integration-node"));
const HttpDialog = lazy(() => import("./http"));
const IfElseDialog = lazy(() => import("./if-else"));
const IfElseDialogV2 = lazy(() => import("./if-else-v2"));
const IteratorDialog = lazy(() => import("./iterator"));
const LogDialog = lazy(() => import("./log"));
const LogDialogV2 = lazy(() => import("./log-v2"));
const StartNodeDialog = lazy(() => import("./start"));
const TransformerDialog = lazy(() => import("./transformer"));
const FormulaFXDialog = lazy(() => import("./formula-fx"));
const WorkflowSetupDialog = lazy(() => import("./workflow-setup"));
const CreateSheetRecordDialog = lazy(() => import("./sheet/create-record"));
const FindOneSheetRecordDialog = lazy(() => import("./sheet/find-one"));
const TinyGPTDialog = lazy(() => import("./tiny-gpt-v4"));
const UpdateSheetRecordDialog = lazy(() => import("./sheet/update-record"));
const FindAllSheetRecordDialog = lazy(() => import("./sheet/find-all"));
const DeleteSheetRecordDialog = lazy(() => import("./sheet/delete-record"));
const SheetTriggerDialog = lazy(() => import("./sheet/trigger"));
const TinyGPTResearcherDialog = lazy(() => import("./tiny-gpt-researcher-v2"));
const TinyGPTWriterDialog = lazy(() => import("./tiny-gpt-writer-v2"));
const SkipDialog = lazy(() => import("./skip"));
const BreakDialog = lazy(() => import("./break"));
const TinyGPTAnalyzerDialog = lazy(() => import("./gpt-analyzer"));
const TinyGPTSummarizerDialog = lazy(() => import("./gpt-summarizer"));
const TinyGPTTranslatorDialog = lazy(() => import("./gpt-translator"));
const TinyGPTLearningDialog = lazy(() => import("./gpt-learning"));
const TinyGPTConsultantDialog = lazy(() => import("./gpt-consultant"));
const TinyGPTCreativeDialog = lazy(() => import("./gpt-creative"));
const WebhookDialog = lazy(() => import("./webhook"));
const TimeBasedTriggerDialog = lazy(() => import("./time-based-trigger"));
const FindAllSheetRecordDialogV2 = lazy(() => import("./sheet/find-all"));
const FindOneSheetRecordDialogV2 = lazy(() => import("./sheet/find-one"));
// const AgentInputNodeDrawer = lazy(() => import("./agent/input"));
const AgentTinyScoutNodeDrawer = lazy(() => import("./agent/agent-scout-v3"));
const AgentTinyComposerNodeDrawer = lazy(
  () => import("./agent/agent-composer")
);
const UpdateSheetRecordDialogV2 = lazy(
  () => import("./sheet/update-record")
);
const UpdateSheetRecordsDialog = lazy(
  () => import("./sheet/update-records")
);
const CreateSheetRecordDialogV2 = lazy(
  () => import("./sheet/create-record")
);
const HITLDrawer = lazy(() => import("./hitl"));
const UserAgentDrawer = lazy(() => import("./user-agent"));
const AgentOutputDialog = lazy(() => import("./agent-output"));
const AgentInputNodeDrawer = lazy(() => import("./agent-input"));
const JumpToNodeDrawer = lazy(() => import("./jump-to"));
const TriggerDrawer = lazy(() => import("./trigger-setup"));
const TinySearchNodeDrawer = lazy(() => import("./tiny-search"));
const TinySearchNodeV2Drawer = lazy(() => import("./tiny-search-v2"));
const TinySearchNodeV3Drawer = lazy(() => import("./tiny-search-v3"));
const PeopleEnrichmentDialog = lazy(() => import("./enrichment/person"));
const EmailEnrichmentDialog = lazy(() => import("./enrichment/email"));
const CompanyEnrichmentDialog = lazy(() => import("./enrichment/company"));

const DelayDialogV2 = lazy(() => import("./delay-v2"));
const SkipDialogV2 = lazy(() => import("./skip-v2"));
const BreakDialogV2 = lazy(() => import("./break-v2"));
const JumpToNodeDrawerV2 = lazy(() => import("./jump-to-v2"));
const IteratorDialogV2 = lazy(() => import("./iterator-v2"));
const ArrayAggregatorDialogV2 = lazy(() => import("./array-aggregator-v2"));
const AgentTinyComposerNodeDrawerV2 = lazy(() => import("./agent/agent-composer-v2"));
const AgentTinyComposerNodeDrawerV3 = lazy(() => import("./agent/agent-composer-v3"));
const CreateSheetRecordDialogV3 = lazy(() => import("./sheet/create-record"));
const UpdateSheetRecordDialogV3 = lazy(() => import("./sheet/update-record"));
const FindAllSheetRecordDialogV3 = lazy(() => import("./sheet/find-all"));
const FindOneSheetRecordDialogV3 = lazy(() => import("./sheet/find-one"));
const DeleteSheetRecordDialogV3 = lazy(() => import("./sheet/delete-record"));
const SheetTriggerDialogV2 = lazy(() => import("./sheet/trigger"));
const WebhookDialogV2 = lazy(() => import("./webhook-v2"));
const SendEmailToYourselfDialogV2 = lazy(() => import("./send-email-to-yourself-v2"));
const ConnectionSetupDialogV2 = lazy(() => import("./connection-setup-v2"));
const AgentInputNodeDrawerV2 = lazy(() => import("./agent-input-v2"));
const AgentOutputDialogV2 = lazy(() => import("./agent-output-v2"));
const TimeBasedTriggerDialogV2 = lazy(() => import("./time-based-trigger-v2"));
const TriggerSetupDialog = lazy(() => import("./trigger-setup"));
const StartNodeDialogV2 = lazy(() => import("./start-v2"));
const EndNodeDialogV3 = lazy(() => import("./end-v3"));
const HITLDrawerV2 = lazy(() => import("./hitl-v2"));
const ToolInputDialogV2 = lazy(() => import("./tool-input-v2"));
const ToolOutputDialogV2 = lazy(() => import("./tool-output-v2"));
const AgentNodeV3Drawer = lazy(() => import("./agent-node-v3"));
const LoopStartDrawer = lazy(() => import("./loop-start"));
const LoopEndDrawer = lazy(() => import("./loop-end"));
const ForEachDrawer = lazy(() => import("./for-each"));
const RepeatDrawer = lazy(() => import("./repeat"));
const LoopUntilDrawer = lazy(() => import("./loop-until"));

/** Renders QuestionSetupContentV2 only when node has a type. ContentV2 provides its own QuestionProvider. */
const QuestionSetupGate = forwardRef((props, ref) => {
  const nodeData = props?.nodeData;
  if (!nodeData?.type) return null;
  return React.createElement(QuestionSetupContentV2, { ref, ...props });
});
QuestionSetupGate.displayName = "QuestionSetupGate";

export const getExtensionComponent = (type, category, node) => {
  if (category === "Question") {
    return QuestionSetupGate;
  }
  switch (type) {
    case IF_ELSE_TYPE:
      return IfElseDialog;
    case IF_ELSE_TYPE_V2:
      return IfElseDialogV2;
    case HTTP_TYPE:
      return HttpDialog;
    case DELAY_TYPE:
    case DELAY_TYPE_V2:
      return DelayDialogV2;
    case INPUT_SETUP_TYPE:
      return StartNodeDialog;
    case SUCCESS_SETUP_TYPE:
    case END_NODE_TYPE:
      return EndNodeDialogV3;
    case CREATE_TYPE:
    case CREATE_RECORD_V2_TYPE:
      return CreateRecordDialog;
    case FIND_ALL_TYPE:
    case FIND_ALL_V2_TYPE:
      return FindAllRecordDialog;
    case FIND_ONE_TYPE:
    case FIND_ONE_V2_TYPE:
      return FindOneRecordDialog;
    case UPDATE_TYPE:
    case UPDATE_RECORD_V2_TYPE:
      return UpdateRecordDialog;
    case DELETE_TYPE:
    case DELETE_V2_TYPE:
      return DeleteRecordDialog;
    case EXECUTE_TYPE:
    case EXECUTE_V2_TYPE:
      return ExecuteQueryDialog;
    case TRANSFORMER_TYPE:
    case TRANSFORMER_TYPE_V3:
      return TransformerDialog;
    case FORMULA_FX_TYPE:
      return FormulaFXDialog;
    case WORKFLOW_SETUP_TYPE:
      return WorkflowSetupDialog;
    case CONNECTION_SETUP_TYPE:
      return ConnectionSetupDialog;
    case INTEGRATION_TYPE:
      return IntegrationNodeDialog;
    case ITERATOR_TYPE:
      return IteratorDialog;
    case ARRAY_AGGREGATOR_TYPE:
      return ArrayAggregatorDialog;
    case MATCH_PATTERN_TYPE:
      return MatchPatternDialog;
    case LOG_TYPE:
    case LOG_TYPE_V2:
      return LogDialogV2;
    case CREATE_SHEET_RECORD_TYPE:
    case "CREATE_SHEET_RECORD_V3":
      return CreateSheetRecordDialogV3;
    case FIND_ONE_SHEET_RECORD_TYPE:
    case "FIND_ONE_SHEET_RECORD_V3":
      return FindOneSheetRecordDialogV3;
    case FIND_ALL_SHEET_RECORD_TYPE:
    case "FIND_ALL_SHEET_RECORD_V3":
      return FindAllSheetRecordDialogV3;
    case DELETE_SHEET_RECORD_TYPE:
    case "DELETE_SHEET_RECORD_V3":
      return DeleteSheetRecordDialogV3;
    case TINY_GPT_TYPE:
      return TinyGPTDialog;
    case TINY_GPT_RESEARCHER_TYPE:
      return TinyGPTResearcherDialog;
    case TINY_GPT_ANALYZER_TYPE:
      return TinyGPTAnalyzerDialog;
    case TINY_GPT_WRITER_TYPE:
      return TinyGPTWriterDialog;
    case TINY_GPT_SUMMARIZER_TYPE:
      return TinyGPTSummarizerDialog;
    case TINY_GPT_TRANSLATOR_TYPE:
      return TinyGPTTranslatorDialog;
    case TINY_GPT_LEARNING_TYPE:
      return TinyGPTLearningDialog;
    case TINY_GPT_CONSULTANT_TYPE:
      return TinyGPTConsultantDialog;
    case TINY_GPT_CREATIVE_TYPE:
      return TinyGPTCreativeDialog;
    case UPDATE_SHEET_RECORD_TYPE:
    case "UPDATE_SHEET_RECORD_V3":
      return UpdateSheetRecordDialogV3;
    case SKIP_TYPE:
      return SkipDialogV2;
    case BREAK_TYPE:
      return BreakDialogV2;
    case WEBHOOK_TYPE:
      return WebhookDialog;
    case TIME_BASED_TRIGGER:
      return TimeBasedTriggerDialog;
    case FIND_ALL_SHEET_RECORD_V2_TYPE_DEPRECATED:
      return FindAllSheetRecordDialogV2;
    case FIND_ONE_SHEET_RECORD_V2_TYPE_DEPRECATED:
      return FindOneSheetRecordDialogV2;
    case AGENT_INPUT:
      return AgentInputNodeDrawer;
    case AGENT_TINY_SCOUT:
      return AgentTinyScoutNodeDrawer;
    case AGENT_TINY_COMPOSER:
    case AGENT_TINY_COMPOSER_V2:
    case AGENT_TINY_COMPOSER_V3:
      return AgentTinyComposerNodeDrawerV3;
    case SHEET_TRIGGER:
      return SheetTriggerDialog;
    case UPDATE_SHEET_RECORDS_TYPE:
    case UPDATE_SHEET_RECORD_TYPE_V2_DEPRECATED:
      return UpdateSheetRecordsDialog;
    case CREATE_SHEET_RECORD_TYPE_V2_DEPRECATED:
      return CreateSheetRecordDialogV2;
    case HITL_TYPE:
    case HITL_V2_TYPE:
      return HITLDrawerV2;
    // case AGENT_WORKFLOW:
    //   return UserAgentDrawer;
    case AGENT_OUTPUT:
      return AgentOutputDialog;
    case JUMP_TO_TYPE:
      return JumpToNodeDrawerV2;
    case TRIGGER_SETUP_TYPE:
      return TriggerSetupDialog;
    case TOOL_INPUT_TYPE:
      return ToolInputDialog;
    case TOOL_OUTPUT_TYPE:
      return ToolOutputDialog;
    case AGENT_WORKFLOW:
      return AgentNodeV3Drawer;
    case SEND_EMAIL_TO_YOURSELF_TYPE:
    case SEND_EMAIL_TO_YOURSELF_V2_TYPE:
      return SendEmailToYourselfDialogV2;
    case TINY_SEARCH:
      return TinySearchNodeDrawer;
    case TINY_SEARCH_V2:
      return TinySearchNodeV3Drawer;
    case TINY_SEARCH_V3:
      return TinySearchNodeV3Drawer;
    case PERSON_ENRICHMENT_TYPE:
    case PERSON_ENRICHMENT_V2_TYPE:
      return PeopleEnrichmentDialog;
    case EMAIL_ENRICHMENT_TYPE:
    case EMAIL_ENRICHMENT_V2_TYPE:
      return EmailEnrichmentDialog;
    case COMPANY_ENRICHMENT_TYPE:
    case COMPANY_ENRICHMENT_V2_TYPE:
      return CompanyEnrichmentDialog;
    case JUMP_TO_TYPE_V2:
      return JumpToNodeDrawerV2;
    case ITERATOR_TYPE_V2:
      return IteratorDialogV2;
    case ARRAY_AGGREGATOR_TYPE_V2:
      return ArrayAggregatorDialogV2;
    case SHEET_TRIGGER_V2_TYPE:
      return SheetTriggerDialogV2;
    case WEBHOOK_TYPE_V2:
      return WebhookDialogV2;
    case CONNECTION_SETUP_V2_TYPE:
      return ConnectionSetupDialogV2;
    case AGENT_INPUT_V2_TYPE:
      return AgentInputNodeDrawerV2;
    case AGENT_OUTPUT_V2_TYPE:
      return AgentOutputDialogV2;
    case TIME_BASED_TRIGGER_V2_TYPE:
      return TimeBasedTriggerDialogV2;
    case START_NODE_V2_TYPE:
      return StartNodeDialogV2;
    case TOOL_INPUT_V2_TYPE:
      return ToolInputDialogV2;
    case TOOL_OUTPUT_V2_TYPE:
      return ToolOutputDialogV2;
    case AGENT_WORKFLOW_V3:
      return AgentNodeV3Drawer;
    case LOOP_START_TYPE:
      return LoopStartDrawer;
    case LOOP_END_TYPE:
      return LoopEndDrawer;
    case FOR_EACH_TYPE:
      return ForEachDrawer;
    case REPEAT_TYPE:
      return RepeatDrawer;
    case LOOP_UNTIL_TYPE:
      return LoopUntilDrawer;
    default:
      console.warn(
        `[getExtensionComponent] No component found for node type: "${type}", category: "${category}"`,
        { type, category, nodeData: node }
      );
      return null;
  }
};
