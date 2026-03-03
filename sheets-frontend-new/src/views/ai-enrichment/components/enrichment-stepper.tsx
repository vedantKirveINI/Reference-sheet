import { Check, Loader2, Filter, Table2, Sliders, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepAction {
  label: string;
  variant?: 'primary' | 'outline';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface Step {
  label: string;
  description: string;
}

interface EnrichmentStepperProps {
  activeStep: number;
  steps: Step[];
  stepContent: React.ReactNode[];
  stepActions: StepAction[][];
  loading?: boolean;
}

const STEP_PREVIEWS = [
  null,
  {
    headline: 'Review & refine your ICP',
    bullets: [
      { icon: Filter,  text: 'Filter by industry, size & geography' },
      { icon: Sliders, text: 'Fine-tune ICP attributes with AI chips' },
      { icon: Table2,  text: 'Create your enriched table in one click' },
    ],
  },
];

export function EnrichmentStepper({
  activeStep,
  steps,
  stepContent,
  stepActions,
}: EnrichmentStepperProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, idx) => {
        const isCompleted = idx < activeStep;
        const isActive   = idx === activeStep;
        const isFuture   = idx > activeStep;
        const preview    = STEP_PREVIEWS[idx];

        return (
          <div key={idx} className="flex gap-3">
            {/* Left column: circle + connector */}
            <div className="flex flex-col items-center">
              <div className="shrink-0">
                {isCompleted ? (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
                    style={{ backgroundColor: '#39A380' }}
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                ) : isActive ? (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background shadow-sm"
                    style={{ borderColor: '#39A380' }}
                  >
                    <span className="text-xs font-bold" style={{ color: '#39A380' }}>
                      {idx + 1}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background shadow-sm"
                    style={{ borderColor: '#39A38040' }}
                  >
                    <span className="text-xs font-semibold" style={{ color: '#39A38080' }}>
                      {idx + 1}
                    </span>
                  </div>
                )}
              </div>

              {idx < steps.length - 1 && (
                <div className="my-1.5 flex flex-col items-center gap-[3px] py-0.5">
                  {isCompleted ? (
                    <div className="w-0.5 min-h-[20px] rounded-full bg-[#39A380]/40" />
                  ) : (
                    Array.from({ length: 5 }).map((_, di) => (
                      <div
                        key={di}
                        className="h-1 w-0.5 rounded-full"
                        style={{ backgroundColor: '#39A38030' }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Right column: card */}
            <div className={cn('flex-1 pb-4', idx < steps.length - 1 && 'mb-0.5')}>
              {isFuture && preview ? (
                /* ── FUTURE STEP: rich teaser card ── */
                <div
                  className="relative overflow-hidden rounded-2xl border"
                  style={{
                    borderColor: '#39A38025',
                    background: 'linear-gradient(135deg, #39A38008 0%, #ffffff 60%)',
                  }}
                >
                  {/* Corner accent */}
                  <div
                    className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20"
                    style={{ backgroundColor: '#39A380' }}
                  />
                  <div
                    className="absolute -right-2 -top-2 h-8 w-8 rounded-full opacity-10"
                    style={{ backgroundColor: '#39A380' }}
                  />

                  <div className="relative px-4 py-3.5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground/80 leading-tight">
                          {step.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight" style={{ color: '#39A38090' }}>
                          {preview.headline}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          borderColor: '#39A38030',
                          color: '#39A38099',
                          backgroundColor: '#39A38010',
                        }}
                      >
                        Up next
                      </span>
                    </div>

                    {/* Bullet previews */}
                    <div className="mt-3 flex flex-col gap-1.5">
                      {preview.bullets.map(({ icon: Icon, text }, bi) => (
                        <div key={bi} className="flex items-center gap-2">
                          <div
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                            style={{ backgroundColor: '#39A38012' }}
                          >
                            <Icon className="h-3 w-3" style={{ color: '#39A38099' }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground/70">{text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA hint */}
                    <div className="mt-3.5 flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground/50">
                        Complete Step 1 to unlock
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                  </div>
                </div>
              ) : (
                /* ── ACTIVE / COMPLETED STEP: normal card ── */
                <div
                  className={cn(
                    'rounded-2xl border transition-all duration-200',
                    isActive    && 'flex flex-col bg-background border-border shadow-sm ring-1 ring-[#39A380]/20',
                    isCompleted && 'bg-muted/20 border-border/40',
                  )}
                  style={isActive ? { maxHeight: 'calc(100vh - 220px)' } : undefined}
                >
                  <div
                    className={cn(
                      'flex shrink-0 items-center gap-2.5 px-4 py-3',
                      isActive && stepContent[idx] && 'border-b border-border/30'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-xs leading-tight',
                          isActive
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-foreground/70'
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/60 leading-tight">
                        {isCompleted ? 'Completed' : step.description}
                      </p>
                    </div>

                    {isCompleted && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: '#39A38015',
                          color: '#39A380',
                          border: '1px solid #39A38030',
                        }}
                      >
                        Done
                      </span>
                    )}
                  </div>

                  {isActive && stepContent[idx] && (
                    <div className="flex-1 overflow-y-auto px-4 pt-3 pb-1 min-h-0">
                      {stepContent[idx]}
                    </div>
                  )}

                  {isActive && stepActions[idx] && (
                    <div
                      className={cn(
                        'shrink-0 border-t border-border/20 px-4 pb-4',
                        idx === 0 ? 'pt-4' : 'pt-3',
                        stepActions[idx].length > 1
                          ? 'flex items-center gap-2 flex-wrap'
                          : 'flex flex-col'
                      )}
                    >
                      {stepActions[idx].map((action, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={action.onClick}
                          disabled={action.disabled || action.loading}
                          className={cn(
                            'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                            action.variant === 'outline'
                              ? 'border border-border bg-background text-foreground hover:bg-muted/60'
                              : 'bg-foreground text-background hover:bg-foreground/90 w-full'
                          )}
                        >
                          {action.loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
