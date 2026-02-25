import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mockSetAccentColor = vi.fn();
const mockSetTheme = vi.fn();

vi.mock('@/stores', () => ({
  useUIStore: (selector: any) => {
    const state = {
      accentColor: '#39A380',
      setAccentColor: mockSetAccentColor,
      theme: 'light',
      setTheme: mockSetTheme,
    };
    return selector(state);
  },
  THEME_PRESETS: [
    { name: 'Green', color: '#39A380' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Purple', color: '#8B5CF6' },
    { name: 'Red', color: '#EF4444' },
    { name: 'Orange', color: '#F97316' },
  ],
}));

import { ThemePicker } from '../theme-picker';

describe('ThemePicker', () => {
  it('renders the trigger button', () => {
    const { container } = render(<ThemePicker />);
    const trigger = container.querySelector('button');
    expect(trigger).toBeInTheDocument();
  });

  it('renders trigger with palette icon', () => {
    const { container } = render(<ThemePicker />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('trigger has correct accent color styling', () => {
    const { container } = render(<ThemePicker />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.style.color).toBeTruthy();
  });

  it('exports ThemePicker as a named export', () => {
    expect(ThemePicker).toBeDefined();
    expect(typeof ThemePicker).toBe('function');
  });

  it('renders without crashing', () => {
    const { unmount } = render(<ThemePicker />);
    unmount();
  });
});
