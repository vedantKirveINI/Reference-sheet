import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressEditor, formatAddress } from '../address-editor';
import type { IAddressData } from '@/types';

describe('formatAddress', () => {
  it('formats full address', () => {
    const addr: IAddressData = {
      fullName: 'John Doe',
      addressLineOne: '123 Main St',
      addressLineTwo: 'Apt 4',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'US',
    };
    expect(formatAddress(addr)).toBe('John Doe, 123 Main St, Apt 4, Springfield, IL, 62701, US');
  });

  it('formats partial address', () => {
    expect(formatAddress({ city: 'NYC', state: 'NY' })).toBe('NYC, NY');
  });

  it('returns empty string for null', () => {
    expect(formatAddress(null)).toBe('');
  });

  it('returns empty string for empty object', () => {
    expect(formatAddress({})).toBe('');
  });
});

describe('AddressEditor', () => {
  const mockAddr: IAddressData = {
    fullName: 'John Doe',
    addressLineOne: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'US',
  };

  it('renders trigger button with formatted address', () => {
    render(<AddressEditor value={mockAddr} onChange={vi.fn()} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('renders placeholder when no address', () => {
    render(<AddressEditor value={null} onChange={vi.fn()} />);
    expect(screen.getByText('Click to add address')).toBeInTheDocument();
  });

  it('opens dialog on trigger click', () => {
    render(<AddressEditor value={null} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Click to add address'));
    expect(screen.getByText('Edit Address')).toBeInTheDocument();
  });

  it('populates fields with existing value on open', () => {
    render(<AddressEditor value={mockAddr} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText(/John Doe/));
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Springfield')).toBeInTheDocument();
  });

  it('saves address on Save click', () => {
    const onChange = vi.fn();
    render(<AddressEditor value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('Click to add address'));
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('123 Main St'), { target: { value: '456 Oak Ave' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Jane Doe',
        addressLineOne: '456 Oak Ave',
      })
    );
  });

  it('saves null when all fields are empty', () => {
    const onChange = vi.fn();
    render(<AddressEditor value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('Click to add address'));
    fireEvent.click(screen.getByText('Save'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('clears all fields on Clear All click', () => {
    const onChange = vi.fn();
    render(<AddressEditor value={mockAddr} onChange={onChange} />);
    fireEvent.click(screen.getByText(/John Doe/));
    fireEvent.click(screen.getByText('Clear All'));
    expect(screen.getByPlaceholderText('John Doe')).toHaveValue('');
    expect(screen.getByPlaceholderText('123 Main St')).toHaveValue('');
  });

  it('closes dialog on Cancel', () => {
    render(<AddressEditor value={null} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Click to add address'));
    expect(screen.getByText('Edit Address')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
  });

  it('does not open when disabled', () => {
    render(<AddressEditor value={null} onChange={vi.fn()} disabled />);
    fireEvent.click(screen.getByText('Click to add address'));
    expect(screen.queryByText('Edit Address')).toBeNull();
  });

  it('works with controlled open prop', () => {
    render(<AddressEditor value={null} onChange={vi.fn()} open={true} triggerMode="auto" />);
    expect(screen.getByText('Edit Address')).toBeInTheDocument();
  });

  it('trims whitespace from fields on save', () => {
    const onChange = vi.fn();
    render(<AddressEditor value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('Click to add address'));
    fireEvent.change(screen.getByPlaceholderText('New York'), { target: { value: '  Chicago  ' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Chicago' })
    );
  });
});
