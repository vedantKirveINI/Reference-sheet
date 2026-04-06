import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  TrendingUp,
  Mail,
  Building,
  UserCircle,
  Sparkles,
  Table2,
  ChevronRight,
  Play,
  AlertTriangle,
  Zap,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface GetStartedContentProps {
  onCreateBlank: (name: string) => void;
  onSelectOption: (optionId: string) => void;
  creating?: boolean;
}

const GET_STARTED_VIDEO_ID = 'NdGY9Ei6gMI';
const NAME_MAX_LENGTH = 75;
const DESCRIPTION_MAX_LENGTH = 120;

const AI_OPTIONS = [
  // Discovery options first — high-excitement, top of the list
  {
    id: 'discover-influencers',
    icon: Users,
    title: 'Discover',
    subtitle: 'Influencers',
    description: 'Find creators and influencers on Instagram, YouTube, TikTok — build your outreach list in seconds',
    gradient: 'from-fuchsia-500 to-pink-500',
    glow: 'rgba(217,70,239,0.4)',
    creditCost: '20 credits / search',
  },
  {
    id: 'discover-businesses',
    icon: Search,
    title: 'Discover',
    subtitle: 'Businesses',
    description: 'Search millions of businesses by industry, location, and category — instant lead generation',
    gradient: 'from-teal-500 to-green-500',
    glow: 'rgba(20,184,166,0.4)',
    creditCost: '20 credits / search',
  },
  {
    id: 'discover-people',
    icon: UserCircle,
    title: 'Discover',
    subtitle: 'People',
    description: 'Find professionals by title, company, skills, and seniority — build targeted prospect lists',
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'rgba(99,102,241,0.4)',
    creditCost: '20 credits / search',
  },
  {
    id: 'discover-funding',
    icon: TrendingUp,
    title: 'Discover',
    subtitle: 'Funded Startups',
    description: 'Find recently funded companies by industry, round, and geography — target companies with budget',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.4)',
    creditCost: '20 credits / search',
  },
  {
    id: 'discover-agencies',
    icon: Building,
    title: 'Discover',
    subtitle: 'Agencies',
    description: 'Find top-rated agencies by service type and location — from Clutch, G2, and Google Maps',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.4)',
    creditCost: '20 credits / search',
  },
  {
    id: 'discover-hiring',
    icon: Zap,
    title: 'Discover',
    subtitle: 'Hiring Signals',
    description: 'Find companies actively hiring for specific tools or roles — the strongest buying signal',
    gradient: 'from-red-500 to-pink-500',
    glow: 'rgba(239,68,68,0.4)',
    creditCost: '20 credits / search',
  },
  // ICP & Customer discovery
  {
    id: 'find-customer-company',
    icon: Building2,
    title: 'Find Customer',
    subtitle: 'Company',
    description: 'AI builds your ideal customer profile and finds companies that match — powered by ICP analysis',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.4)',
    creditCost: '10 credits / record',
  },
  {
    id: 'find-customer-people',
    icon: Users,
    title: 'Find Customer',
    subtitle: 'People',
    description: 'Identify decision makers at your target accounts — names, titles, and contact paths',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.4)',
    creditCost: '20 credits / record',
  },
  {
    id: 'find-competitors-company',
    icon: TrendingUp,
    title: 'Find Competitors',
    subtitle: 'Company',
    description: 'Map your competitive landscape — discover who you\'re up against and where you stand',
    gradient: 'from-orange-500 to-amber-500',
    glow: 'rgba(249,115,22,0.4)',
    creditCost: '10 credits / record',
  },
  // Enrichment options
  {
    id: 'enrich-email',
    icon: Mail,
    title: 'Find Emails',
    subtitle: '',
    description: 'Generate verified work email addresses — ready for outreach in one click',
    gradient: 'from-sky-500 to-indigo-500',
    glow: 'rgba(14,165,233,0.4)',
    creditCost: '20 credits / record',
  },
  {
    id: 'enrich-company',
    icon: Building,
    title: 'Enrich',
    subtitle: 'Company Data',
    description: 'Auto-fill industry, funding, size, tech stack, and more from just a domain name',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.4)',
    creditCost: '10 credits / record',
  },
  {
    id: 'enrich-person',
    icon: UserCircle,
    title: 'Enrich',
    subtitle: 'Person Data',
    description: 'Get full professional profiles — title, company, LinkedIn, location — from a name or email',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'rgba(236,72,153,0.4)',
    creditCost: '20 credits / record',
  },
];

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 8, filter: 'blur(2px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const ACCENT = '#39A380';
const ACCENT_FOREGROUND = '#fff';

