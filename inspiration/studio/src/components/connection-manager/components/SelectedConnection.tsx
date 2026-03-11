import { motion } from "framer-motion";
import { 
  RefreshCw, 
  Plus, 
  User, 
  Database, 
  Server,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Connection } from "../types";
import { AUTH_TYPE_LABELS, AUTH_TYPE_BADGE_COLORS } from "../constants";
import { formatRelativeTime } from "../utils/format-time";

interface SelectedConnectionProps {
  connection: Connection;
  onSwitch: () => void;
  onAddNew: () => void;
  disabled?: boolean;
}

const StatusIcon = ({ status, className }: { status: string; className?: string }) => {
  switch (status) {
    case "connected":
      return <CheckCircle2 className={cn("w-4 h-4 text-green-500", className)} />;
    case "expired":
      return <Clock className={cn("w-4 h-4 text-amber-500", className)} />;
    case "error":
      return <AlertCircle className={cn("w-4 h-4 text-red-500", className)} />;
    default:
      return <Clock className={cn("w-4 h-4 text-slate-400", className)} />;
  }
};

export function SelectedConnection({
  connection,
  onSwitch,
  onAddNew,
  disabled,
}: SelectedConnectionProps) {
  const authBadgeColors = AUTH_TYPE_BADGE_COLORS[connection.authType] || AUTH_TYPE_BADGE_COLORS.custom;
  const authLabel = AUTH_TYPE_LABELS[connection.authType] || "Connected";
  const syncedText = formatRelativeTime(connection.lastSyncedAt || connection.updatedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Selected Connection
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={onSwitch}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch
          </Button>
          <Button
            onClick={onAddNew}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
        </div>
      </div>

      <div className="px-5 py-4 rounded-xl border border-slate-900 bg-slate-50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-900 truncate flex-1 min-w-0">
                {connection.name}
              </h4>
              <StatusIcon status={connection.status} className="flex-shrink-0" />
              {syncedText && (
                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                  synced {syncedText}
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500">
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
                <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                  v{connection.metadata.version}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  authBadgeColors.bg,
                  authBadgeColors.text
                )}
              >
                {authLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
