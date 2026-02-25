import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CountryPicker } from '../country-picker';

describe('CountryPicker', () => {
  it('renders with selected country flag', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} />);
    const img = screen.getByAltText('United States');
    expect(img).toBeInTheDocument();
  });

  it('shows phone code when showPhoneCode is true', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} showPhoneCode />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('shows currency info when showCurrencyInfo is true', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} showCurrencyInfo />);
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByPlaceholderText('Search country...')).toBeInTheDocument();
  });

  it('shows currency search placeholder when showCurrencyInfo', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} showCurrencyInfo />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByPlaceholderText('Search country or currency...')).toBeInTheDocument();
  });

  it('filters countries by search query', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    const searchInput = screen.getByPlaceholderText('Search country...');
    fireEvent.change(searchInput, { target: { value: 'Germany' } });
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('shows "No countries found" for invalid search', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    const searchInput = screen.getByPlaceholderText('Search country...');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
    expect(screen.getByText('No countries found')).toBeInTheDocument();
  });

  it('calls onSelect when a country is clicked', () => {
    const onSelect = vi.fn();
    render(<CountryPicker selectedCountryCode="US" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    const searchInput = screen.getByPlaceholderText('Search country...');
    fireEvent.change(searchInput, { target: { value: 'India' } });
    fireEvent.click(screen.getByText('India'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'IN', countryName: 'India' })
    );
  });

  it('closes dropdown after selecting a country', () => {
    const onSelect = vi.fn();
    render(<CountryPicker selectedCountryCode="US" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByPlaceholderText('Search country...'), { target: { value: 'India' } });
    fireEvent.click(screen.getByText('India'));
    expect(screen.queryByPlaceholderText('Search country...')).toBeNull();
  });

  it('does not open when disabled', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByPlaceholderText('Search country...')).toBeNull();
  });

  it('applies compact styling', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} compact />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('px-1.5');
  });

  it('filters by country code', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByPlaceholderText('Search country...'), { target: { value: 'GB' } });
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('shows phone code in dropdown when showPhoneCode is true', () => {
    render(<CountryPicker selectedCountryCode="US" onSelect={vi.fn()} showPhoneCode />);
    fireEvent.click(screen.getByRole('button'));
    const phoneCodeElements = screen.getAllByText('+1');
    expect(phoneCodeElements.length).toBeGreaterThan(0);
  });
});
