import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Database,
  Server,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Connection } from "../types";
import { AUTH_TYPE_LABELS, AUTH_TYPE_BADGE_COLORS } from "../constants";
import { formatRelativeTime, formatUsageText } from "../utils/format-time";

interface ConnectionCardProps {
  connection: Connection;
  isSelected?: boolean;
  onSelect?: (connection: Connection) => void;
  onEdit?: (connection: Connection) => void;
  onRename?: (connection: Connection, newName: string) => void | Promise<void>;
  onDelete?: (connection: Connection) => void;
  showActions?: boolean;
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "connected":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "expired":
      return <Clock className="w-4 h-4 text-amber-500" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

export const ConnectionCard = forwardRef<HTMLDivElement, ConnectionCardProps>(function ConnectionCard({
  connection,
  isSelected,
  onSelect,
  onEdit,
  onRename,
  onDelete,
  showActions = true,
}, ref) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState(connection.name);
  const [isSavingName, setIsSavingName] = useState(false);

  const authBadgeColors = AUTH_TYPE_BADGE_COLORS[connection.authType] || AUTH_TYPE_BADGE_COLORS.custom;
  const authLabel = AUTH_TYPE_LABELS[connection.authType] || "Connected";
  const usageText = formatUsageText(connection.usage);
  const syncedText = formatRelativeTime(connection.lastSyncedAt || connection.updatedAt);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRename) {
      setEditingNameValue(connection.name);
      setIsEditingName(true);
    } else {
      onEdit?.(connection);
    }
  };

  const handleSaveName = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmed = editingNameValue.trim();
    if (!trimmed || trimmed === connection.name) {
      setIsEditingName(false);
      return;
    }
    if (!onRename) return;
    setIsSavingName(true);
    try {
      await onRename(connection, trimmed);
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNameValue(connection.name);
    setIsEditingName(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      onClick={() => !isEditingName && onSelect?.(connection)}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border transition-all",
        isEditingName ? "cursor-default" : "cursor-pointer",
        isSelected
          ? "border-slate-900 bg-slate-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
            isSelected
              ? "border-slate-900 bg-slate-900"
              : "border-slate-300 bg-white group-hover:border-slate-400"
          )}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-white"
            />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editingNameValue}
                onChange={(e) => setEditingNameValue(e.target.value)}
                className="h-8 text-sm flex-1 min-w-0"
                placeholder="Connection name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName(e as unknown as React.MouseEvent);
                  if (e.key === "Escape") handleCancelEdit(e as unknown as React.MouseEvent);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0 text-green-600 hover:text-green-700"
                onClick={handleSaveName}
                disabled={isSavingName || !editingNameValue.trim() || editingNameValue.trim() === connection.name}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={handleCancelEdit}
                disabled={isSavingName}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-medium text-slate-900 truncate">
                {connection.name}
              </h4>
              <StatusIcon status={connection.status} />
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
          {connection.metadata?.username && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {connection.metadata.username}
            </span>
          )}
          {connection.metadata?.database && (
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              {connection.metadata.database}
            </span>
          )}
          {connection.metadata?.host && (
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3" />
              {connection.metadata.host}
            </span>
          )}
          {connection.metadata?.version && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              v{connection.metadata.version}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              authBadgeColors.bg,
              authBadgeColors.text
            )}
          >
            {authLabel}
          </span>
          {usageText && (
            <span className="text-xs text-slate-400">
              • {usageText}
            </span>
          )}
          {syncedText && (
            <span className="text-xs text-slate-400">
              • Synced {syncedText}
            </span>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleEditClick}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(connection);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  );
});
