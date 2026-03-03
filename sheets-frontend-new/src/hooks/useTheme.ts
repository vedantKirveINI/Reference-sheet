import { useEffect, useCallback, useRef } from "react";
import { useUIStore } from "@/stores/ui-store";

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function mixWithWhite(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount)
  );
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r * amount),
    Math.round(g * amount),
    Math.round(b * amount)
  );
}

export function useTheme() {
  const theme = useUIStore((s) => s.theme);
  const accentColor = useUIStore((s) => s.accentColor);
  const setTheme = useUIStore((s) => s.setTheme);
  const setAccentColor = useUIStore((s) => s.setAccentColor);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const params = new URLSearchParams(window.location.search);
    
    const themeParam = params.get('theme');
    if (themeParam === 'dark' || themeParam === 'light') {
      setTheme(themeParam);
    }
    
    let accentParam = params.get('accent');
    if (accentParam && !accentParam.startsWith('#') && /^[0-9a-fA-F]{6}$/.test(accentParam)) {
      accentParam = '#' + accentParam;
    }
    if (!accentParam) {
      const colorParam = params.get('color');
      if (colorParam && /^[0-9a-fA-F]{6}$/.test(colorParam)) {
        accentParam = '#' + colorParam;
      }
    }
    if (accentParam && /^#[0-9a-fA-F]{6}$/.test(accentParam)) {
      setAccentColor(accentParam);
    }
  }, [setTheme, setAccentColor]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-theme-accent", accentColor);
    root.style.setProperty("--color-theme-accent-light", mixWithWhite(accentColor, 0.9));
    root.style.setProperty("--color-theme-accent-subtle", mixWithWhite(accentColor, 0.95));
    root.style.setProperty("--color-theme-accent-dark", darken(accentColor, 0.8));
    root.style.setProperty("--color-theme-accent-foreground", "#ffffff");
  }, [accentColor]);

  return { theme, accentColor, setTheme, setAccentColor, toggleTheme };
}

export default useTheme;
