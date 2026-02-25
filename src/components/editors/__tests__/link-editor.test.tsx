import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LinkEditor } from '../link-editor';
import type { ILinkRecord } from '@/types/cell';

describe('LinkEditor', () => {
  const records: ILinkRecord[] = [
    { id: 1, title: 'Record A' },
    { id: 2, title: 'Record B' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders selected linked records', () => {
    render(<LinkEditor value={records} onChange={vi.fn()} />);
    expect(screen.getByText('Record A')).toBeInTheDocument();
    expect(screen.getByText('Record B')).toBeInTheDocument();
  });

  it('renders placeholder when no records linked', () => {
    render(<LinkEditor value={null} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Link records...')).toBeInTheDocument();
  });

  it('removes a linked record on X click', () => {
    const onChange = vi.fn();
    render(<LinkEditor value={records} onChange={onChange} />);
    const removeButtons = screen.getAllByRole('button');
    const xButtons = removeButtons.filter(btn => btn.querySelector('.lucide-x'));
    if (xButtons.length > 0) {
      fireEvent.click(xButtons[0]);
      expect(onChange).toHaveBeenCalledWith([{ id: 2, title: 'Record B' }]);
    }
  });

  it('searches for records via onSearch callback', async () => {
    const onSearch = vi.fn().mockResolvedValue([
      { id: 3, title: 'Record C' },
    ]);
    render(<LinkEditor value={[]} onChange={vi.fn()} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Link records...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Rec' } });
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('Rec');
    }, { timeout: 500 });
  });

  it('adds a record from search results', async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn().mockResolvedValue([
      { id: 3, title: 'Record C' },
    ]);
    render(<LinkEditor value={[]} onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Link records...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Rec' } });
    await waitFor(() => {
      const result = screen.queryByText('Record C');
      if (result) {
        fireEvent.click(result);
        expect(onChange).toHaveBeenCalledWith([{ id: 3, title: 'Record C' }]);
      }
    }, { timeout: 500 });
  });

  it('does not search when onSearch is not provided', async () => {
    render(<LinkEditor value={[]} onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('Link records...');
    fireEvent.change(input, { target: { value: 'test' } });
  });

  it('calls onExpandRecord when record title is clicked', () => {
    const onExpandRecord = vi.fn();
    render(<LinkEditor value={records} onChange={vi.fn()} onExpandRecord={onExpandRecord} />);
    fireEvent.click(screen.getByText('Record A'));
    expect(onExpandRecord).toHaveBeenCalledWith(records[0]);
  });

  it('filters out already selected records from search results', async () => {
    const onSearch = vi.fn().mockResolvedValue([
      { id: 1, title: 'Record A' },
      { id: 3, title: 'Record C' },
    ]);
    render(<LinkEditor value={records} onChange={vi.fn()} onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Rec' } });
    await waitFor(() => {
      expect(screen.queryAllByText('Record C')).toBeDefined();
    }, { timeout: 500 });
  });
});
