import { useEffect, useState } from 'react';
import {
  Building2,
  Globe,
  Search,
  Sparkles,
  Users,
  Zap,
  BarChart3,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface EnrichmentSkeletonProps {
  type: 'icp_search' | 'table_creation';
  domain?: string;
}

const SEARCH_STAGES = [
  { pct: 8,  icon: Search,    label: 'Initializing search engine',         sub: 'Connecting to global business database...' },
  { pct: 22, icon: Building2, label: 'Building your company profile',      sub: 'Extracting firmographic signals from domain...' },
  { pct: 38, icon: Globe,     label: 'Scanning market segments',            sub: 'Cross-referencing industry verticals & SIC codes...' },
  { pct: 54, icon: Users,     label: 'Identifying similar companies',       sub: 'Running vector similarity across 40M+ companies...' },
  { pct: 68, icon: BarChart3, label: 'Scoring ICP match quality',           sub: 'Ranking prospects by fit score & intent signals...' },
  { pct: 82, icon: Zap,       label: 'Gathering company insights',          sub: 'Enriching records with revenue, headcount, tech stack...' },
  { pct: 94, icon: Sparkles,  label: 'Finalizing your results',             sub: 'Almost there — preparing your Ideal Customer list...' },
];

const TABLE_STAGES = [
  { pct: 15, label: 'Creating table schema' },
  { pct: 35, label: 'Configuring AI columns' },
  { pct: 60, label: 'Importing enriched records' },
  { pct: 80, label: 'Setting up views' },
  { pct: 95, label: 'Finalizing your table' },
];

function useSimulatedProgress(totalMs: number, stageCount: number) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = 94 / (totalMs / 120);
    const interval = setInterval(() => {
      current = Math.min(current + step, 94);
      setProgress(current);
      setStageIndex(Math.min(stageCount - 1, Math.floor((current / 94) * stageCount)));
      if (current >= 94) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [totalMs, stageCount]);

  return { progress, stageIndex };
}

export function EnrichmentSkeleton({ type, domain }: EnrichmentSkeletonProps) {
  const { progress, stageIndex } = useSimulatedProgress(
    type === 'icp_search' ? 13000 : 6000,
    type === 'icp_search' ? SEARCH_STAGES.length : TABLE_STAGES.length
  );

  if (type === 'table_creation') {
    const stage = TABLE_STAGES[Math.min(stageIndex, TABLE_STAGES.length - 1)];
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#39A380]/10 ring-1 ring-[#39A380]/20">
          <Loader2 className="h-7 w-7 text-[#39A380] animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">Creating your AI-enriched table</p>
          <p className="mt-1 text-xs text-muted-foreground">{stage?.label}...</p>
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Progress</span>
            <span className="text-[11px] font-semibold text-[#39A380]">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[#39A380] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  const stage = SEARCH_STAGES[Math.min(stageIndex, SEARCH_STAGES.length - 1)];
  const StageIcon = stage?.icon ?? Search;
  const displayDomain = domain || 'your company';

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-0 px-8 py-10">

        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#39A380]/10 ring-1 ring-[#39A380]/20">
              <StageIcon className="h-7 w-7 text-[#39A380]" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#39A380]">
                <span className="h-2 w-2 animate-ping rounded-full bg-white opacity-80" />
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Searching<span className="inline-flex gap-[3px] ml-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 rounded-full bg-foreground animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
                Analyzing{' '}
                <span className="font-semibold text-foreground">{displayDomain}</span>{' '}
                to find your best-fit customer companies
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#39A380]/10">
                  <StageIcon className="h-3.5 w-3.5 text-[#39A380]" />
                </div>
                <span className="text-xs font-semibold text-foreground">{stage?.label}</span>
              </div>
              <span className="text-lg font-bold tabular-nums text-[#39A380]">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#39A380] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute inset-y-0 rounded-full bg-white/30 blur-sm transition-all duration-300"
                style={{ left: `${Math.max(0, progress - 8)}%`, width: '8%' }}
              />
            </div>

            <p className="mt-2.5 text-[11px] text-muted-foreground">{stage?.sub}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {SEARCH_STAGES.map((s, i) => {
              const done = i < stageIndex;
              const active = i === stageIndex;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-300 ${
                    active ? 'bg-[#39A380]/8 border border-[#39A380]/20' :
                    done  ? 'opacity-50' : 'opacity-20'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#39A380]" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 text-[#39A380] animate-spin" />
                  ) : (
                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-border/40" />
                  )}
                  <span className={`text-[11px] ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            This usually takes 10–15 seconds &mdash; we&apos;re scanning millions of companies for you
          </p>
        </div>
      </div>
    </div>
  );
}
