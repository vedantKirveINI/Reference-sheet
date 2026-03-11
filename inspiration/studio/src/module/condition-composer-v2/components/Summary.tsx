import React from 'react';
import { FileText } from 'lucide-react';
import type { SummarySegment } from '../types';

interface SummaryProps {
  summary: SummarySegment[];
}

function renderSegment(segment: SummarySegment, index: number) {
  if (segment.type === 'variable') {
    return (
      <span
        key={index}
        className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium mx-0.5"
      >
        {segment.value}
      </span>
    );
  }

  if (segment.type === 'field') {
    return (
      <span key={index} className="text-foreground font-medium">
        {segment.value}
      </span>
    );
  }

  if (segment.type === 'operator') {
    return (
      <span key={index} className="text-muted-foreground mx-1">
        {segment.value}
      </span>
    );
  }

  return (
    <span key={index} className="text-muted-foreground">
      {segment.value}
    </span>
  );
}

export function Summary({ summary }: SummaryProps) {
  if (!summary || summary.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      <div className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>Condition Summary</span>
        </div>
      </div>

      <div className="px-4 py-3 bg-muted/30 border-t border-border">
        <p className="text-sm font-mono break-words leading-relaxed flex flex-wrap items-center gap-0.5">
          {summary.map((segment, index) => renderSegment(segment, index))}
        </p>
      </div>
    </div>
  );
}

export default Summary;
