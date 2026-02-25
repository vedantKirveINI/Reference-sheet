import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from '../switch';

describe('Switch', () => {
  it('renders unchecked by default', () => {
    render(<Switch aria-label="Toggle" />);
    const sw = screen.getByRole('switch');
    expect(sw).toBeInTheDocument();
    expect(sw).not.toBeChecked();
  });

  it('renders checked when checked prop is true', () => {
    render(<Switch checked aria-label="Toggle" />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls onCheckedChange on click', () => {
    const onChange = vi.fn();
    render(<Switch onCheckedChange={onChange} aria-label="Toggle" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('handles disabled state', () => {
    render(<Switch disabled aria-label="Toggle" />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('does not fire onCheckedChange when disabled', () => {
    const onChange = vi.fn();
    render(<Switch disabled onCheckedChange={onChange} aria-label="Toggle" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
