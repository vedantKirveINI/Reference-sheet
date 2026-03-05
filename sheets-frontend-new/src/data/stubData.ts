import { ITableData, IRecord, IColumn, IRowHeader, RowHeightLevel } from '@/types/grid';
import { CellType } from '@/types/cell';

export const STUB_COLUMNS: IColumn[] = [
  { id: 'col_name',       name: 'Product Name',  type: CellType.String,  width: 200 },
  { id: 'col_region',     name: 'Region',        type: CellType.String,  width: 130 },
  { id: 'col_category',   name: 'Category',      type: CellType.String,  width: 140 },
  { id: 'col_unit_price', name: 'Unit Price',    type: CellType.Number,  width: 120 },
  { id: 'col_quantity',   name: 'Quantity',      type: CellType.Number,  width: 110 },
  { id: 'col_discount',   name: 'Discount (%)',  type: CellType.Number,  width: 130 },
  { id: 'col_revenue',    name: 'Revenue',       type: CellType.Number,  width: 130 },
  { id: 'col_notes',      name: 'Notes',         type: CellType.String,  width: 220 },
];

interface StubRow {
  name: string;
  region: string;
  category: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  revenue: number;
  notes: string;
}

const ROWS: StubRow[] = [
  { name: 'Wireless Headphones',  region: 'North',  category: 'Electronics', unitPrice: 89.99,  quantity: 120, discount: 10, revenue: 9718.92,  notes: 'Top seller Q1' },
  { name: 'Standing Desk',        region: 'West',   category: 'Furniture',   unitPrice: 349.00, quantity: 45,  discount: 5,  revenue: 14929.25, notes: 'Bulk order discount' },
  { name: 'Ergonomic Chair',      region: 'East',   category: 'Furniture',   unitPrice: 259.00, quantity: 60,  discount: 8,  revenue: 14296.80, notes: '' },
  { name: 'USB-C Hub',            region: 'South',  category: 'Electronics', unitPrice: 49.99,  quantity: 200, discount: 0,  revenue: 9998.00,  notes: 'No discount applied' },
  { name: 'Mechanical Keyboard',  region: 'North',  category: 'Electronics', unitPrice: 129.00, quantity: 80,  discount: 12, revenue: 9081.60,  notes: '' },
  { name: 'Monitor 27"',          region: 'West',   category: 'Electronics', unitPrice: 399.00, quantity: 35,  discount: 7,  revenue: 12986.45, notes: 'Display promo' },
  { name: 'Notebook Pack',        region: 'East',   category: 'Stationery',  unitPrice: 12.50,  quantity: 500, discount: 20, revenue: 5000.00,  notes: 'Wholesale' },
  { name: 'Webcam HD',            region: 'South',  category: 'Electronics', unitPrice: 79.99,  quantity: 95,  discount: 5,  revenue: 7214.10,  notes: '' },
  { name: 'Desk Lamp',            region: 'North',  category: 'Furniture',   unitPrice: 34.99,  quantity: 150, discount: 0,  revenue: 5248.50,  notes: 'New SKU' },
  { name: 'Cable Management Kit', region: 'West',   category: 'Accessories', unitPrice: 19.99,  quantity: 300, discount: 15, revenue: 5097.45,  notes: '' },
  { name: 'Laser Mouse',          region: 'East',   category: 'Electronics', unitPrice: 59.99,  quantity: 110, discount: 10, revenue: 5939.01,  notes: '' },
  { name: 'Whiteboard',           region: 'South',  category: 'Stationery',  unitPrice: 89.00,  quantity: 28,  discount: 0,  revenue: 2492.00,  notes: 'Office supplies' },
];

function makeCell(type: CellType, raw: string | number): import('@/types/cell').ICell {
  if (type === CellType.Number) {
    const n = raw as number;
    return { type: CellType.Number, data: n, displayData: String(n) };
  }
  return { type: CellType.String, data: String(raw), displayData: String(raw) };
}

function buildRecords(): IRecord[] {
  return ROWS.map((row, i) => ({
    id: `stub_record_${i + 1}`,
    cells: {
      col_name:       makeCell(CellType.String, row.name),
      col_region:     makeCell(CellType.String, row.region),
      col_category:   makeCell(CellType.String, row.category),
      col_unit_price: makeCell(CellType.Number, row.unitPrice),
      col_quantity:   makeCell(CellType.Number, row.quantity),
      col_discount:   makeCell(CellType.Number, row.discount),
      col_revenue:    makeCell(CellType.Number, row.revenue),
      col_notes:      makeCell(CellType.String, row.notes),
    },
  }));
}

function buildRowHeaders(count: number): IRowHeader[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `stub_record_${i + 1}`,
    rowIndex: i,
    heightLevel: RowHeightLevel.Short,
    displayIndex: i + 1,
    orderValue: i + 1,
  }));
}

const records = buildRecords();

export const STUB_TABLE_DATA: ITableData = {
  columns: STUB_COLUMNS,
  records,
  rowHeaders: buildRowHeaders(records.length),
};

export const STUB_TABLE_LIST = [
  {
    id: 'stub_table_1',
    name: 'Sales Data',
    views: [
      { id: 'stub_view_1', name: 'Grid View', type: 'default_grid', user_id: '' },
    ],
  },
];
