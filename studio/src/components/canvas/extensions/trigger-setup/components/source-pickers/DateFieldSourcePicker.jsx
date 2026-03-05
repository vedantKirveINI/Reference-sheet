import React, { useEffect, useMemo } from "react";
import { icons } from "@/components/icons";
import { getTriggerTheme, getTriggerIcon } from "../../triggerThemeRegistry";
import { TRIGGER_TYPES } from "../../constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useSheet from "../../../common-hooks/useSheet";

const CalendarIcon = icons.calendar;
const TableIcon = icons.table2;
const Loader2Icon = icons.loader2;

const DATE_FIELD_TYPES = ["date", "datetime", "createdTime", "lastModifiedTime"];

const DateFieldSourcePicker = ({ state, workspaceId }) => {
  const { sheetConnection, setSheetConnection, dateColumn, setDateColumn } = state;

  const theme = getTriggerTheme(TRIGGER_TYPES.DATE_FIELD);
  const iconData = getTriggerIcon(TRIGGER_TYPES.DATE_FIELD, true);
  const colors = theme.colors;

  const {
    sheet,
    table,
    sheetList,
    tableList,
    onSheetChangeHandler,
    onTableChangeHandler,
    sheetLoading,
    tableLoading,
  } = useSheet({
    data: sheetConnection ? { asset: sheetConnection.sheet, subSheet: sheetConnection.table } : {},
    workspaceId,
    isViewRequired: false,
    isFieldRequired: true,
  });

  useEffect(() => {
    if (sheet && table) {
      setSheetConnection({
        sheet,
        table,
        name: sheet.name,
        columns: table.fields || [],
      });
    }
  }, [sheet, table, setSheetConnection]);

  const dateColumns = useMemo(() => {
    if (!sheetConnection?.columns) return [];
    return sheetConnection.columns.filter(
      (col) => DATE_FIELD_TYPES.includes(col.type) || col.type?.toLowerCase().includes("date")
    );
  }, [sheetConnection?.columns]);

  const handleSheetChange = (sheetId) => {
    const selectedSheet = sheetList.find(s => s._id === sheetId);
    if (selectedSheet) {
      onSheetChangeHandler(null, selectedSheet);
      setDateColumn(null);
    }
  };

  const handleTableChange = (tableId) => {
    const selectedTable = tableList.find(t => t.id === tableId);
    if (selectedTable) {
      onTableChangeHandler(null, selectedTable);
      setDateColumn(null);
    }
  };

  const handleDateColumnChange = (columnId) => {
    const column = dateColumns.find(c => c.id === columnId);
    if (column) {
      setDateColumn(column);
    }
  };

  const renderIcon = () => {
    if (iconData.type === "svg") {
      return <img src={iconData.src} alt="Date Field" className="w-5 h-5" />;
    }
    const IconComp = iconData.component;
    return <IconComp className="w-5 h-5" style={{ color: colors.primary }} />;
  };

  const isComplete = sheetConnection && sheetConnection.table && dateColumn;

  if (isComplete) {
    return (
      <div
        className="p-4 rounded-lg border flex items-center gap-4"
        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.primary }}
        >
          <CalendarIcon className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate" title={sheetConnection.name}>
            {sheetConnection.name}
          </p>
          <p
            className="text-xs text-muted-foreground truncate mt-0.5"
            title={`${dateColumn.name} • ${sheetConnection.table?.name ?? ""}`}
          >
            {dateColumn.name} • {sheetConnection.table?.name}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => {
            setSheetConnection(null);
            setDateColumn(null);
            onSheetChangeHandler(null, null);
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: colors.light }}
        >
          {renderIcon()}
        </div>
        <span className="text-sm font-medium">Select Date Field Source</span>
      </div>

      {sheetLoading && sheetList.length === 0 ? (
        <div className="p-4 text-center">
          <Loader2Icon className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-2">Loading sheets...</p>
        </div>
      ) : sheetList.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed text-center" style={{ borderColor: colors.border }}>
          <p className="text-sm text-muted-foreground">No sheets found</p>
          <p className="text-xs text-muted-foreground mt-1">Create a sheet with date columns first</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Sheet</label>
            <Select value={sheet?._id || ""} onValueChange={handleSheetChange}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select a sheet" />
              </SelectTrigger>
                <SelectContent>
                {sheetList.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sheet && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Table</label>
              {tableLoading ? (
                <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                  Loading tables...
                </div>
              ) : tableList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No tables found</p>
              ) : (
                <Select value={table?.id || ""} onValueChange={handleTableChange}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tableList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {sheetConnection && sheetConnection.table && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Date Column</label>
              {dateColumns.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No date columns found in this table</p>
              ) : (
                <Select value={dateColumn?.id || ""} onValueChange={handleDateColumnChange}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select date column" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateColumns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                          {col.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateFieldSourcePicker;
