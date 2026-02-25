import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { useUIStore } from '@/stores/ui-store';

describe('useTheme', () => {
  beforeEach(() => {
    useUIStore.setState({
      theme: 'light',
      accentColor: '#39A380',
    });
    document.documentElement.classList.remove('dark');
    document.documentElement.style.cssText = '';
    const url = new URL(window.location.href);
    url.search = '';
    Object.defineProperty(window, 'location', {
      value: url,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('returns current theme from store', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
    });

    it('returns current accent color from store', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.accentColor).toBe('#39A380');
    });

    it('exposes setTheme function', () => {
      const { result } = renderHook(() => useTheme());
      expect(typeof result.current.setTheme).toBe('function');
    });

    it('exposes setAccentColor function', () => {
      const { result } = renderHook(() => useTheme());
      expect(typeof result.current.setAccentColor).toBe('function');
    });

    it('exposes toggleTheme function', () => {
      const { result } = renderHook(() => useTheme());
      expect(typeof result.current.toggleTheme).toBe('function');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('dark');
    });

    it('toggles from dark to light', () => {
      useUIStore.setState({ theme: 'dark' });
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('light');
    });

    it('toggles back and forth', () => {
      const { result } = renderHook(() => useTheme());
      act(() => result.current.toggleTheme());
      expect(result.current.theme).toBe('dark');
      act(() => result.current.toggleTheme());
      expect(result.current.theme).toBe('light');
    });
  });

  describe('dark mode class on document', () => {
    it('adds dark class when theme is dark', () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setTheme('dark');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when theme is light', () => {
      document.documentElement.classList.add('dark');
      useUIStore.setState({ theme: 'dark' });
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setTheme('light');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('does not have dark class initially with light theme', () => {
      renderHook(() => useTheme());
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('accent color CSS variables', () => {
    it('sets --color-theme-accent on root', () => {
      renderHook(() => useTheme());
      expect(document.documentElement.style.getPropertyValue('--color-theme-accent')).toBe('#39A380');
    });

    it('updates CSS variables when accent color changes', () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setAccentColor('#2563EB');
      });
      expect(document.documentElement.style.getPropertyValue('--color-theme-accent')).toBe('#2563EB');
    });

    it('sets accent-light variable', () => {
      renderHook(() => useTheme());
      const value = document.documentElement.style.getPropertyValue('--color-theme-accent-light');
      expect(value).toBeTruthy();
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('sets accent-subtle variable', () => {
      renderHook(() => useTheme());
      const value = document.documentElement.style.getPropertyValue('--color-theme-accent-subtle');
      expect(value).toBeTruthy();
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('sets accent-dark variable', () => {
      renderHook(() => useTheme());
      const value = document.documentElement.style.getPropertyValue('--color-theme-accent-dark');
      expect(value).toBeTruthy();
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('sets accent-foreground to white', () => {
      renderHook(() => useTheme());
      expect(document.documentElement.style.getPropertyValue('--color-theme-accent-foreground')).toBe('#ffffff');
    });
  });

  describe('URL param theming', () => {
    it('reads theme from URL param', () => {
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost?theme=dark'),
        writable: true,
      });
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('dark');
    });

    it('reads accent from URL param with hash', () => {
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost?accent=%232563EB'),
        writable: true,
      });
      const { result } = renderHook(() => useTheme());
      expect(result.current.accentColor).toBe('#2563EB');
    });

    it('reads accent from URL param without hash', () => {
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost?accent=2563EB'),
        writable: true,
      });
      const { result } = renderHook(() => useTheme());
      expect(result.current.accentColor).toBe('#2563EB');
    });

    it('reads color param as fallback for accent', () => {
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost?color=DB2777'),
        writable: true,
      });
      const { result } = renderHook(() => useTheme());
      expect(result.current.accentColor).toBe('#DB2777');
    });

    it('ignores invalid theme param', () => {
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost?theme=invalid'),
        writable: true,
      });
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
    });

    it('ignores invalid accent param', () => {
      Object.defineProperty(window, 'location', {
        value: new URL('http://localhost?accent=notahex'),
        writable: true,
      });
      const { result } = renderHook(() => useTheme());
      expect(result.current.accentColor).toBe('#39A380');
    });
  });

  describe('setTheme', () => {
    it('sets theme to dark', () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setTheme('dark');
      });
      expect(result.current.theme).toBe('dark');
    });

    it('sets theme to light', () => {
      useUIStore.setState({ theme: 'dark' });
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setTheme('light');
      });
      expect(result.current.theme).toBe('light');
    });
  });

  describe('setAccentColor', () => {
    it('updates accent color in store', () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setAccentColor('#7C3AED');
      });
      expect(result.current.accentColor).toBe('#7C3AED');
    });

    it('updates CSS variables when accent changes', () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setAccentColor('#EA580C');
      });
      expect(document.documentElement.style.getPropertyValue('--color-theme-accent')).toBe('#EA580C');
    });
  });
});

describe('helper functions', () => {
  describe('hexToRgb (tested indirectly via CSS variable output)', () => {
    it('produces correct light variant for known color', () => {
      useUIStore.setState({ accentColor: '#000000' });
      renderHook(() => useTheme());
      const light = document.documentElement.style.getPropertyValue('--color-theme-accent-light');
      expect(light).toBe('#e6e6e6');
    });

    it('produces correct dark variant for known color', () => {
      useUIStore.setState({ accentColor: '#ffffff' });
      renderHook(() => useTheme());
      const dark = document.documentElement.style.getPropertyValue('--color-theme-accent-dark');
      expect(dark).toBe('#cccccc');
    });
  });

  describe('mixWithWhite (tested indirectly)', () => {
    it('mixing black with 0.9 white gives light gray', () => {
      useUIStore.setState({ accentColor: '#000000' });
      renderHook(() => useTheme());
      const light = document.documentElement.style.getPropertyValue('--color-theme-accent-light');
      expect(light).toBe('#e6e6e6');
    });

    it('mixing white with 0.9 white stays white', () => {
      useUIStore.setState({ accentColor: '#ffffff' });
      renderHook(() => useTheme());
      const light = document.documentElement.style.getPropertyValue('--color-theme-accent-light');
      expect(light).toBe('#ffffff');
    });
  });

  describe('darken (tested indirectly)', () => {
    it('darkening black stays black', () => {
      useUIStore.setState({ accentColor: '#000000' });
      renderHook(() => useTheme());
      const dark = document.documentElement.style.getPropertyValue('--color-theme-accent-dark');
      expect(dark).toBe('#000000');
    });
  });
});
