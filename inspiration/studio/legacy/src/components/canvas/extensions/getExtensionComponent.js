import { lazy } from "react";
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
  MATCH_PATTERN_TYPE,
  SUCCESS_SETUP_TYPE,
  TINY_GPT_TYPE,
  TRANSFORMER_TYPE,
  TRANSFORMER_TYPE_V2,
  FORMULA_FX_TYPE,
  UPDATE_TYPE,
  UPDATE_SHEET_RECORD_TYPE,
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
  IF_ELSE_TYPE_V2,
  FIND_ONE_SHEET_RECORD_V2_TYPE,
  FIND_ALL_SHEET_RECORD_V2_TYPE,
  AGENT_TINY_SCOUT,
  AGENT_TINY_COMPOSER,
  SHEET_TRIGGER,
  UPDATE_SHEET_RECORD_TYPE_V2,
  CREATE_SHEET_RECORD_TYPE_V2,
  DELETE_SHEET_RECORD_TYPE,
  HITL_TYPE,
  AGENT_WORKFLOW,
  AGENT_OUTPUT,
  AGENT_INPUT,
  JUMP_TO_TYPE,
  TRIGGER_SETUP_TYPE,
  TOOL_INPUT_TYPE,
  TOOL_OUTPUT_TYPE,
  SEND_EMAIL_TO_YOURSELF_TYPE,
  TINY_SEARCH,
  TINY_SEARCH_V2,
  PERSON_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_TYPE,
} from "./constants/types";
import EndNodeV2Drawer from "./end-v2";
import ToolInputDialog from "./tool-input";
import ToolOutputDialog from "./tool-output";
import AgentNodeDrawer from "./agent-node";
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
const EndNodeDialog = lazy(() => import("./end"));
const FormNodeDialog = lazy(() => import("./form"));
const HttpDialog = lazy(() => import("./http"));
const IfElseDialog = lazy(() => import("./if-else"));
const IteratorDialog = lazy(() => import("./iterator"));
const LogDialog = lazy(() => import("./log"));
const QuestionSetupWrapper = lazy(() => import("./question-setup"));
const StartNodeDialog = lazy(() => import("./start"));
const TransformerDialog = lazy(() => import("./transformer"));
const TransformerV2Dialog = lazy(() => import("./transformer-v2"));
const FormulaFXDialog = lazy(() => import("./formula-fx"));
const WorkflowSetupDialog = lazy(() => import("./workflow-setup"));
const CreateSheetRecordDialog = lazy(() => import("./sheet/create-record"));
const FindOneSheetRecordDialog = lazy(() => import("./sheet/find-one"));
const TinyGPTDialog = lazy(() => import("./tiny-gpt"));
const UpdateSheetRecordDialog = lazy(() => import("./sheet/update-record"));
const FindAllSheetRecordDialog = lazy(() => import("./sheet/find-all"));
const DeleteSheetRecordDialog = lazy(() => import("./sheet/delete-record"));
const TinyGPTResearcherDialog = lazy(() => import("./tiny-gpt-researcher"));
const TinyGPTWriterDialog = lazy(() => import("./tiny-gpt-writer"));
const SkipDialog = lazy(() => import("./skip"));
const BreakDialog = lazy(() => import("./break"));
const TinyGPTAnalyzerDialog = lazy(() => import("./tiny-gpt-analyzer"));
const TinyGPTSummarizerDialog = lazy(() => import("./tiny-gpt-summarizer"));
const TinyGPTTranslatorDialog = lazy(() => import("./tiny-gpt-translator"));
const TinyGPTLearningDialog = lazy(() => import("./tiny-gpt-learning"));
const TinyGPTConsultantDialog = lazy(() => import("./tiny-gpt-consultant"));
const TinyGPTCreativeDialog = lazy(() => import("./tiny-gpt-creative"));
const WebhookDialog = lazy(() => import("./webhook"));
const TimeBasedTriggerDialog = lazy(() => import("./time-based-trigger"));
const IfElseDialogV2 = lazy(() => import("./if-else-v2"));
const FindAllSheetRecordDialogV2 = lazy(() => import("./sheet/find-all-v2"));
const FindOneSheetRecordDialogV2 = lazy(() => import("./sheet/find-one-v2"));
// const AgentInputNodeDrawer = lazy(() => import("./agent/input"));
// DEPRECATED: agent-scout V1 removed - use agent-scout-v3 from main src
// const AgentTinyScoutNodeDrawer = lazy(() => import("./agent/agent-scout"));
const AgentTinyComposerNodeDrawer = lazy(
  () => import("./agent/agent-composer")
);
const SheetTriggerDialog = lazy(() => import("./sheet/trigger"));
const UpdateSheetRecordDialogV2 = lazy(
  () => import("./sheet/update-record-v2")
);
const CreateSheetRecordDialogV2 = lazy(
  () => import("./sheet/create-record-v2")
);
const HITLDrawer = lazy(() => import("./hitl"));
const UserAgentDrawer = lazy(() => import("./user-agent"));
const AgentOutputDialog = lazy(() => import("./agent-output"));
const AgentInputNodeDrawer = lazy(() => import("./agent-input"));
const JumpToNodeDrawer = lazy(() => import("./jump-to"));
const TriggerDrawer = lazy(() => import("./triggers"));
const TinySearchNodeDrawer = lazy(() => import("./tiny-search"));
const TinySearchNodeV2Drawer = lazy(() => import("./tiny-search-v2"));
const PeopleEnrichmentDialog = lazy(() => import("./enrichment/person"));
const EmailEnrichmentDialog = lazy(() => import("./enrichment/email"));
const CompanyEnrichmentDialog = lazy(() => import("./enrichment/company"));

