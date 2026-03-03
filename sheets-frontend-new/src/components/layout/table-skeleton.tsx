export function TableSkeleton() {
  const cols = 7;
  const rows = 12;
  
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden animate-pulse">
      <div className="flex border-b border-border bg-muted">
        <div className="w-16 h-9 border-r border-border" />
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} className="flex-1 min-w-[120px] h-9 border-r border-border px-3 py-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-20" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex border-b border-border/50">
          <div className="w-16 h-9 border-r border-border/50 flex items-center justify-center">
            <div className="h-3 w-6 bg-muted-foreground/20 rounded" />
          </div>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="flex-1 min-w-[120px] h-9 border-r border-border/50 px-3 py-2">
              <div className={`h-4 ${(r + c) % 3 === 0 ? 'bg-muted-foreground/20' : 'bg-muted-foreground/10'} rounded`} style={{ width: `${40 + ((r * 7 + c * 13) % 60)}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
