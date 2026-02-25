import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryView } from '../gallery-view';
import { CellType } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'common:records.newRecord': 'New Record',
      };
      return map[k] ?? k;
    },
  }),
}));

function makeData(overrides: Record<string, any> = {}) {
  return {
    columns: overrides.columns ?? [
      { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
      { id: 'col-2', name: 'Amount', type: CellType.Number, width: 100 },
      { id: 'col-3', name: 'Status', type: CellType.SCQ, width: 150 },
    ],
    records: overrides.records ?? [
      {
        id: 'rec-1',
        cells: {
          'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice', options: {} },
          'col-2': { type: CellType.Number, data: 100, displayData: '100', options: {} },
          'col-3': { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active'] } },
        },
      },
      {
        id: 'rec-2',
        cells: {
          'col-1': { type: CellType.String, data: 'Bob', displayData: 'Bob', options: {} },
          'col-2': { type: CellType.Number, data: 200, displayData: '200', options: {} },
          'col-3': { type: CellType.SCQ, data: 'Inactive', displayData: 'Inactive', options: { options: ['Inactive'] } },
        },
      },
    ],
  };
}

describe('GalleryView', () => {
  it('renders without crashing', () => {
    const { container } = render(<GalleryView data={makeData() as any} />);
    expect(container).toBeTruthy();
  });

  it('renders record cards', () => {
    render(<GalleryView data={makeData() as any} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders add new record button', () => {
    render(<GalleryView data={makeData() as any} />);
    expect(screen.getByText('New Record')).toBeInTheDocument();
  });

  it('calls onAddRow when add button clicked', () => {
    const onAddRow = vi.fn();
    render(<GalleryView data={makeData() as any} onAddRow={onAddRow} />);
    fireEvent.click(screen.getByText('New Record'));
    expect(onAddRow).toHaveBeenCalled();
  });

  it('calls onExpandRecord when card is clicked', () => {
    const onExpand = vi.fn();
    render(<GalleryView data={makeData() as any} onExpandRecord={onExpand} />);
    fireEvent.click(screen.getByText('Alice'));
    expect(onExpand).toHaveBeenCalledWith('rec-1');
  });

  it('renders first letter as placeholder when no cover image', () => {
    render(<GalleryView data={makeData() as any} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders additional field values on cards', () => {
    render(<GalleryView data={makeData() as any} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders field names on cards', () => {
    render(<GalleryView data={makeData() as any} />);
    expect(screen.getAllByText('Amount:').length).toBeGreaterThanOrEqual(1);
  });

  it('filters out group records', () => {
    const data = makeData({
      records: [
        ...makeData().records,
        { id: '__group__1', cells: {} },
      ],
    });
    render(<GalleryView data={data as any} />);
    const cards = screen.getAllByRole('button');
    const actualCards = cards.filter(b => b.textContent !== 'New Record');
    expect(actualCards.length).toBe(2);
  });

  it('renders with cover image when FileUpload field has image', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
        { id: 'col-file', name: 'Photo', type: CellType.FileUpload, width: 200 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice', options: {} },
            'col-file': {
              type: CellType.FileUpload,
              data: [{ url: 'https://example.com/photo.jpg', mimeType: 'image/jpeg' }],
              displayData: '',
              options: {},
            },
          },
        },
      ],
    });
    const { container } = render(<GalleryView data={data as any} />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('https://example.com/photo.jpg');
  });

  it('renders responsive grid', () => {
    const { container } = render(<GalleryView data={makeData() as any} />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.classList.contains('grid-cols-1')).toBe(true);
  });

  it('renders empty state with add button', () => {
    const data = makeData({ records: [] });
    render(<GalleryView data={data as any} />);
    expect(screen.getByText('New Record')).toBeInTheDocument();
  });
});
