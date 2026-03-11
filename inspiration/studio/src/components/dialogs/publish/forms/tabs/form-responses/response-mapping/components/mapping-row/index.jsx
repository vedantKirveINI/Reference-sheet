import React, { useCallback } from "react";
import ColumnNameInput from "../column-name-input";
import ColumnValueInput from "../column-value-input";
import DeleteButton from "../delete-button";
import { TableRow, TableCell } from "@/components/ui/table";
import { validateFormResponsesMapping } from "../../../../../utils/formResponses";
import { cn } from "@/lib/utils";

const MappingRow = ({
  row,
  rowIndex,
  questions = [],
  onUpdate,
  onDelete,
  names = [],
  dataTestId,
}) => {
  const handleNameChange = useCallback(
    (value) => {
      onUpdate(rowIndex, { ...row, name: value });
    },
    [rowIndex, row, onUpdate],
  );

  const handleTypeChange = useCallback(
    (value) => {
      onUpdate(rowIndex, {
        ...row,
        columnType: value,
        value: value === "static" ? "" : "",
      });
    },
    [rowIndex, row, onUpdate],
  );

  const handleValueChange = useCallback(
    (value) => {
      if (value?.settings && value?.type) {
        onUpdate(rowIndex, {
          ...row,
          options: value?.settings || {},
          type: value?.type,
          value: value?.key,
        });
      } else {
        onUpdate(rowIndex, {
          ...row,
          value: value,
        });
      }
    },
    [rowIndex, row, onUpdate],
  );

  const handleDelete = useCallback(() => {
    onDelete(rowIndex);
  }, [rowIndex, onDelete]);

  const hasError = validateFormResponsesMapping({
    mappings: [row],
    questions: Array.isArray(questions) ? questions : [],
  });

  return (
    <TableRow
      className={cn(
        "border-b border-border hover:bg-muted/50 transition-colors",
        hasError && "bg-destructive/5 hover:bg-destructive/10"
      )}
      data-testid={`${dataTestId}-${rowIndex}`}
    >
      <TableCell className="px-3 py-1.5">
        <ColumnNameInput
          value={row.name}
          onChange={handleNameChange}
          names={Array.isArray(names) ? names : []}
          rowIndex={rowIndex}
          dataTestId={`${dataTestId}-name`}
        />
      </TableCell>

      <TableCell className="px-3 py-1.5">
        <ColumnValueInput
          value={row.value}
          columnType={row.columnType}
          questions={Array.isArray(questions) ? questions : []}
          onChange={handleValueChange}
          dataTestId={`${dataTestId}-value`}
        />
      </TableCell>

      <TableCell className="px-2 py-1.5 w-[52px]">
        <DeleteButton
          onClick={handleDelete}
          dataTestId={`${dataTestId}-delete`}
        />
      </TableCell>
    </TableRow>
  );
};

export default MappingRow;
