import React, { useEffect } from "react";
import { Table, Loader2 } from "lucide-react";
import { getTriggerTheme, getTriggerIcon } from "../../triggerThemeRegistry";
import { TRIGGER_TYPES } from "../../constants";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSheet from "../../../common-hooks/useSheet";

const SheetSourcePicker = ({ state, workspaceId }) => {
  const { sheetConnection, setSheetConnection } = state;

  const theme = getTriggerTheme(TRIGGER_TYPES.SHEET);
  const iconData = getTriggerIcon(TRIGGER_TYPES.SHEET, true);
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

  const handleSheetChange = (sheetId) => {
    const selectedSheet = sheetList.find(s => s._id === sheetId);
    if (selectedSheet) {
      onSheetChangeHandler(null, selectedSheet);
    }
  };

  const handleTableChange = (tableId) => {
    const selectedTable = tableList.find(t => t.id === tableId);
    if (selectedTable) {
      onTableChangeHandler(null, selectedTable);
    }
  };

  const renderIcon = () => {
    if (iconData.type === "svg") {
      return <img src={iconData.src} alt="Sheet" className="w-5 h-5" />;
    }
    const IconComp = iconData.component;
    return <IconComp className="w-5 h-5" style={{ color: colors.primary }} />;
  };

  if (sheetConnection && sheetConnection.table) {
    return (
      <div
        className="p-3 rounded-lg border flex items-center justify-between"
        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            {iconData.type === "svg" ? (
              <img src={iconData.src} alt="Sheet" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
            ) : (() => {
              const IconComp = iconData.component;
              return <IconComp className="w-4 h-4 text-white" />;
            })()}
          </div>
          <div>
            <p className="font-medium text-sm">{sheetConnection.name}</p>
            <p className="text-xs text-muted-foreground">
              {sheetConnection.table?.name && `${sheetConnection.table.name} • `}
              {sheetConnection.columns?.length || 0} columns
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSheetConnection(null);
            onSheetChangeHandler(null, null);
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Change
        </button>
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
        <span className="text-sm font-medium">Select a Sheet</span>
      </div>

      {sheetLoading && sheetList.length === 0 ? (
        <div className="p-4 text-center">
          <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-2">Loading sheets...</p>
        </div>
      ) : sheetList.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed text-center" style={{ borderColor: colors.border }}>
          <p className="text-sm text-muted-foreground">No sheets found</p>
          <p className="text-xs text-muted-foreground mt-1">Create a sheet in your workspace first</p>
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
                      <Table className="w-3.5 h-3.5" style={{ color: colors.primary }} />
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
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading tables...
                </div>
              ) : tableList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No tables found in this sheet</p>
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
        </div>
      )}
    </div>
  );
};

export default SheetSourcePicker;
