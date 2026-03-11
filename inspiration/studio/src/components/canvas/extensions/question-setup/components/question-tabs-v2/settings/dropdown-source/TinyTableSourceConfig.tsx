import { useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Table2 } from "lucide-react";
import HelperText from "../../components/HelperText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormulaBar } from "@src/module/ods";
import { useTinyTableFields } from "@/module/question-data/components/dropdown/hooks/useTinyTableFields";
import { TINY_TABLE_NODE_TYPES } from "@/module/question-data/components/dropdown/utils/tinyTableDetector";

interface TinyTableSourceConfigProps {
  variableBlocks: any[];
  idAccessor: string;
  labelAccessor: string;
  variables: Record<string, any>;
  onVariableChange: (blocks: any[], nodeId?: string) => void;
  onIdAccessorChange: (accessor: string) => void;
  onLabelAccessorChange: (accessor: string) => void;
}

const extractNodeIdFromBlocks = (blocks: any[]): string | undefined => {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return undefined;
  }
  for (const block of blocks) {
    const variableData = block?.variableData;
    if (variableData && variableData.nodeId) {
      return variableData.nodeId;
    }
  }
  return undefined;
};

const filterToTinyTableNodes = (variables: Record<string, any>): Record<string, any> => {
  if (!variables || typeof variables !== "object") {
    return variables;
  }

  const filteredVariables = { ...variables };

  if (Array.isArray(filteredVariables.nodes)) {
    filteredVariables.nodes = filteredVariables.nodes.filter((node: any) => {
      const nodeType = node?.nodeType || node?.type || "";
      return TINY_TABLE_NODE_TYPES.includes(nodeType);
    });
  }

  return filteredVariables;
};

const TinyTableSourceConfig = ({
  variableBlocks,
  idAccessor,
  labelAccessor,
  variables,
  onVariableChange,
  onIdAccessorChange,
  onLabelAccessorChange,
}: TinyTableSourceConfigProps) => {
  const filteredVariables = useMemo(() => {
    return filterToTinyTableNodes(variables);
  }, [variables]);

  const {  hasTinyTableSource, sourceNodeInfo } = useTinyTableFields({
    blocks: variableBlocks || [],
    variables: variables || {},
  });

  const hasSelectedNode = variableBlocks && variableBlocks.length > 0;

  // Extract schema fields from sourceNodeInfo; exclude array and object types
  const schemaFields = useMemo(() => {
    const raw = sourceNodeInfo?.schema?.[0]?.schema;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter(
      (field: { type?: string }) =>
        field?.type !== "array" && field?.type !== "object"
    );
  }, [sourceNodeInfo]);

  const hasFields = schemaFields.length > 0;

  const autocompleteOptions = useMemo(() => {
    return schemaFields.map((field: any) => ({
      value: field.key,
      label: field.label,
    }));
  }, [schemaFields]);

  // Auto-set idAccessor to "__id" when TinyTable source is detected
  useEffect(() => {
    if (hasSelectedNode && hasTinyTableSource && idAccessor !== "__id") {
      onIdAccessorChange("__id");
    }
  }, [hasSelectedNode, hasTinyTableSource, idAccessor, onIdAccessorChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Table2 className="w-4 h-4 text-indigo-500" />
          Select TinyTable Node
        </Label>
        <FormulaBar
          isReadOnly={false}
          hideInputBorders={false}
          defaultInputContent={variableBlocks}
          onInputContentChanged={(content) => {
            const nodeId = extractNodeIdFromBlocks(content);
            onVariableChange(content, nodeId);
          }}
          wrapContent={true}
          variables={filteredVariables}
          slotProps={{
            container: {
              "data-testid": "tinytable-source-formula-bar",
            },
          }}
        />
        <HelperText>
          Select a "Find All Records" node from your workflow.
        </HelperText>
      </div>

      {hasSelectedNode && !hasTinyTableSource && sourceNodeInfo && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            The selected node is not a TinyTable query node. Please select a "Find All Records" node.
          </p>
        </div>
      )}

      {hasSelectedNode && hasTinyTableSource && (
        <div className="space-y-2">
            <Label className="text-sm font-medium">Label Field</Label>
            {hasFields ? (
              <Select value={labelAccessor} onValueChange={onLabelAccessorChange}>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Select label..." />
                </SelectTrigger>
                <SelectContent>
                  {autocompleteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Configure TinyTable first
              </p>
            )}
            <HelperText>
              The text displayed to users in the dropdown list. Only simple
              fields (e.g. string, number, date) are shown; array and object
              types are excluded.
            </HelperText>
        </div>
      )}
    </div>
  );
};

export default TinyTableSourceConfig;
