import React, { useEffect } from "react";
import { Link2, Info, Loader2 } from "lucide-react";
import { getTriggerTheme, getTriggerIcon } from "../../triggerThemeRegistry";
import { TRIGGER_TYPES } from "../../constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHEET_EVENT_OPTIONS } from "../../constants";
import useSheet from "../../../common-hooks/useSheet";

const SheetPanel = ({ state, variables, workspaceId, assetId }) => {
  const { sheetConnection, setSheetConnection, sheetEventTypes = [], toggleSheetEventType } = state;

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

  const handleDisconnect = () => {
    setSheetConnection(null);
    onSheetChangeHandler(null, null);
  };

  const renderIcon = (size = "w-10 h-10", invert = false) => {
    if (iconData.type === "svg") {
      return (
        <img
          src={iconData.src}
          alt="Sheet"
          className={size}
          style={invert ? { filter: "brightness(0) invert(1)" } : undefined}
        />
      );
    }
    const IconComp = iconData.component;
    return <IconComp className={size} style={{ color: colors.primary }} />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Link2 className="w-4 h-4" style={{ color: colors.primary }} />
          Connected Sheet
        </Label>

        {sheetConnection ? (
          <div
            className="p-4 rounded-xl border"
            style={{ borderColor: colors.border, backgroundColor: colors.bg }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {renderIcon("w-10 h-10")}
                <div>
                  <p className="font-medium text-gray-900">{sheetConnection.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sheetConnection.table?.name && `Table: ${sheetConnection.table.name} • `}
                    {sheetConnection.columns?.length || 0} columns
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sheetLoading && sheetList.length === 0 ? (
              <div
                className="p-6 rounded-xl border-2 border-dashed text-center"
                style={{ borderColor: colors.border, backgroundColor: `${colors.bg}80` }}
              >
                <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin" style={{ color: colors.border }} />
                <p className="text-sm text-muted-foreground">Loading sheets...</p>
              </div>
            ) : sheetList.length === 0 ? (
              <div
                className="p-6 rounded-xl border-2 border-dashed text-center"
                style={{ borderColor: colors.border, backgroundColor: `${colors.bg}80` }}
              >
                <div className="mx-auto mb-3 opacity-50">{renderIcon("w-10 h-10")}</div>
                <p className="text-sm text-muted-foreground mb-1">No sheets found</p>
                <p className="text-xs text-muted-foreground">
                  Create a sheet in your workspace first
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Select Sheet</Label>
                  <Select value={sheet?._id || ""} onValueChange={handleSheetChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a sheet" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetList.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {sheet && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Select Table</Label>
                    {tableLoading ? (
                      <div
                        className="p-3 rounded-lg border border-dashed text-center"
                        style={{ borderColor: colors.border, backgroundColor: `${colors.bg}80` }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.primary }} />
                          <p className="text-xs text-muted-foreground">Loading tables...</p>
                        </div>
                      </div>
                    ) : tableList.length === 0 ? (
                      <div
                        className="p-3 rounded-lg border border-dashed text-center"
                        style={{ borderColor: colors.border, backgroundColor: `${colors.bg}80` }}
                      >
                        <p className="text-xs text-muted-foreground">No tables found in this sheet</p>
                      </div>
                    ) : (
                      <Select value={table?.id || ""} onValueChange={handleTableChange}>
                        <SelectTrigger className="w-full">
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
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Trigger Event</Label>
        <p className="text-xs text-muted-foreground">Select one or more events</p>
        <div className="grid grid-cols-3 gap-3">
          {SHEET_EVENT_OPTIONS.map((event) => {
            const isSelected = sheetEventTypes.includes(event.id);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => toggleSheetEventType(event.id)}
                className="p-4 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: isSelected ? colors.primary : "#E5E7EB",
                  backgroundColor: isSelected ? colors.bg : "#FFFFFF",
                }}
              >
                <p
                  className="font-medium text-sm"
                  style={{ color: isSelected ? colors.text : "#374151" }}
                >
                  {event.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            When a sheet event occurs, the row data is automatically passed to
            your workflow. Access column values using the variable picker in
            subsequent nodes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SheetPanel;
