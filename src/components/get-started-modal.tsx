import { Building2, Users, TrendingUp, Mail, Building, UserCircle, X, ArrowRight, Sparkles, Table2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GetStartedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBlank: () => void;
  onSelectOption: (optionId: string) => void;
  creating?: boolean;
}

const AI_OPTIONS = [
  {
    id: 'find-customer-company',
    icon: Building2,
    title: 'Find Customer',
    subtitle: 'Company',
    description: 'Build your ideal customer profile with AI-powered company discovery and ICP analysis',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.4)',
  },
  {
    id: 'find-customer-people',
    icon: Users,
    title: 'Find Customer',
    subtitle: 'People',
    description: 'Identify key decision makers and build detailed ICP profiles using AI intelligence',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.4)',
  },
  {
    id: 'find-competitors-company',
    icon: TrendingUp,
    title: 'Find Competitors',
    subtitle: 'Company',
    description: 'Discover competitors and similar businesses to understand your competitive landscape',
    gradient: 'from-orange-500 to-amber-500',
    glow: 'rgba(249,115,22,0.4)',
  },
  {
    id: 'enrich-email',
    icon: Mail,
    title: 'Enrich Email',
    subtitle: 'Info',
    description: 'Generate professional email addresses with high accuracy',
    gradient: 'from-sky-500 to-indigo-500',
    glow: 'rgba(14,165,233,0.4)',
  },
  {
    id: 'enrich-company',
    icon: Building,
    title: 'Enrich Company',
    subtitle: 'Info',
    description: 'Enhance company data with industry insights and details',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.4)',
  },
  {
    id: 'enrich-person',
    icon: UserCircle,
    title: 'Enrich Person',
    subtitle: 'Info',
    description: 'Get comprehensive professional profiles and backgrounds',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'rgba(236,72,153,0.4)',
  },
];

export function GetStartedModal({
  open,
  onOpenChange,
  onCreateBlank,
  onSelectOption,
  creating = false,
}: GetStartedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[900px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3.5 right-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex min-h-[560px]">

          {/* ── AI section (left, ~62%) ── */}
          <div
            className="relative flex flex-col overflow-hidden"
            style={{
              width: '62%',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1a0533 100%)',
            }}
          >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
            <div className="pointer-events-none absolute top-1/2 -right-10 h-40 w-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
            <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

            {/* Header */}
            <div className="relative z-10 px-7 pt-7 pb-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-violet-300" />
                AI-Powered Discovery
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
                Let AI build your<br />
                <span style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  perfect table
                </span>
              </h2>
              <p className="mt-1.5 text-sm text-white/50">Choose a discovery workflow and let AI do the heavy lifting</p>
            </div>

            {/* 2×3 grid of AI option cards */}
            <div className="relative z-10 flex-1 px-7 pb-7 grid grid-cols-2 gap-3 content-start">
              {AI_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={creating ? undefined : () => onSelectOption(opt.id)}
                    className="group relative flex flex-col gap-2.5 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 backdrop-blur-sm"
                    style={{ '--glow': opt.glow } as React.CSSProperties}
                    disabled={creating}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${opt.gradient} shadow-lg`}
                        style={{ boxShadow: `0 4px 14px ${opt.glow}` }}
                      >
                        <Icon className="h-4.5 w-4.5 text-white" strokeWidth={1.75} style={{ width: '18px', height: '18px' }} />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all mt-0.5" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white leading-tight">
                        {opt.title} <span className="text-white/50">{opt.subtitle}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/40 leading-relaxed line-clamp-2">{opt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Blank table section (right, ~38%) ── */}
          <div className="relative flex flex-col bg-background" style={{ width: '38%' }}>

            {/* Title for right panel */}
            <div className="px-7 pt-7 pb-4 border-b border-border/50">
              <h3 className="text-base font-semibold text-foreground">Start from scratch</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Build your own table with a blank canvas</p>
            </div>

            {/* Blank table card */}
            <div className="flex flex-1 flex-col items-center justify-center px-7 py-8">
              <button
                type="button"
                onClick={creating ? undefined : onCreateBlank}
                disabled={creating}
                aria-busy={creating}
                aria-disabled={creating}
                className="group flex w-full flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-8 text-center transition-all duration-200 hover:border-[#39A380]/60 hover:bg-[#f0fdf8] dark:hover:bg-[#39A380]/5 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A380]/40 disabled:opacity-60 disabled:cursor-default"
              >
                <div className="relative">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #e8f9f3 0%, #d1fae5 100%)' }}
                  >
                    <Table2 className="h-9 w-9 text-[#39A380]" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#39A380] shadow-sm">
                    <span className="text-[10px] font-bold text-white">+</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground">Create blank table</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Start with an empty table and<br />add your own fields
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-[#39A380] px-4 py-1.5 text-xs font-medium text-white shadow-sm group-hover:shadow-md transition-all">
                  <span>{creating ? 'Creating…' : 'Get started'}</span>
                  {!creating && <ArrowRight className="h-3 w-3" />}
                  {creating && (
                    <span className="inline-flex h-3 w-3 items-center justify-center">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                    </span>
                  )}
                </div>
              </button>

              {/* Tips */}
              <div className="mt-5 w-full rounded-xl border border-border/40 bg-muted/30 p-4">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick tips</div>
                <ul className="space-y-1.5">
                  {[
                    'Import from CSV or Excel',
                    'Drag & drop to reorder columns',
                    'Multiple view types available',
                  ].map((tip) => (
                    <li key={tip} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-[#39A380] shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {creating && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#39A380] border-t-transparent" />
                  <div className="text-sm font-semibold text-foreground">Creating table...</div>
                  <div className="text-xs text-muted-foreground">
                    Please wait while we create your table
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
