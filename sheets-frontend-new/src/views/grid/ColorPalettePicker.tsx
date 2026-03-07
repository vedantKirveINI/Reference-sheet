import { Check, RotateCcw } from 'lucide-react';
import { STANDARD_COLORS, MAIN_PALETTE_ROWS } from './color-palette';
import { cn } from '@/lib/utils';

interface ColorPalettePickerProps {
  currentColor: string | null;
  onSelect: (color: string | null) => void;
  onClose?: () => void;
  title?: string;
  /** If true, selecting a color also calls onClose (e.g. for popover). */
  closeOnSelect?: boolean;
}

export function ColorPalettePicker({
  currentColor,
  onSelect,
  onClose,
  title,
  closeOnSelect = false,
}: ColorPalettePickerProps) {
  const handleSelect = (color: string) => {
    onSelect(color);
    if (closeOnSelect && onClose) onClose();
  };

  const handleReset = () => {
    onSelect(null);
    if (closeOnSelect && onClose) onClose();
  };

  const sizeClass = 'w-5 h-5';
  const checkSizeClass = 'h-2.5 w-2.5';
  const gridCols = 'grid-cols-10';

  return (
    <div className="flex flex-col gap-3 p-3 min-w-0">
      {title && (
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
      )}

      {/* Reset */}
      <button
        type="button"
        onClick={handleReset}
        className={cn(
          'flex items-center gap-2 w-full text-left text-xs rounded-md px-2 py-1.5 transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        <RotateCcw className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        <span>Reset</span>
      </button>

      {/* Main palette grid */}
      <div className={cn('grid gap-1', gridCols)}>
        {MAIN_PALETTE_ROWS.flat().map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            className={cn(
              'rounded-full border-2 transition-all flex items-center justify-center shrink-0',
              sizeClass,
              currentColor === hex
                ? 'border-foreground shadow-sm ring-1 ring-offset-1 ring-foreground/20'
                : 'border-transparent hover:border-foreground/30 hover:scale-110'
            )}
            style={{ backgroundColor: hex }}
            onClick={() => handleSelect(hex)}
          >
            {currentColor === hex && (
              <Check
                className={cn(checkSizeClass, hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#f3f3f3' ? 'text-gray-700' : 'text-white')}
                strokeWidth={2.5}
              />
            )}
          </button>
        ))}
      </div>

      {/* Standard row */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Standard
        </span>
        <div className={cn('grid gap-1 grid-cols-10')}>
          {STANDARD_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              className={cn(
                'rounded-full border-2 transition-all flex items-center justify-center shrink-0',
                sizeClass,
                currentColor === hex
                  ? 'border-foreground shadow-sm ring-1 ring-offset-1 ring-foreground/20'
                  : 'border-transparent hover:border-foreground/30 hover:scale-110'
              )}
              style={{ backgroundColor: hex }}
              onClick={() => handleSelect(hex)}
            >
              {currentColor === hex && (
                <Check
                  className={cn(checkSizeClass, hex.toLowerCase() === '#ffffff' ? 'text-gray-700' : 'text-white')}
                  strokeWidth={2.5}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
