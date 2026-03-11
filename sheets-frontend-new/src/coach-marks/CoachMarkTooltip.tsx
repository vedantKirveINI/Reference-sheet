import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoachMarkStore } from './coach-marks-store';
import { COACH_MARKS, JOURNEYS } from './coach-marks-config';
import type { PopoverPlacement } from './types';

interface TooltipPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  transform?: string;
}

function computePosition(
  target: DOMRect,
  tooltip: { width: number; height: number },
  placement: PopoverPlacement,
  margin = 12
): TooltipPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (placement === 'center') {
    return {
      top: vh / 2 - tooltip.height / 2,
      left: vw / 2 - tooltip.width / 2,
    };
  }

  let top = 0;
  let left = 0;

  const targetCenterX = target.left + target.width / 2;
  const targetCenterY = target.top + target.height / 2;

  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      top = target.top - tooltip.height - margin;
      left = placement === 'top-start'
        ? target.left
        : placement === 'top-end'
        ? target.right - tooltip.width
        : targetCenterX - tooltip.width / 2;
      break;
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      top = target.bottom + margin;
      left = placement === 'bottom-start'
        ? target.left
        : placement === 'bottom-end'
        ? target.right - tooltip.width
        : targetCenterX - tooltip.width / 2;
      break;
    case 'left':
    case 'left-start':
    case 'left-end':
      left = target.left - tooltip.width - margin;
      top = placement === 'left-start'
        ? target.top
        : placement === 'left-end'
        ? target.bottom - tooltip.height
        : targetCenterY - tooltip.height / 2;
      break;
    case 'right':
    case 'right-start':
    case 'right-end':
      left = target.right + margin;
      top = placement === 'right-start'
        ? target.top
        : placement === 'right-end'
        ? target.bottom - tooltip.height
        : targetCenterY - tooltip.height / 2;
      break;
  }

  left = Math.max(8, Math.min(left, vw - tooltip.width - 8));
  top = Math.max(8, Math.min(top, vh - tooltip.height - 8));

  return { top, left };
}

function ArrowIndicator({ placement }: { placement: PopoverPlacement }) {
  if (placement === 'center') return null;

  const base = 'absolute w-0 h-0 border-[7px] border-transparent';
  const arrowStyles: Partial<Record<PopoverPlacement, string>> = {
    top: `${base} border-t-popover bottom-[-14px] left-1/2 -translate-x-1/2`,
    'top-start': `${base} border-t-popover bottom-[-14px] left-4`,
    'top-end': `${base} border-t-popover bottom-[-14px] right-4`,
    bottom: `${base} border-b-popover top-[-14px] left-1/2 -translate-x-1/2`,
    'bottom-start': `${base} border-b-popover top-[-14px] left-4`,
    'bottom-end': `${base} border-b-popover top-[-14px] right-4`,
    left: `${base} border-l-popover right-[-14px] top-1/2 -translate-y-1/2`,
    'left-start': `${base} border-l-popover right-[-14px] top-4`,
    'left-end': `${base} border-l-popover right-[-14px] bottom-4`,
    right: `${base} border-r-popover left-[-14px] top-1/2 -translate-y-1/2`,
    'right-start': `${base} border-r-popover left-[-14px] top-4`,
    'right-end': `${base} border-r-popover left-[-14px] bottom-4`,
  };

  const cls = arrowStyles[placement];
  if (!cls) return null;
  return <div className={cls} />;
}

interface CoachMarkTooltipProps {
  markId: string;
  targetEl: HTMLElement;
}

