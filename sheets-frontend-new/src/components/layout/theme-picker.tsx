import { Palette, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUIStore, THEME_PRESETS } from "@/stores";
import { cn } from "@/lib/utils";

export function ThemePicker() {
  const accentColor = useUIStore((s) => s.accentColor);
  const setAccentColor = useUIStore((s) => s.setAccentColor);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-accent/50 transition-colors">
          <Palette className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: accentColor }} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[200px] p-2.5 island-elevated">
        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">Accent</p>
            <div className="grid grid-cols-5 gap-1.5">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  title={preset.name}
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center transition-all hover:scale-110",
                    accentColor === preset.color && "ring-[1.5px] ring-offset-2 ring-offset-background"
                  )}
                  style={{ 
                    backgroundColor: preset.color,
                    ...(accentColor === preset.color ? { '--tw-ring-color': preset.color } as React.CSSProperties : {})
                  }}
                  onClick={() => setAccentColor(preset.color)}
                >
                  {accentColor === preset.color && (
                    <Check className="h-3 w-3 text-white" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
