import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  getSheetTypeDisplayName,
  getSheetTypeIcon,
  getSheetTypeIconColor,
} from "../../sheetTypeMapping";
import { isComplexType, getFieldTypeConfig } from "@/constants/field-type-registry";
import { getComplexTypeIcon } from "../utils/complexTypeIcon";
import styles from "../SheetRecordGridV2.module.css";

/**
 * Type icon component for grid rows
 * @param {Object} props
 * @param {string} props.fieldType - The field type
 * @param {boolean} props.isParent - Whether this is a parent row
 * @param {boolean} props.isExpanded - Whether the field is expanded
 * @param {Function} props.onToggle - Function to toggle expand/collapse
 */
export function TypeIcon({ fieldType, subType, isParent, isExpanded, onToggle }) {
  const displayName = getSheetTypeDisplayName(subType || fieldType);
  const config = getFieldTypeConfig(fieldType);
  const isComplex = isComplexType(fieldType);

  const ComplexIcon = getComplexTypeIcon(fieldType);
  const DefaultIcon = getSheetTypeIcon(fieldType);
  const IconComponent = (isParent && ComplexIcon) ? ComplexIcon : DefaultIcon;
  const colorClass = getSheetTypeIconColor(fieldType);

  const iconContent = !IconComponent ? (
    <div className="w-4 h-4 flex items-center justify-center text-gray-400 text-xs">−</div>
  ) : (
    <IconComponent className={cn("w-4 h-4", colorClass)} />
  );

  if (isParent && isComplex) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggle}
              className={styles.expandableType}
            >
              <span className={styles.chevron}>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </span>
              <span className={styles.typeIconInner}>
                {iconContent}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs max-w-[250px]">
            <div className="font-medium mb-1">{displayName}</div>
            {config && (
              <div className="text-gray-400">
                Expects: {config.dataStructure === 'object' ? 'structured data' :
                  config.dataStructure === 'array' ? 'list of values' :
                    config.dataStructure === 'arrayOfObjects' ? 'list of items' : 'simple value'}
              </div>
            )}
            <div className="text-gray-400 mt-1">Click to {isExpanded ? 'collapse' : 'expand'}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className={styles.typeIconStatic}>
            {iconContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {displayName}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

