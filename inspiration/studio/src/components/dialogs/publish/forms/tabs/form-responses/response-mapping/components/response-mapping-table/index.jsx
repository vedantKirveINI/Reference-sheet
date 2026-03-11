import React, { useRef } from "react";
import MappingRow from "../mapping-row";
import { useResponseMapping } from "../../hooks/use-response-mapping";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const ResponseMappingTable = ({
  questions = [],
  mappings = [],
  onChange,
  dataTestId = "response-mapping-table",
}) => {
  const tableRef = useRef(null);
  const { columnNames, handleUpdateRow, handleAddRow, handleDeleteRow } =
    useResponseMapping({ mappings, onChange });

  return (
    <div className="w-full border border-border rounded-lg overflow-hidden bg-card" data-testid={dataTestId}>
      <div ref={tableRef} className="relative w-full overflow-auto max-h-[300px]">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow className="border-b border-border hover:bg-muted">
              <TableHead className="h-9 px-3 font-semibold text-foreground text-sm">Name</TableHead>
              <TableHead className="h-9 px-3 font-semibold text-foreground text-sm">Value</TableHead>
              <TableHead className="h-9 px-2 w-[52px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {mappings.map((row, index) => (
              <MappingRow
                key={index}
                row={row}
                rowIndex={index}
                questions={questions}
                onUpdate={handleUpdateRow}
                onDelete={handleDeleteRow}
                columnNames={columnNames}
                dataTestId={`${dataTestId}-row`}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-3 py-1.5 border-t border-border bg-background">
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => {
            handleAddRow(e);
            setTimeout(() => {
              if (tableRef.current) {
                tableRef.current.scrollTo({
                  top: tableRef.current.scrollHeight,
                  behavior: "smooth",
                });
              }
            }, 100);
          }}
          className="text-primary hover:text-primary hover:bg-primary/10 font-medium text-xs h-auto px-1.5 py-1 gap-1.5"
          data-testid={`${dataTestId}-add-row`}
        >
          {icons.add && <icons.add className="h-4 w-4" />}
          <span>Add Row</span>
        </Button>
      </div>
    </div>
  );
};

export default ResponseMappingTable;