export function CoachMarkTooltip({ markId, targetEl }: CoachMarkTooltipProps) {
  const mark = COACH_MARKS[markId];
  const store = useCoachMarkStore();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<TooltipPosition>({ top: -9999, left: -9999 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const isJourney = !!mark?.journeyId;
  const journeySteps = mark?.journeyId ? JOURNEYS[mark.journeyId] ?? [] : [];
  const totalSteps = journeySteps.length;
  const currentStep = store.currentStepIndex + 1;
  const isFirst = store.currentStepIndex === 0;
  const isLast = store.currentStepIndex === totalSteps - 1;

  const reposition = useCallback(() => {
    if (!mark || !tooltipRef.current) return;
    let rect = targetEl.getBoundingClientRect();
    if (
      targetEl.getAttribute('data-coach-target') ||
      (rect.width === 0 && rect.height === 0)
    ) {
      const firstChild = targetEl.firstElementChild as HTMLElement | null;
      if (firstChild) rect = firstChild.getBoundingClientRect();
    }
    setTargetRect(rect);
    const tw = tooltipRef.current.offsetWidth || 320;
    const th = tooltipRef.current.offsetHeight || 140;
    setPos(computePosition(rect, { width: tw, height: th }, mark.placement));
  }, [mark, targetEl]);

  useEffect(() => {
    reposition();
    const ro = new ResizeObserver(reposition);
    ro.observe(document.documentElement);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [reposition]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isJourney && mark?.journeyId) {
          store.dismissJourney(mark.journeyId);
        } else {
          store.dismissMark(markId);
        }
      }
      if (e.key === 'ArrowRight' && isJourney) store.nextStep();
      if (e.key === 'ArrowLeft' && isJourney && !isFirst) store.prevStep();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isJourney, isFirst, mark, markId, store]);

  if (!mark) return null;

  const journeyLabel = mark.journeyId
    ? mark.journeyId
        .replace('journey-', '')
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '';

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background:
            mark.placement === 'center'
              ? 'rgba(0,0,0,0.55)'
              : 'transparent',
        }}
      />

      {mark.placement !== 'center' && targetRect && (
        <div
          className="fixed z-[9998] pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            borderRadius: 6,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            outline: '2px solid var(--color-theme-accent, #39A380)',
            outlineOffset: 2,
            animation: 'coach-mark-pulse 2s ease-in-out infinite',
          }}
        />
      )}

      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="false"
        aria-label={mark.title}
        className={cn(
          'fixed z-[9999] w-[20rem] rounded-xl border border-border bg-popover text-popover-foreground shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
        style={{ top: pos.top, left: pos.left }}
      >
        <ArrowIndicator placement={mark.placement} />

        <div className="p-4">
          {isJourney && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[length:var(--app-font-2xs)] font-medium uppercase tracking-wider text-muted-foreground">
                {journeyLabel} &middot; Step {currentStep} of {totalSteps}
              </span>
              <button
                onClick={() => mark.journeyId && store.dismissJourney(mark.journeyId)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-start gap-2">
            <div
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: 'var(--color-theme-accent, #39A380)' }}
            />
            <div>
              <p className="text-sm font-semibold leading-snug text-foreground">
                {mark.title}
              </p>
              <p className="mt-1 text-[length:var(--app-font-sm)] leading-relaxed text-muted-foreground">
                {mark.description}
              </p>
            </div>
          </div>

          {isJourney ? (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => mark.journeyId && store.dismissJourney(mark.journeyId)}
                className="text-[length:var(--app-font-xs)] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-1.5">
                {!isFirst && (
                  <button
                    onClick={() => store.prevStep()}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium border border-border hover:bg-accent transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={() => store.nextStep()}
                  className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-theme-accent, #39A380)' }}
                >
                  {isLast ? 'Done' : 'Next'}
                  {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => store.setGloballyDisabled(true)}
                className="text-[length:var(--app-font-xs)] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              >
                Never show again
              </button>
              <button
                onClick={() => store.dismissMark(markId)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: 'var(--color-theme-accent, #39A380)' }}
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes coach-mark-pulse {
          0%, 100% { outline-color: var(--color-theme-accent, #39A380); }
          50% { outline-color: transparent; }
        }
      `}</style>
    </>
  );
}
