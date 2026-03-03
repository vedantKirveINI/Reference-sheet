import { useState, useEffect } from 'react';
import { ChevronDown, Building2, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  icpFilter: Building2,
  locationFilter: MapPin,
  limitFilter: Clock,
};

interface CollapsibleSectionProps {
  title: string;
  isOpen?: boolean;
  onToggle?: (sectionId: string, isOpen: boolean) => void;
  sectionId: string;
  filterCount?: number;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  isOpen: controlledIsOpen,
  onToggle,
  sectionId,
  filterCount = 0,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(controlledIsOpen ?? true);

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsExpanded(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(sectionId, newState);
  };

  const Icon = ICON_MAP[sectionId] || Building2;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-foreground">{title}</span>
          {filterCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-[#39A380]/10 px-2 py-0.5 text-[10px] font-semibold text-[#39A380] border border-[#39A380]/20">
              {filterCount} {filterCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pb-2 px-1">{children}</div>
      </div>
    </div>
  );
}
