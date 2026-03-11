import React, { useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./styles.module.css";

const PresetSelector = ({ presets = [], onSelectPreset, theme = {} }) => {
  const [open, setOpen] = useState(false);

  if (!presets || presets.length === 0) {
    return null;
  }

  const handleSelect = (preset) => {
    onSelectPreset(preset);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={styles.presetButton}
          style={{
            "--accent-color": theme.accentColor || "#3b82f6",
          }}
        >
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Quick Fill
          <ChevronDown className="w-3.5 h-3.5 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={styles.presetDropdown}>
        {presets.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => handleSelect(preset)}
            className={styles.presetItem}
          >
            {preset.icon && (
              <span className={styles.presetIcon}>{preset.icon}</span>
            )}
            <div className={styles.presetContent}>
              <span className={styles.presetLabel}>{preset.label}</span>
              {preset.description && (
                <span className={styles.presetDescription}>
                  {preset.description}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PresetSelector;

