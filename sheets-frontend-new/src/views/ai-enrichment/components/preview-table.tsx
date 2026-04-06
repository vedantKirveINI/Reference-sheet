import { TableIcon } from 'lucide-react';

interface PreviewColumn {
  label: string;
  key: string;
}

interface PreviewTableProps {
  data: Record<string, any>[];
  columns?: PreviewColumn[];
}

const DEFAULT_COLUMNS: PreviewColumn[] = [
  { label: 'Title', key: 'title' },
  { label: 'Url', key: 'url' },
  { label: 'Content', key: 'content' },
];

function isUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value);
}

export function PreviewTable({ data, columns = DEFAULT_COLUMNS }: PreviewTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-8 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <TableIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No data yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Fill the form and search to see results</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-xs" style={{ minWidth: '43.75rem' }}>
        <colgroup>
          <col style={{ width: '2.5rem' }} />
          {columns.map((col) => (
            <col key={col.key} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted border-b border-border/50">
            <th className="py-2 px-2 text-right font-medium text-muted-foreground text-[length:var(--app-font-xs)] border-r border-border/30">
              #
            </th>
            {columns.map((col, ci) => (
              <th
                key={col.key}
                className={`py-2 px-3 text-left font-medium text-muted-foreground text-[length:var(--app-font-xs)] ${
                  ci < columns.length - 1 ? 'border-r border-border/30' : ''
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-muted-foreground/60">{'\u2261'}</span>
                  {col.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="group border-b border-border/30 hover:bg-muted/20 transition-colors"
            >
              <td className="py-2 px-2 text-right align-top text-[length:var(--app-font-xs)] text-muted-foreground/60 border-r border-border/20 font-mono">
                {idx + 1}
              </td>
              {columns.map((col, ci) => {
                const value = row[col.key];
                const isLast = ci === columns.length - 1;
                const cellBorder = isLast ? '' : 'border-r border-border/20';

                if (isUrl(value)) {
                  return (
                    <td key={col.key} className={`py-2 px-3 align-top ${cellBorder}`}>
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[length:var(--app-font-xs)] text-blue-500 hover:underline leading-relaxed break-all"
                      >
                        {value}
                      </a>
                    </td>
                  );
                }

                return (
                  <td key={col.key} className={`py-2 px-3 align-top ${cellBorder}`}>
                    <span className="text-[length:var(--app-font-xs)] text-foreground/80 leading-relaxed">
                      {value ?? ''}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