export const getExtensionComponent = (type, category, node) => {
  if (category === "Question") {
    return QuestionSetupWrapper;
  }
  switch (type) {
    case IF_ELSE_TYPE:
      return IfElseDialog;
    case IF_ELSE_TYPE_V2:
      return IfElseDialogV2;
    case HTTP_TYPE:
      return HttpDialog;
    case DELAY_TYPE:
      return DelayDialog;
    case INPUT_SETUP_TYPE:
      return StartNodeDialog;
    case SUCCESS_SETUP_TYPE:
      if (node?.noConfigRequired) {
        return EndNodeV2Drawer;
      }
      return EndNodeDialog;
    case CREATE_TYPE:
      return CreateRecordDialog;
    case FIND_ALL_TYPE:
      return FindAllRecordDialog;
    case FIND_ONE_TYPE:
      return FindOneRecordDialog;
    case UPDATE_TYPE:
      return UpdateRecordDialog;
    case DELETE_TYPE:
      return DeleteRecordDialog;
    case EXECUTE_TYPE:
      return ExecuteQueryDialog;
    case TRANSFORMER_TYPE:
      return TransformerDialog;
    case TRANSFORMER_TYPE_V2:
      return TransformerV2Dialog;
    case FORMULA_FX_TYPE:
      return FormulaFXDialog;
    case WORKFLOW_SETUP_TYPE:
      return WorkflowSetupDialog;
    case CONNECTION_SETUP_TYPE:
      return ConnectionSetupDialog;
    case INTEGRATION_TYPE:
      return FormNodeDialog;
    case ITERATOR_TYPE:
      return IteratorDialog;
    case ARRAY_AGGREGATOR_TYPE:
      return ArrayAggregatorDialog;
    case MATCH_PATTERN_TYPE:
      return MatchPatternDialog;
    case LOG_TYPE:
      return LogDialog;
    case CREATE_SHEET_RECORD_TYPE:
      return CreateSheetRecordDialog;
    case FIND_ONE_SHEET_RECORD_TYPE:
      return FindOneSheetRecordDialog;
    case FIND_ALL_SHEET_RECORD_TYPE:
      return FindAllSheetRecordDialog;
    case DELETE_SHEET_RECORD_TYPE:
      return DeleteSheetRecordDialog;
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
      return UpdateSheetRecordDialog;
    case SKIP_TYPE:
      return SkipDialog;
    case BREAK_TYPE:
      return BreakDialog;
    case WEBHOOK_TYPE:
      return WebhookDialog;
    case TIME_BASED_TRIGGER:
      return TimeBasedTriggerDialog;
    case FIND_ALL_SHEET_RECORD_V2_TYPE:
      return FindAllSheetRecordDialogV2;
    case FIND_ONE_SHEET_RECORD_V2_TYPE:
      return FindOneSheetRecordDialogV2;
    case AGENT_INPUT:
      return AgentInputNodeDrawer;
    // DEPRECATED: agent-scout V1 removed
    // case AGENT_TINY_SCOUT:
    //   return AgentTinyScoutNodeDrawer;
    case AGENT_TINY_COMPOSER:
      return AgentTinyComposerNodeDrawer;
    case SHEET_TRIGGER:
      return SheetTriggerDialog;
    case UPDATE_SHEET_RECORD_TYPE_V2:
      return UpdateSheetRecordDialogV2;
    case CREATE_SHEET_RECORD_TYPE_V2:
      return CreateSheetRecordDialogV2;
    case HITL_TYPE:
      return HITLDrawer;
    // case AGENT_WORKFLOW:
    //   return UserAgentDrawer;
    case AGENT_OUTPUT:
      return AgentOutputDialog;
    case JUMP_TO_TYPE:
      return JumpToNodeDrawer;
    case TRIGGER_SETUP_TYPE:
      return TriggerDrawer;
    case TOOL_INPUT_TYPE:
      return ToolInputDialog;
    case TOOL_OUTPUT_TYPE:
      return ToolOutputDialog;
    case AGENT_WORKFLOW:
      return AgentNodeDrawer;
    case SEND_EMAIL_TO_YOURSELF_TYPE:
      return SendEmailToYourselfDialog;
    case TINY_SEARCH:
      return TinySearchNodeDrawer;
    case TINY_SEARCH_V2:
      return TinySearchNodeV2Drawer;
    case PERSON_ENRICHMENT_TYPE:
      return PeopleEnrichmentDialog;
    case EMAIL_ENRICHMENT_TYPE:
      return EmailEnrichmentDialog;
    case COMPANY_ENRICHMENT_TYPE:
      return CompanyEnrichmentDialog;
    default:
      return null;
  }
};
