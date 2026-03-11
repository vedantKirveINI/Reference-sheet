import { Type, Hash, Binary, ToggleLeft, Braces, List, Asterisk, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataType, TYPE_COLORS, FRIENDLY_LABELS, DEV_LABELS, TYPE_DESCRIPTIONS } from './types';

const ICON_MAP = {
  String: Type,
  Number: Hash,
  Int: Binary,
  Boolean: ToggleLeft,
  Object: Braces,
  Array: List,
  Any: Asterisk,
};

const ALL_TYPES: DataType[] = ['String', 'Number', 'Int', 'Boolean', 'Object', 'Array'];

interface TypeBadgeProps {
  type: DataType;
  devMode?: boolean;
  onChange?: (type: DataType) => void;
  readOnly?: boolean;
  showDropdown?: boolean;
}

export function TypeBadge({ type, devMode = false, onChange, readOnly = false, showDropdown = true }: TypeBadgeProps) {
  const normalizedType = type && TYPE_COLORS[type] ? type : 'String';
  const colors = TYPE_COLORS[normalizedType];
  const label = devMode ? DEV_LABELS[normalizedType] : FRIENDLY_LABELS[normalizedType];
  const Icon = ICON_MAP[normalizedType] || Type;

  const badge = (
    <div
      className={cn(
        'inline-flex items-center rounded text-xs font-medium',
        'px-1 py-1 gap-0.5',
        colors.text,
        !readOnly && showDropdown && 'cursor-pointer'
      )}
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
      {!readOnly && showDropdown && <ChevronDown className="w-3 h-3 opacity-60" />}
    </div>
  );

  const badgeWithTooltip = (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );

  if (readOnly || !showDropdown || !onChange) {
    return badgeWithTooltip;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent" 
          aria-label={`Change type, currently ${label}`}
          data-testid="type-badge-trigger"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              {badge}
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {label}
            </TooltipContent>
          </Tooltip>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {ALL_TYPES.map((t) => {
          const TypeIcon = ICON_MAP[t];
          const typeColors = TYPE_COLORS[t];
          const typeLabel = devMode ? DEV_LABELS[t] : FRIENDLY_LABELS[t];
          
          return (
            <DropdownMenuItem
              key={t}
              onClick={(e) => {
                e.stopPropagation();
                onChange(t);
              }}
              className={cn('gap-2', type === t && 'bg-accent')}
              data-testid={`type-option-${t.toLowerCase()}`}
            >
              <div className={cn('p-1 rounded', typeColors.bg)}>
                <TypeIcon className={cn('w-3.5 h-3.5', typeColors.text)} />
              </div>
              <div className="flex flex-col">
                <span>{typeLabel}</span>
                <span className="text-[10px] text-muted-foreground">{TYPE_DESCRIPTIONS[t]}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

