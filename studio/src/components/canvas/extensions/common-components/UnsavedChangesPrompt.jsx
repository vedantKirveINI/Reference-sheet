import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UnsavedChangesPrompt = ({
  show = false,
  onSave,
  onDiscard,
  onCancel,
  className,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg",
            className
          )}
        >
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 font-medium">
            You have unsaved changes
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDiscard}
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Discard
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnsavedChangesPrompt;
