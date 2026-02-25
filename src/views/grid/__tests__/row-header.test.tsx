import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RowHeader } from '../row-header';

describe('RowHeader', () => {
  it('renders row number', () => {
    render(<RowHeader rowNumber={5} isSelected={false} onSelect={vi.fn()} height={36} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders with correct height', () => {
    const { container } = render(<RowHeader rowNumber={1} isSelected={false} onSelect={vi.fn()} height={48} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('48px');
  });

  it('renders with fixed width of 60', () => {
    const { container } = render(<RowHeader rowNumber={1} isSelected={false} onSelect={vi.fn()} height={36} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('60px');
    expect(el.style.minWidth).toBe('60px');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(<RowHeader rowNumber={1} isSelected={false} onSelect={onSelect} height={36} />);
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows checkbox', () => {
    render(<RowHeader rowNumber={1} isSelected={false} onSelect={vi.fn()} height={36} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('shows checked checkbox when selected', () => {
    render(<RowHeader rowNumber={1} isSelected={true} onSelect={vi.fn()} height={36} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onExpand when expand button is clicked', () => {
    const onExpand = vi.fn();
    render(<RowHeader rowNumber={1} isSelected={true} onSelect={vi.fn()} onExpand={onExpand} height={36} />);
    const buttons = screen.getAllByRole('button');
    const expandButton = buttons[buttons.length - 1];
    fireEvent.click(expandButton);
    expect(onExpand).toHaveBeenCalled();
  });

  it('does not call onSelect when expand button is clicked (stopPropagation)', () => {
    const onSelect = vi.fn();
    const onExpand = vi.fn();
    render(<RowHeader rowNumber={1} isSelected={true} onSelect={onSelect} onExpand={onExpand} height={36} />);
    const buttons = screen.getAllByRole('button');
    const expandButton = buttons[buttons.length - 1];
    fireEvent.click(expandButton);
    expect(onExpand).toHaveBeenCalled();
  });

  it('does not crash without onExpand', () => {
    render(<RowHeader rowNumber={1} isSelected={false} onSelect={vi.fn()} height={36} />);
    const buttons = screen.getAllByRole('button');
    expect(() => fireEvent.click(buttons[buttons.length - 1])).not.toThrow();
  });

  it('renders different row numbers correctly', () => {
    const { rerender } = render(<RowHeader rowNumber={1} isSelected={false} onSelect={vi.fn()} height={36} />);
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<RowHeader rowNumber={999} isSelected={false} onSelect={vi.fn()} height={36} />);
    expect(screen.getByText('999')).toBeInTheDocument();
  });
});
