import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckboxEditor } from '../checkbox-editor';

describe('CheckboxEditor', () => {
  it('renders unchecked state when value is false', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} onChange={onChange} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn.querySelector('svg')).toBeNull();
  });

  it('renders unchecked state when value is null', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={null} onChange={onChange} />);
    const btn = screen.getByRole('button');
    expect(btn.querySelector('svg')).toBeNull();
  });

  it('renders checked state when value is true', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={true} onChange={onChange} />);
    const btn = screen.getByRole('button');
    expect(btn.querySelector('svg')).toBeTruthy();
  });

  it('toggles from false to true on click', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles from true to false on click', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies disabled styling', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} onChange={onChange} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
