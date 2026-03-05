import { useState, useEffect, useMemo, useCallback } from "react";
import {
  extractSourceNodeFromBlocks,
  getFieldOptionsFromSourceNode,
  SourceNodeInfo,
  FieldOption,
} from "../utils/tinyTableDetector";

interface UseTinyTableFieldsProps {
  blocks: any[];
  variables: Record<string, any>;
}

interface UseTinyTableFieldsResult {
  sourceNodeInfo: SourceNodeInfo | null;
  fieldOptions: FieldOption[];
  hasTinyTableSource: boolean;
  getFieldLabelById: (fieldId: string) => string;
}

export const useTinyTableFields = ({
  blocks,
  variables,
}: UseTinyTableFieldsProps): UseTinyTableFieldsResult => {
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);

  const sourceNodeInfo = useMemo(() => {
    return extractSourceNodeFromBlocks(blocks);
  }, [blocks]);

  const hasTinyTableSource = useMemo(() => {
    return sourceNodeInfo?.isTinyTable || false;
  }, [sourceNodeInfo]);

  useEffect(() => {
    if (sourceNodeInfo && (sourceNodeInfo.isTinyTable || sourceNodeInfo.isDatabase)) {
      const fields = getFieldOptionsFromSourceNode(sourceNodeInfo, variables);
      setFieldOptions(fields);
    } else {
      setFieldOptions([]);
    }
  }, [sourceNodeInfo, variables]);

  const getFieldLabelById = useCallback(
    (fieldId: string): string => {
      const field = fieldOptions.find((f) => f.id === fieldId);
      return field?.label || fieldId;
    },
    [fieldOptions]
  );

  return {
    sourceNodeInfo,
    fieldOptions,
    hasTinyTableSource,
    getFieldLabelById,
  };
};
