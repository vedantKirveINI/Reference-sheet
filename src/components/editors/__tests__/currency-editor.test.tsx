import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyEditor } from '../currency-editor';
import type { ICurrencyData } from '@/types';

describe('CurrencyEditor', () => {
  const mockValue: ICurrencyData = {
    countryCode: 'US',
    currencyCode: 'USD',
    currencySymbol: '$',
    currencyValue: '100.50',
  };

  it('renders with null value', () => {
    render(<CurrencyEditor value={null} onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('0.00');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('renders with existing value', () => {
    render(<CurrencyEditor value={mockValue} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('0.00')).toHaveValue('100.50');
  });

  it('shows USD currency code from default US country', () => {
    render(<CurrencyEditor value={null} onChange={vi.fn()} />);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('accepts numeric input and calls onChange', () => {
    const onChange = vi.fn();
    render(<CurrencyEditor value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '42.99' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: 'US',
        currencyCode: 'USD',
        currencySymbol: '$',
        currencyValue: '42.99',
      })
    );
  });

  it('rejects non-numeric input', () => {
    const onChange = vi.fn();
    render(<CurrencyEditor value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: 'abc' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with null when value is cleared', () => {
    const onChange = vi.fn();
    render(<CurrencyEditor value={mockValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onSave on Enter key', () => {
    const onSave = vi.fn();
    const onChange = vi.fn();
    render(<CurrencyEditor value={mockValue} onChange={onChange} onSave={onSave} />);
    fireEvent.keyDown(screen.getByPlaceholderText('0.00'), { key: 'Enter' });
    expect(onSave).toHaveBeenCalled();
  });

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn();
    render(<CurrencyEditor value={mockValue} onChange={vi.fn()} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByPlaceholderText('0.00'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onSave on Tab key', () => {
    const onSave = vi.fn();
    render(<CurrencyEditor value={mockValue} onChange={vi.fn()} onSave={onSave} />);
    fireEvent.keyDown(screen.getByPlaceholderText('0.00'), { key: 'Tab' });
    expect(onSave).toHaveBeenCalled();
  });

  it('sanitizes input with commas', () => {
    const onChange = vi.fn();
    render(<CurrencyEditor value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1,000' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ currencyValue: '1000' })
    );
  });

  it('is disabled when disabled prop is true', () => {
    render(<CurrencyEditor value={null} onChange={vi.fn()} disabled />);
    expect(screen.getByPlaceholderText('0.00')).toBeDisabled();
  });
});
