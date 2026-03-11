import React from "react";
import { Settings, RotateCcw, Save, Clock, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";
import { cn } from "@/lib/utils";

const SettingRow = ({ icon: Icon, label, description, checked, onCheckedChange }) => (
  <div className="flex items-start justify-between gap-3 py-2">
    <div className="flex items-start gap-2.5 flex-1">
      <div className="mt-0.5 text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground leading-tight">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground leading-snug">{description}</span>
        )}
      </div>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="mt-0.5"
    />
  </div>
);

const WorkflowSettingsPopover = ({ 
  triggerClassName,
  align = "end",
  side = "top",
}) => {
  const {
    preferences,
    toggleAutoSaveOnClose,
    toggleShowRecentNodes,
    toggleAutoRunTests,
    resetPreferences,
  } = useWorkflowPreferences();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors p-1.5",
            triggerClassName
          )}
          aria-label="Workflow settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align={align} 
        side={side} 
        sideOffset={8}
        className="w-72 p-0"
      >
        <div className="px-3 py-2.5 border-b border-border/50">
          <h4 className="text-sm font-semibold text-foreground">Workflow Settings</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Customize your workflow experience</p>
        </div>
        
        <div className="px-3 py-1">
          <SettingRow
            icon={Save}
            label="Auto-save on close"
            description="Save changes when closing drawer"
            checked={preferences.autoSaveOnClose}
            onCheckedChange={toggleAutoSaveOnClose}
          />
          
          <SettingRow
            icon={Clock}
            label="Show recent nodes"
            description="Display recently used nodes in palette"
            checked={preferences.showRecentNodes}
            onCheckedChange={toggleShowRecentNodes}
          />
          
          <SettingRow
            icon={Zap}
            label="Auto-run tests"
            description="Run test automatically on Test tab"
            checked={preferences.autoRunTests}
            onCheckedChange={toggleAutoRunTests}
          />
        </div>
        
        <Separator className="my-1" />
        
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetPreferences}
            className="w-full justify-start text-muted-foreground hover:text-foreground h-8 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Reset to defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WorkflowSettingsPopover;
