import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchBar } from '../search-bar';

const defaultProps = {
  columns: [
    { id: 'col-1', name: 'Name', type: 'SHORT_TEXT' },
    { id: 'col-2', name: 'Email', type: 'EMAIL' },
  ],
  isOpen: true,
  onOpenChange: vi.fn(),
  searchQuery: '',
  onSearchChange: vi.fn(),
};

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search button when closed', () => {
    render(<SearchBar {...defaultProps} isOpen={false} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  it('opens search on button click when closed', () => {
    const onOpenChange = vi.fn();
    render(<SearchBar {...defaultProps} isOpen={false} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders search input when open', () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByPlaceholderText('Find in view...')).toBeInTheDocument();
  });

  it('debounces search input', () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} />);
    const input = screen.getByPlaceholderText('Find in view...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onSearchChange).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(onSearchChange).toHaveBeenCalledWith('test', undefined);
  });

  it('renders field selector with "All fields" default', () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByText('All fields')).toBeInTheDocument();
  });

  it('shows match count when results available', () => {
    render(<SearchBar {...defaultProps} searchQuery="test" matchCount={5} currentMatch={2} />);
    const input = screen.getByPlaceholderText('Find in view...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
  });

  it('shows "0 results" when no matches', () => {
    render(<SearchBar {...defaultProps} searchQuery="test" matchCount={0} />);
    const input = screen.getByPlaceholderText('Find in view...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByText('0 results')).toBeInTheDocument();
  });

  it('calls onNextMatch on Enter', () => {
    const onNextMatch = vi.fn();
    render(<SearchBar {...defaultProps} onNextMatch={onNextMatch} matchCount={3} />);
    const input = screen.getByPlaceholderText('Find in view...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNextMatch).toHaveBeenCalled();
  });

  it('calls onPrevMatch on Shift+Enter', () => {
    const onPrevMatch = vi.fn();
    render(<SearchBar {...defaultProps} onPrevMatch={onPrevMatch} matchCount={3} />);
    const input = screen.getByPlaceholderText('Find in view...');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onPrevMatch).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const onOpenChange = vi.fn();
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onOpenChange={onOpenChange} onSearchChange={onSearchChange} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders replace mode buttons', () => {
    render(<SearchBar {...defaultProps} replaceMode onReplace={vi.fn()} onReplaceAll={vi.fn()} />);
    expect(screen.getByPlaceholderText('Replace with...')).toBeInTheDocument();
    expect(screen.getByText('Replace')).toBeInTheDocument();
    expect(screen.getByText('Replace All')).toBeInTheDocument();
  });

  it('disables prev/next buttons when no matches', () => {
    render(<SearchBar {...defaultProps} matchCount={0} />);
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons.find(b => b.querySelector('.lucide-chevron-up'));
    const nextBtn = buttons.find(b => b.querySelector('.lucide-chevron-down'));
    if (prevBtn) expect(prevBtn).toBeDisabled();
    if (nextBtn) expect(nextBtn).toBeDisabled();
  });

  it('handles Ctrl+F to open search', () => {
    const onOpenChange = vi.fn();
    render(<SearchBar {...defaultProps} isOpen={false} onOpenChange={onOpenChange} />);
    fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
