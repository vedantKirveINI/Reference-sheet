import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid,
  GalleryHorizontalEnd,
  Kanban,
  Calendar,
  FileText,
  ChevronDown,
  Check,
} from "lucide-react";
import { ViewType } from "@/types/view";
import { createView } from "@/services/api";
import { useViewStore } from "@/stores/view-store";
import { useFieldsStore } from "@/stores/fields-store";
import type { IExtendedColumn } from "@/stores/fields-store";

const VIEW_TYPE_OPTIONS = [
  { type: ViewType.Grid, label: "Grid", icon: LayoutGrid },
  { type: ViewType.Gallery, label: "Gallery", icon: GalleryHorizontalEnd },
  { type: ViewType.Kanban, label: "Kanban", icon: Kanban },
  { type: ViewType.Calendar, label: "Calendar", icon: Calendar },
  { type: ViewType.Form, label: "Form", icon: FileText },
];

interface CreateViewModalProps {
  open: boolean;
  onClose: () => void;
  baseId?: string;
  tableId?: string;
}

export function CreateViewModal({
  open,
  onClose,
  baseId,
  tableId,
}: CreateViewModalProps) {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<string>(ViewType.Grid);
  const [stackFieldId, setStackFieldId] = useState("");
  const [stackDropdownOpen, setStackDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const addView = useViewStore((s) => s.addView);
  const setCurrentView = useViewStore((s) => s.setCurrentView);
  const viewCount = useViewStore((s) => s.views.length);
  const columns = useFieldsStore((s) => s.allColumns);

  const scqColumns = ((columns || []) as IExtendedColumn[]).filter(
    (col) =>
      col.rawType === "SCQ" ||
      (col as any).type === "SCQ" ||
      (col as any).type === "SingleSelect"
  );

  useEffect(() => {
    if (open) {
      setName("");
      setSelectedType(ViewType.Grid);
      setStackFieldId("");
      setNameError("");
      setLoading(false);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!stackDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStackDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [stackDropdownOpen]);

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("View name is required");
      nameInputRef.current?.focus();
      return;
    }
    setNameError("");
    setLoading(true);

    try {
      if (baseId && tableId) {
        const payload: Record<string, unknown> = {
          baseId,
          table_id: tableId,
          name: trimmed,
          type: selectedType,
          order: viewCount + 1,
        };

        if (selectedType === ViewType.Kanban && stackFieldId) {
          const validField = scqColumns.find(
            (col) => String((col as any).rawId ?? col.id) === stackFieldId
          );
          if (validField) {
            payload.options = {
              stackFieldId: Number(stackFieldId),
              isEmptyStackHidden: false,
            };
          }
        }

        const res = await createView(payload as any);
        const created = (res as any).data?.data || (res as any).data;
        if (created?.id) {
          addView({
            id: created.id,
            name: created.name || trimmed,
            type: created.type || selectedType,
            user_id: created.user_id || "",
            tableId: created.tableId || tableId,
          });
          setCurrentView(created.id);
        }
      } else {
        const tempId = `view_${Date.now()}`;
        addView({
          id: tempId,
          name: trimmed,
          type: selectedType as ViewType,
          user_id: "",
          tableId: tableId || "",
        });
        setCurrentView(tempId);
      }
      onClose();
    } catch (err) {
      console.error("Failed to create view:", err);
      setNameError("Failed to create view. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [name, selectedType, stackFieldId, baseId, tableId, viewCount, addView, setCurrentView, onClose, scqColumns]);

  const selectedStackField = scqColumns.find(
    (col) => String((col as any).rawId ?? col.id) === stackFieldId
  );

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[480px]" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-base">Create new view</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose a view type and give it a name to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1" onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}>
          <div className="space-y-1.5">
            <label htmlFor="create-view-name" className="text-xs font-medium">
              View name
            </label>
            <Input
              id="create-view-name"
              ref={nameInputRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="Enter view name"
              className="h-8 text-sm"
              autoComplete="off"
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">View type</label>
            <div className="grid grid-cols-5 gap-1.5">
              {VIEW_TYPE_OPTIONS.map((opt) => {
                const active = selectedType === opt.type;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(opt.type);
                      if (opt.type !== ViewType.Kanban) setStackFieldId("");
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-md border p-2.5 transition-all text-xs ${
                      active
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                        : "border-border hover:border-border hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} strokeWidth={1.5} />
                    <span className="font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedType === ViewType.Kanban && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Stacking field</label>
              <p className="text-xs text-muted-foreground">
                Records will be grouped into columns based on this single-select field.
              </p>
              {scqColumns.length > 0 ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setStackDropdownOpen(!stackDropdownOpen)}
                    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-accent/50 transition-colors"
                  >
                    <span className={selectedStackField ? "text-foreground" : "text-muted-foreground"}>
                      {selectedStackField?.name || "Select a field (optional)"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {stackDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-md">
                      {scqColumns.map((col) => {
                        const fid = String((col as any).rawId ?? col.id);
                        const picked = stackFieldId === fid;
                        return (
                          <button
                            key={fid}
                            type="button"
                            onClick={() => {
                              setStackFieldId(picked ? "" : fid);
                              setStackDropdownOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                          >
                            <div className="flex h-4 w-4 items-center justify-center">
                              {picked && <Check className="h-3.5 w-3.5 text-primary" />}
                            </div>
                            <span>{col.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic rounded-md border border-dashed border-border p-3 text-center">
                  No single-select fields available. You can add one and configure stacking later.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create view"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
