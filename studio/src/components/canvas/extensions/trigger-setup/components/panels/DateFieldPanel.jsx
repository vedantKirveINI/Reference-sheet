import React, { useEffect, useMemo } from "react";
import { Calendar, Link2, Info, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { getTriggerTheme, getTriggerIcon } from "../../triggerThemeRegistry";
import { TRIGGER_TYPES } from "../../constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_OFFSET_UNITS,
  TIMING_RULE_OPTIONS,
  TIMING_RULE_OFFSET_UNITS,
  createDefaultTimingRule,
} from "../../constants";
import useSheet from "../../../common-hooks/useSheet";
import { icons } from "@/components/icons";

const DATE_FIELD_TYPES = [
  "date",
  "datetime",
  "createdTime",
  "lastModifiedTime",
];

const DateFieldPanel = ({ state, variables, workspaceId, assetId }) => {
  const {
    sheetConnection,
    setSheetConnection,
    dateColumn,
    setDateColumn,
    dateOffset,
    setDateOffset,
    dateOffsetUnit,
    setDateOffsetUnit,
    dateOffsetDirection,
    setDateOffsetDirection,
    timingRules = [createDefaultTimingRule({ index: 0 })],
    setTimingRules,
  } = state;

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
    data: sheetConnection
      ? { asset: sheetConnection.sheet, subSheet: sheetConnection.table }
      : {},
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
      (col) =>
        DATE_FIELD_TYPES.includes(col.type) ||
        col.type?.toLowerCase().includes("date"),
    );
  }, [sheetConnection?.columns]);

  const handleSheetChange = (sheetId) => {
    const selectedSheet = sheetList.find((s) => s._id === sheetId);
    if (selectedSheet) {
      onSheetChangeHandler(null, selectedSheet);
      setDateColumn(null);
    }
  };

  const handleTableChange = (tableId) => {
    const selectedTable = tableList.find((t) => t.id === tableId);
    if (selectedTable) {
      onTableChangeHandler(null, selectedTable);
      setDateColumn(null);
    }
  };

  const handleDisconnect = () => {
    setSheetConnection(null);
    setDateColumn(null);
    onSheetChangeHandler(null, null);
  };

  const renderIcon = (size = "w-10 h-10", invert = false) => {
    if (iconData.type === "svg") {
      return (
        <img
          src={iconData.src}
          alt="Date Field"
          className={size}
          style={invert ? { filter: "brightness(0) invert(1)" } : undefined}
        />
      );
    }
    const IconComp = iconData.component;
    return <IconComp className={size} style={{ color: colors.primary }} />;
  };

  return (
    <div className="space-y-6">
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
                  <p className="font-medium text-gray-900">
                    {sheetConnection.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sheetConnection.table?.name &&
                      `Table: ${sheetConnection.table.name} • `}
                    {sheetConnection.columns?.length || 0} columns
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sheetLoading && sheetList.length === 0 ? (
              <div
                className="p-6 rounded-xl border-2 border-dashed text-center"
                style={{
                  borderColor: colors.border,
                  backgroundColor: `${colors.bg}80`,
                }}
              >
                <Loader2
                  className="w-10 h-10 mx-auto mb-3 animate-spin"
                  style={{ color: colors.border }}
                />
                <p className="text-sm text-muted-foreground">
                  Loading sheets...
                </p>
              </div>
            ) : sheetList.length === 0 ? (
              <div
                className="p-6 rounded-xl border-2 border-dashed text-center"
                style={{
                  borderColor: colors.border,
                  backgroundColor: `${colors.bg}80`,
                }}
              >
                <div className="mx-auto mb-3 opacity-50">
                  {renderIcon("w-10 h-10")}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  No sheets found
                </p>
                <p className="text-xs text-muted-foreground">
                  Create a sheet in your workspace first
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Select Sheet
                  </Label>
                  <Select
                    value={sheet?._id || ""}
                    onValueChange={handleSheetChange}
                  >
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
                    <Label className="text-xs text-muted-foreground">
                      Select Table
                    </Label>
                    {tableLoading ? (
                      <div
                        className="p-3 rounded-lg border border-dashed text-center"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: `${colors.bg}80`,
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2
                            className="w-4 h-4 animate-spin"
                            style={{ color: colors.primary }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Loading tables...
                          </p>
                        </div>
                      </div>
                    ) : tableList.length === 0 ? (
                      <div
                        className="p-3 rounded-lg border border-dashed text-center"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: `${colors.bg}80`,
                        }}
                      >
                        <p className="text-xs text-muted-foreground">
                          No tables found in this sheet
                        </p>
                      </div>
                    ) : (
                      <Select
                        value={table?.id || ""}
                        onValueChange={handleTableChange}
                      >
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

      {sheetConnection && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
              Date Column
            </Label>
            {dateColumns.length === 0 ? (
              <div
                className="p-3 rounded-lg border border-dashed text-center"
                style={{
                  borderColor: colors.border,
                  backgroundColor: `${colors.bg}80`,
                }}
              >
                <p className="text-xs text-muted-foreground">
                  No date columns found in this table
                </p>
              </div>
            ) : (
              <Select
                value={
                  typeof dateColumn === "object" && dateColumn !== null
                    ? dateColumn.id ?? dateColumn.key ?? ""
                    : dateColumn || ""
                }
                onValueChange={(val) => {
                  const col = dateColumns.find((c) => (c.id ?? c.key) === val);
                  setDateColumn(col ?? val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a date column" />
                </SelectTrigger>
                <SelectContent>
                  {dateColumns.map((col) => (
                    <SelectItem
                      key={col.id || col.key}
                      value={col.id || col.key}
                    >
                      {col.name || col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              Choose the column containing the dates to trigger on
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: colors.primary }} />
              Timing Rules
            </Label>
            <p className="text-xs text-muted-foreground">
              Define when the workflow will run relative to the date in the column
            </p>
            <div className="space-y-3">
              {(timingRules || []).map((rule, index) => (
                <div
                  key={rule.id || index}
                  className="p-4 rounded-lg border flex flex-col gap-3"
                  style={{ borderColor: colors.border, backgroundColor: `${colors.primary}05` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      {rule.label || `Rule ${index + 1}`}
                    </span>
                    {timingRules.length > 1 && setTimingRules && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setTimingRules(
                            timingRules.filter((r) => r.id !== rule.id)
                          )
                        }
                      >
                        {icons.trash2 ? <icons.trash2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={rule.timing || "BEFORE"}
                      onValueChange={(val) =>
                        setTimingRules(
                          timingRules.map((r) =>
                            r.id === rule.id ? { ...r, timing: val } : r
                          )
                        )
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMING_RULE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {rule.timing !== "EXACT" && (
                      <>
                        <Input
                          type="number"
                          min={1}
                          max={999}
                          className="w-20"
                          value={rule.offsetValue ?? 1}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v) && v >= 1)
                              setTimingRules(
                                timingRules.map((r) =>
                                  r.id === rule.id
                                    ? { ...r, offsetValue: Math.min(999, v) }
                                    : r
                                )
                              );
                          }}
                        />
                        <Select
                          value={rule.offsetUnit || "days"}
                          onValueChange={(val) =>
                            setTimingRules(
                              timingRules.map((r) =>
                                r.id === rule.id ? { ...r, offsetUnit: val } : r
                              )
                            )
                          }
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMING_RULE_OFFSET_UNITS.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">
                          {rule.timing === "BEFORE" ? "before" : "after"} the date
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {setTimingRules && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={() =>
                    setTimingRules([
                      ...(timingRules || []),
                      createDefaultTimingRule({ index: (timingRules || []).length }),
                    ])
                  }
                >
                  {icons.add ? <icons.add className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add rule
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <div
        className="rounded-xl p-4 border"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        <h5 className="font-medium text-sm mb-2" style={{ color: colors.text }}>
          Example Use Cases
        </h5>
        <ul className="text-xs space-y-1" style={{ color: colors.accent }}>
          <li>• Send reminder emails 3 days before due dates</li>
          <li>• Follow up with customers 1 week after purchase</li>
          <li>• Notify team members on task deadlines</li>
          <li>• Archive records 30 days after creation</li>
        </ul>
      </div>

      <div className="bg-muted/30 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            The trigger checks for matching dates daily. Ensure your date column
            contains valid date values for accurate triggering.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DateFieldPanel;
