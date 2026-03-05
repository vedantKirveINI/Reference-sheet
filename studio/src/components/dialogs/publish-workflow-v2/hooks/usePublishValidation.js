import { useMemo } from "react";
import isEmpty from "lodash/isEmpty";
import { validateNodeConfig } from "@src/pages/ic-canvas/utils/validateNodeConfig";
import {
  WEBHOOK_TYPE,
  WEBHOOK_TYPE_V2,
  TIME_BASED_TRIGGER,
  TIME_BASED_TRIGGER_V2_TYPE,
  INPUT_SETUP_TYPE,
  SHEET_TRIGGER,
  SHEET_TRIGGER_V2_TYPE,
  SHEET_DATE_FIELD_TRIGGER,
  FORM_TRIGGER,
  TRIGGER_SETUP_TYPE,
  IF_ELSE_TYPE,
  IF_ELSE_TYPE_V2,
} from "@src/components/canvas/extensions/constants/types";

const TRIGGER_TYPES = new Set([
  WEBHOOK_TYPE,
  WEBHOOK_TYPE_V2,
  TIME_BASED_TRIGGER,
  TIME_BASED_TRIGGER_V2_TYPE,
  INPUT_SETUP_TYPE,
  SHEET_TRIGGER,
  SHEET_TRIGGER_V2_TYPE,
  SHEET_DATE_FIELD_TRIGGER,
  FORM_TRIGGER,
  TRIGGER_SETUP_TYPE,
]);

const SKIP_TYPES = new Set([
  "STICKY_NOTE",
  "NOTE",
  "COMMENT",
  "GROUP",
  "LOOP_END",
]);

const IF_ELSE_TYPES = new Set([IF_ELSE_TYPE, IF_ELSE_TYPE_V2]);

function getNodeDisplayName(nodeData) {
  return (
    nodeData?.description ||
    nodeData?.text ||
    nodeData?.name ||
    nodeData?.data?.description ||
    nodeData?.data?.name ||
    nodeData?.data?.text ||
    nodeData?.type ||
    nodeData?.data?.type ||
    "Unnamed Step"
  );
}

function getNodeIcon(nodeData) {
  return nodeData?._src || nodeData?.src || nodeData?.data?._src || nodeData?.data?.src || null;
}

function getNodeType(nodeData) {
  return nodeData?.type || nodeData?.data?.type;
}

function getTfData(nodeData) {
  return nodeData?.tf_data || nodeData?.data?.tf_data;
}

function getGoData(nodeData) {
  return nodeData?.go_data || nodeData?.data?.go_data;
}

function isTriggerNode(nodeData) {
  const type = getNodeType(nodeData);
  if (TRIGGER_TYPES.has(type)) return true;
  if (type === "INTEGRATION" && (nodeData?.subType || nodeData?.data?.subType) === "TRIGGER_SETUP") return true;
  return false;
}

function isExecutable(nodeData) {
  const tfData = getTfData(nodeData);
  const goData = getGoData(nodeData);
  if (tfData?.config?.is_executable === false) return false;
  if (goData?.is_executable === false) return false;
  if (nodeData?.is_executable === false) return false;
  if (nodeData?.data?.is_executable === false) return false;
  return true;
}

function shouldSkipNode(nodeData) {
  const type = getNodeType(nodeData);
  if (!type) return true;
  if (SKIP_TYPES.has(type)) return true;
  if (!isExecutable(nodeData)) return true;
  return false;
}

function checkTfDataEmpty(nodeData) {
  if (isTriggerNode(nodeData)) return null;
  const tfData = getTfData(nodeData);
  if (isEmpty(tfData)) {
    return {
      message: "This step hasn't been configured yet — open it to set it up",
      severity: "error",
      hint: "The server will reject this workflow because this node has no configuration data",
      field: "tf_data",
    };
  }
  return null;
}

function checkIfElseNode(nodeData) {
  const type = getNodeType(nodeData);
  if (!IF_ELSE_TYPES.has(type)) return null;

  const tfData = getTfData(nodeData);
  const inputs = tfData?.inputs;

  if (!inputs?.length || inputs.length < 2) {
    return {
      message: "Condition node needs at least an If and Else branch configured",
      severity: "error",
      hint: "Add conditions to both branches before publishing",
      field: "tf_data.inputs",
    };
  }

  for (const input of inputs) {
    if (!input?.value || !input?.value?.blocks?.length) {
      return {
        message: "One or more condition branches are empty — configure the condition logic",
        severity: "error",
        hint: "Each branch needs at least one condition block",
        field: "tf_data.inputs.value.blocks",
      };
    }
  }

  return null;
}

export function usePublishValidation(nodes = []) {
  const validationResults = useMemo(() => {
    const issues = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const nodeData of nodes) {
      if (shouldSkipNode(nodeData)) continue;

      const nodeErrors = [];
      const nodeWarnings = [];

      const tfDataIssue = checkTfDataEmpty(nodeData);
      if (tfDataIssue) {
        nodeErrors.push(tfDataIssue);
      } else {
        const ifElseIssue = checkIfElseNode(nodeData);
        if (ifElseIssue) {
          nodeErrors.push(ifElseIssue);
        }

        const { errors, warnings, validationIssues } = validateNodeConfig(nodeData);

        if (validationIssues) {
          for (const issue of validationIssues) {
            if (issue.severity === "error") nodeErrors.push(issue);
            else nodeWarnings.push(issue);
          }
        } else {
          for (const msg of (errors || [])) {
            nodeErrors.push({ message: msg, severity: "error", hint: "" });
          }
          for (const msg of (warnings || [])) {
            nodeWarnings.push({ message: msg, severity: "warning", hint: "" });
          }
        }
      }

      if (nodeErrors.length > 0 || nodeWarnings.length > 0) {
        issues.push({
          nodeKey: String(nodeData?.key ?? nodeData?.data?.key ?? ""),
          nodeName: getNodeDisplayName(nodeData),
          nodeIcon: getNodeIcon(nodeData),
          nodeType: getNodeType(nodeData) || "",
          isTrigger: isTriggerNode(nodeData),
          errors: nodeErrors,
          warnings: nodeWarnings,
        });
        totalErrors += nodeErrors.length;
        totalWarnings += nodeWarnings.length;
      }
    }

    issues.sort((a, b) => {
      if (a.isTrigger && !b.isTrigger) return -1;
      if (!a.isTrigger && b.isTrigger) return 1;
      if (a.errors.length > 0 && b.errors.length === 0) return -1;
      if (a.errors.length === 0 && b.errors.length > 0) return 1;
      return 0;
    });

    return {
      issues,
      totalErrors,
      totalWarnings,
      hasBlockingErrors: totalErrors > 0,
      hasWarnings: totalWarnings > 0,
      isClean: totalErrors === 0 && totalWarnings === 0,
    };
  }, [nodes]);

  return validationResults;
}
