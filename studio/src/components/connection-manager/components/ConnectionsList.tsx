import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Connection, AuthType } from "../types";
import { ConnectionCard } from "./ConnectionCard";
import { getButtonLabel } from "../constants";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConnectionsListProps {
  connections: Connection[];
  selectedConnectionId?: string;
  authType: AuthType;
  integrationName?: string;
  onSelect: (connection: Connection) => void;
  onEdit?: (connection: Connection) => void;
  onRename?: (connection: Connection, newName: string) => void | Promise<void>;
  onDelete?: (connection: Connection) => void;
  onAddNew: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  disabled?: boolean;
}

export function ConnectionsList({
  connections,
  selectedConnectionId,
  authType,
  integrationName,
  onSelect,
  onEdit,
  onRename,
  onDelete,
  onAddNew,
  onRefresh,
  isRefreshing,
  disabled,
}: ConnectionsListProps) {
  const buttonLabel = getButtonLabel(authType);
  const serviceName = integrationName || "connection";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-start justify-between gap-4 px-1 pb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 mb-0.5">
            Connection
          </h3>
          <p className="text-sm text-slate-500">
            Select a {serviceName} connection or create a new one.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              disabled={disabled || isRefreshing}
              variant="outline"
              size="sm"
              className="gap-1.5"
              title="Refresh connections"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button
            onClick={onAddNew}
            disabled={disabled}
            variant="default"
            size="sm"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {buttonLabel}
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-1 shrink-0">
          Existing Connections
        </p>

        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-2 pr-2">
            <AnimatePresence mode="popLayout">
              {connections.map((connection) => (
                <ConnectionCard
                  key={connection._id || connection.id}
                  connection={connection}
                  isSelected={
                    selectedConnectionId === connection._id ||
                    selectedConnectionId === connection.id
                  }
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}
