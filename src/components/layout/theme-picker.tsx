import { Palette, Sun, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUIStore, THEME_PRESETS } from "@/stores";
import { cn } from "@/lib/utils";

export function ThemePicker() {
  const { accentColor, setAccentColor, theme, setTheme } = useUIStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Palette className="h-4 w-4" style={{ color: accentColor }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[220px] p-3">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Theme Color</p>
            <div className="grid grid-cols-5 gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  title={preset.name}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:ring-2 hover:ring-offset-2 ring-offset-background",
                    accentColor === preset.color && "ring-2 ring-offset-2"
                  )}
                  style={{ 
                    backgroundColor: preset.color,
                    ...(accentColor === preset.color ? { '--tw-ring-color': preset.color } as React.CSSProperties : {})
                  }}
                  onClick={() => setAccentColor(preset.color)}
                >
                  {accentColor === preset.color && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Appearance</p>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              <button
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-colors",
                  theme === "light" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
              <button
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-colors",
                  theme === "dark" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
