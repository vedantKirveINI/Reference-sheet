import { useState, forwardRef, useImperativeHandle } from 'react';
import { Minus } from 'lucide-react';

interface LimitFilterProps {
  sectionId: string;
  onFilterCountChange: (sectionId: string, count: number) => void;
}

export interface LimitFilterHandle {
  getLimitData: () => Promise<string>;
}

export const LimitFilter = forwardRef<LimitFilterHandle, LimitFilterProps>(
  ({ sectionId, onFilterCountChange }, ref) => {
    const [value, setValue] = useState('');

    useImperativeHandle(ref, () => ({
      getLimitData: async () => value || '100',
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') {
        setValue('');
        onFilterCountChange(sectionId, 0);
        return;
      }
      const num = parseInt(raw, 10);
      if (isNaN(num)) return;
      const clamped = Math.min(100, Math.max(1, num));
      setValue(String(clamped));
      onFilterCountChange(sectionId, 1);
    };

    return (
      <div className="flex flex-col gap-3 py-1">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-foreground">Result Limit</span>
          <span className="text-[11px] text-muted-foreground">Maximum 100 records per search</span>
        </div>
        <div className="relative flex items-center">
          <Minus className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="number"
            min={1}
            max={100}
            value={value}
            onChange={handleChange}
            placeholder="e.g. 10"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#39A380]/30 focus:border-[#39A380]/40 transition-all"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Leave empty to use default (100 records)
        </p>
      </div>
    );
  }
);

LimitFilter.displayName = 'LimitFilter';
