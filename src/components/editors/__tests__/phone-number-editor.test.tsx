import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneNumberEditor } from '../phone-number-editor';
import type { IPhoneNumberData } from '@/types';

describe('PhoneNumberEditor', () => {
  const mockValue: IPhoneNumberData = {
    countryCode: 'US',
    countryNumber: '1',
    phoneNumber: '5551234567',
  };

  it('renders with null value', () => {
    render(<PhoneNumberEditor value={null} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Phone number')).toHaveValue('');
  });

  it('renders with existing value', () => {
    render(<PhoneNumberEditor value={mockValue} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Phone number')).toHaveValue('5551234567');
  });

  it('shows phone code for US', () => {
    render(<PhoneNumberEditor value={null} onChange={vi.fn()} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('calls onChange with phone data on input', () => {
    const onChange = vi.fn();
    render(<PhoneNumberEditor value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: '5559999999' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: 'US',
        countryNumber: '1',
        phoneNumber: '5559999999',
      })
    );
  });

  it('calls onChange with null on empty input', () => {
    const onChange = vi.fn();
    render(<PhoneNumberEditor value={mockValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('strips non-phone characters from input', () => {
    const onChange = vi.fn();
    render(<PhoneNumberEditor value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: '555-123-4567' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: '555-123-4567' })
    );
  });

  it('calls onSave on Enter key', () => {
    const onSave = vi.fn();
    render(<PhoneNumberEditor value={mockValue} onChange={vi.fn()} onSave={onSave} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Phone number'), { key: 'Enter' });
    expect(onSave).toHaveBeenCalled();
  });

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn();
    render(<PhoneNumberEditor value={mockValue} onChange={vi.fn()} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Phone number'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onSave on Tab key', () => {
    const onSave = vi.fn();
    render(<PhoneNumberEditor value={mockValue} onChange={vi.fn()} onSave={onSave} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Phone number'), { key: 'Tab' });
    expect(onSave).toHaveBeenCalled();
  });

  it('builds null value when phone is empty on Enter', () => {
    const onChange = vi.fn();
    const onSave = vi.fn();
    render(<PhoneNumberEditor value={null} onChange={onChange} onSave={onSave} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Phone number'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('is disabled when disabled prop is true', () => {
    render(<PhoneNumberEditor value={null} onChange={vi.fn()} disabled />);
    expect(screen.getByPlaceholderText('Phone number')).toBeDisabled();
  });
});
