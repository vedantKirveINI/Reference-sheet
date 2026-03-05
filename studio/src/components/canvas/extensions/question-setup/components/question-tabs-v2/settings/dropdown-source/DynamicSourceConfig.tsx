import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import HelperText from "../../components/HelperText";
import { TINY_TABLE_NODE_TYPES } from "@/module/question-data/components/dropdown/utils/tinyTableDetector";

interface DynamicSourceConfigProps {
  variableBlocks: any[];
  idAccessor: string;
  labelAccessor: string;
  variables: Record<string, any>;
  onVariableChange: (blocks: any[]) => void;
  onIdAccessorChange: (accessor: string) => void;
  onLabelAccessorChange: (accessor: string) => void;
}

const filterOutTinyTableNodes = (variables: Record<string, any>): Record<string, any> => {
  if (!variables) return {};

  const filteredVariables = { ...variables };

  if (Array.isArray(filteredVariables.nodes)) {
    filteredVariables.nodes = filteredVariables.nodes.filter((node: any) => {
      const nodeType = node?.nodeType || node?.type || "";
      return !TINY_TABLE_NODE_TYPES.includes(nodeType);
    });
  }

  return filteredVariables;
};

const DynamicSourceConfig = ({
  variableBlocks,
  idAccessor,
  labelAccessor,
  variables,
  onVariableChange,
  onIdAccessorChange,
  onLabelAccessorChange,
}: DynamicSourceConfigProps) => {
  const filteredVariables = useMemo(() => {
    return filterOutTinyTableNodes(variables);
  }, [variables]);


  // Extract schema keys and visibility for id/label when we have a single array variable with schema
  const { schemaKeys, shouldShowIdLabelFields } = useMemo(() => {
    // Check if we have exactly one variable block
    if (variableBlocks?.length !== 1) {
      return { schemaKeys: null, shouldShowIdLabelFields: false };
    }

    const block = variableBlocks[0];

    // Check if returnType is "array" and has variableData with schema
    if (
      block?.returnType === "array" &&
      block?.variableData?.schema &&
      Array.isArray(block.variableData.schema) &&
      block.variableData.schema.length > 0
    ) {
      // Get the first schema item (usually the array item structure)
      const firstSchemaItem = block.variableData.schema[0];
      const isObjectType = firstSchemaItem?.type === "object";

      // Extract keys from the schema array; exclude array and object types (same as TinyTableSourceConfig)
      if (firstSchemaItem?.schema && Array.isArray(firstSchemaItem.schema)) {
        const keys = firstSchemaItem.schema
          .filter(
            (field: { type?: string }) =>
              field?.type !== "array" && field?.type !== "object"
          )
          .map((item: any) => item?.key)
          .filter((key: any) => key != null);
        return { schemaKeys: keys, shouldShowIdLabelFields: isObjectType };
      }
      return { schemaKeys: null, shouldShowIdLabelFields: isObjectType };
    }

    return { schemaKeys: null, shouldShowIdLabelFields: false };
  }, [variableBlocks]);

  const shouldShowDropdowns = schemaKeys && schemaKeys.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Source Data (Array)</Label>
        <FormulaBar
          isReadOnly={false}
          hideInputBorders={false}
          defaultInputContent={variableBlocks}
          onInputContentChanged={onVariableChange}
          wrapContent
          variables={filteredVariables}
          placeholder="Select a variable containing your dropdown items..."
          slotProps={{
            container: {
              className: "min-h-[60px]",
            },
          }}
        />
        <HelperText>
          Use the fx button to select a variable from an HTTP response, integration, or other dynamic source. TinyTable nodes are excluded here - use the TinyTable option instead.
        </HelperText>
      </div>

      {shouldShowIdLabelFields && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Label Field</Label>
              {shouldShowDropdowns ? (
                <Select value={labelAccessor} onValueChange={onLabelAccessorChange}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select label..." />
                  </SelectTrigger>
                  <SelectContent>
                    {schemaKeys.map((key) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                      >
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={labelAccessor}
                  onChange={(e) => onLabelAccessorChange(e.target.value)}
                  placeholder="e.g., name"
                  className="h-8 text-sm"
                />
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">ID Field</Label>
              {shouldShowDropdowns ? (
                <Select value={idAccessor} onValueChange={onIdAccessorChange}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select ID..." />
                  </SelectTrigger>
                  <SelectContent>
                    {schemaKeys.map((key) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                      >
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={idAccessor}
                  onChange={(e) => onIdAccessorChange(e.target.value)}
                  placeholder="e.g., id"
                  className="h-8 text-sm"
                />
              )}
            </div>
          </div>
          <HelperText>
            The text displayed to users in the dropdown list. Only simple fields
            (e.g. string, number, date) are shown; array and object types are
            excluded.
          </HelperText>
        </>
      )}
    </div>
  );
};

export default DynamicSourceConfig;
