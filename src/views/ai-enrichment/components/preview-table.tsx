import { TableIcon } from 'lucide-react';

interface ProspectItem {
  title: string;
  url: string;
  content: string;
}

interface PreviewTableProps {
  data: ProspectItem[];
}

export function PreviewTable({ data }: PreviewTableProps) {
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
      <table className="w-full border-collapse text-xs" style={{ minWidth: '700px' }}>
        <colgroup>
          <col style={{ width: '40px' }} />
          <col style={{ width: '220px' }} />
          <col style={{ width: '200px' }} />
          <col />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted border-b border-border/50">
            <th className="py-2 px-2 text-right font-medium text-muted-foreground text-[11px] border-r border-border/30">
              #
            </th>
            <th className="py-2 px-3 text-left font-medium text-muted-foreground text-[11px] border-r border-border/30">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-muted-foreground/60">≡</span>
                Title
              </span>
            </th>
            <th className="py-2 px-3 text-left font-medium text-muted-foreground text-[11px] border-r border-border/30">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-muted-foreground/60">≡</span>
                Url
              </span>
            </th>
            <th className="py-2 px-3 text-left font-medium text-muted-foreground text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-muted-foreground/60">≡</span>
                Content
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="group border-b border-border/30 hover:bg-muted/20 transition-colors"
            >
              <td className="py-2 px-2 text-right align-top text-[11px] text-muted-foreground/60 border-r border-border/20 font-mono">
                {idx + 1}
              </td>
              <td className="py-2 px-3 align-top border-r border-border/20">
                <span className="text-[11px] text-foreground leading-relaxed">
                  {row.title}
                </span>
              </td>
              <td className="py-2 px-3 align-top border-r border-border/20">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-500 hover:underline leading-relaxed break-all"
                >
                  {row.url}
                </a>
              </td>
              <td className="py-2 px-3 align-top">
                <span className="text-[11px] text-foreground/80 leading-relaxed">
                  {row.content}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
