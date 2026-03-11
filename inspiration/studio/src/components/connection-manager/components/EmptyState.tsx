import { motion } from "framer-motion";
import { Plus, Database, Link2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthType } from "../types";
import { getContextualCopy, getButtonLabel } from "../constants";

interface EmptyStateProps {
  authType: AuthType;
  integrationName?: string;
  integrationIcon?: string;
  onAddConnection: () => void;
  disabled?: boolean;
}

const getAuthIcon = (authType: AuthType) => {
  switch (authType) {
    case "database":
      return Database;
    case "api-key":
      return Key;
    default:
      return Link2;
  }
};

export function EmptyState({
  authType,
  integrationName,
  integrationIcon,
  onAddConnection,
  disabled,
}: EmptyStateProps) {
  const copy = getContextualCopy(integrationName, authType);
  const buttonLabel = getButtonLabel(authType);
  const IconComponent = getAuthIcon(authType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="mb-6">
        {integrationIcon ? (
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
            <img 
              src={integrationIcon} 
              alt={integrationName || "Integration"} 
              className="w-10 h-10 object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-slate-400" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {copy.title}
      </h3>
      
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        {copy.description}
      </p>

      <Button
        onClick={onAddConnection}
        disabled={disabled}
        className="gap-2"
        variant="default"
      >
        <Plus className="w-4 h-4" />
        {buttonLabel}
      </Button>
    </motion.div>
  );
}