export function GetStartedContent({
  onCreateBlank,
  onSelectOption,
  creating = false,
}: GetStartedContentProps) {
  const [sheetName, setSheetName] = useState('');
  const [description, setDescription] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  console.log('[GetStartedContent] LATEST CODE LOADED');

  const trimmedName = sheetName.trim();
  const hasError = hasAttemptedSubmit && trimmedName.length === 0;

  const handleSubmit = () => {
    if (creating) return;
    setHasAttemptedSubmit(true);
    if (!trimmedName) {
      inputRef.current?.focus();
      return;
    }
    onCreateBlank(trimmedName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetName(e.target.value.slice(0, NAME_MAX_LENGTH));
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH));
  };

  const inputBaseClasses = cn(
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
    'transition-colors duration-150 border border-input',
  );

  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={
        {
          '--create-dialog-accent': ACCENT,
          '--create-dialog-accent-foreground': ACCENT_FOREGROUND,
        } as React.CSSProperties
      }
    >
      {/* Left panel — AI options, soft gradient + subtle animated orbs */}
      <aside
        className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden lg:w-[60%] lg:min-w-[360px]"
        style={{
          background:
            'linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 40%, #f0fdf4 100%)',
        }}
      >
        {/* Animated background orbs — multiple orbs, continuously moving */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          {[
            { left: '0%', top: '10%', size: 200, path: [0, 35, 28, -30, -20, 0], pathY: [0, -25, -40, -15, 20, 0], dur: 22 },
            { left: '25%', top: '5%', size: 160, path: [0, -28, -40, -15, 25, 0], pathY: [0, 30, 15, -35, -25, 0], dur: 26 },
            { left: '50%', top: '20%', size: 220, path: [0, 40, 20, -35, -25, 0], pathY: [0, -30, 35, 20, -20, 0], dur: 24 },
            { left: '70%', top: '45%', size: 180, path: [0, -20, 35, 25, -30, 0], pathY: [0, 25, -20, -35, 15, 0], dur: 28 },
            { left: '15%', top: '55%', size: 170, path: [0, 25, -35, -18, 30, 0], pathY: [0, -22, 28, 35, -25, 0], dur: 25 },
            { left: '80%', top: '15%', size: 140, path: [0, -30, 20, 35, -25, 0], pathY: [0, 20, -35, -15, 28, 0], dur: 20 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-2xl"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.left,
                top: orb.top,
                background: `radial-gradient(circle at 50% 50%, ${ACCENT}40 0%, ${ACCENT}20 40%, transparent 70%)`,
              }}
              animate={{
                x: orb.path,
                y: orb.pathY,
                scale: [1, 1.06, 0.97, 1.08, 0.95, 1],
              }}
              transition={{
                x: { duration: orb.dur, repeat: Infinity, ease: 'linear' },
                y: { duration: orb.dur, repeat: Infinity, ease: 'linear' },
                scale: {
                  duration: orb.dur + 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            />
          ))}
        </div>

        {/* Left panel — single scrollable area (video + AI options) */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium text-gray-900">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered
          </span>

          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            What kind of table do you need?
          </h2>
          <p className="mt-1.5 text-sm text-gray-700">
            Choose a starting point and let AI configure the details for you.
          </p>

          {/* AI option cards */}
          <motion.div
            className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2"
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            {AI_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  onClick={creating ? undefined : () => onSelectOption(opt.id)}
                  disabled={creating}
                  className={cn(
                    'group relative flex min-h-[65px] items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400/40',
                    'border-gray-200/80 bg-white/50 hover:border-gray-300 hover:bg-white/70',
                    creating && 'cursor-not-allowed opacity-60',
                  )}
                  variants={listItem}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${opt.gradient}`}
                  >
                    <Icon
                      className="h-[1.125rem] w-[1.125rem] text-white"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden pr-6">
                    <span className="block truncate text-[13px] font-semibold text-gray-900">
                      {opt.title}{' '}
                      <span className="text-gray-500">{opt.subtitle}</span>
                    </span>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-gray-700">
                      {opt.description}
                    </p>
                    {opt.creditCost && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-amber-600">
                        <Zap className="h-2.5 w-2.5" />
                        {opt.creditCost}
                      </span>
                    )}
                  </div>
                  <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-gray-600">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          <p className="mt-6 text-xs text-gray-700">
            AI options pre-configure your table. You can fully customize after
            creation.
          </p>
        </div>
      </aside>

      {/* Right panel — Start from scratch form */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background lg:w-[40%]">
        <div className="flex-1 overflow-y-auto p-6 lg:p-7">
          {/* Header icon + title */}
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}
            >
              <Table2 className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide">
                Start from scratch
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Build a custom table with your own columns and data.
              </p>
            </div>
          </div>

          {/* Form */}
          <section className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="get-started-sheet-name"
                className="text-sm font-medium text-foreground"
              >
                Sheet name *
              </label>
              <div className="relative">
                <Input
                  id="get-started-sheet-name"
                  ref={inputRef}
                  autoFocus
                  value={sheetName}
                  onChange={handleNameChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="e.g. My Sheet"
                  disabled={creating}
                  aria-required="true"
                  aria-invalid={hasError}
                  aria-describedby={hasError ? 'sheet-name-error' : undefined}
                  className={cn(
                    'h-11 rounded-lg bg-background pr-14 pl-3 text-sm shadow-sm',
                    inputBaseClasses,
                    hasError
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'focus-visible:ring-[var(--create-dialog-accent)] focus-visible:ring-offset-0',
                  )}
                  style={
                    !hasError
                      ? ({
                          '--tw-ring-color': ACCENT,
                        } as React.CSSProperties)
                      : undefined
                  }
                />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                  aria-hidden
                >
                  {sheetName.length}/{NAME_MAX_LENGTH}
                </span>
              </div>
              <AnimatePresence mode="wait">
                {hasError && (
                  <motion.p
                    id="sheet-name-error"
                    className="flex items-center gap-1.5 text-xs text-destructive"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Name is required to create a sheet.
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs text-muted-foreground">
                Give your table a clear, descriptive name.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="get-started-sheet-desc"
                className="text-sm font-medium text-foreground"
              >
                Description{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <textarea
                  id="get-started-sheet-desc"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="What is this table for?"
                  rows={3}
                  disabled={creating}
                  className={cn(
                    'min-h-[72px] w-full resize-none rounded-lg border border-input bg-background pb-8 pr-12 pl-3 py-2 text-sm shadow-sm',
                    inputBaseClasses,
                    'focus-visible:ring-[var(--create-dialog-accent)] focus-visible:ring-offset-0',
                  )}
                  style={
                    {
                      '--tw-ring-color': ACCENT,
                    } as React.CSSProperties
                  }
                />
                <span
                  className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground"
                  aria-hidden
                >
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>
          </section>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={creating}
            className="mt-6 w-full rounded-lg px-5 tracking-wide shadow-md transition-all hover:shadow-lg uppercase"
            style={{ backgroundColor: ACCENT, color: ACCENT_FOREGROUND }}
          >
            Get started
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Creating overlay */}
        {creating && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#39A380] border-t-transparent" />
              <div className="text-sm font-semibold text-foreground">
                Creating table...
              </div>
              <div className="text-xs text-muted-foreground">
                Please wait while we create your table
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
