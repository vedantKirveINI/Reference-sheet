import { CellType, ICell } from '@/types';
import { IRenderRect } from './types';
import { GridTheme } from './theme';

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTruncatedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, align: 'left' | 'right' | 'center' = 'left'): void {
  if (!text) return;
  let displayText = text;
  let measured = ctx.measureText(displayText);

  if (measured.width > maxWidth) {
    const ellipsis = '…';
    const ellipsisWidth = ctx.measureText(ellipsis).width;
    let lo = 0;
    let hi = displayText.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const sub = displayText.substring(0, mid);
      if (ctx.measureText(sub).width + ellipsisWidth <= maxWidth) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    displayText = displayText.substring(0, lo) + ellipsis;
    measured = ctx.measureText(displayText);
  }

  let drawX = x;
  if (align === 'right') {
    drawX = x + maxWidth - measured.width;
  } else if (align === 'center') {
    drawX = x + (maxWidth - measured.width) / 2;
  }
  ctx.fillText(displayText, drawX, y);
}

function drawCheckmark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.5);
  ctx.lineTo(x + size * 0.4, y + size * 0.75);
  ctx.lineTo(x + size * 0.8, y + size * 0.25);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number): void {
  const spikes = 5;
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rot + i * step;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function getChipColor(value: string, options: string[], theme: GridTheme): { bg: string; text: string } {
  const idx = options.indexOf(value);
  return theme.chipColors[idx >= 0 ? idx % theme.chipColors.length : 0];
}

function paintString(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const text = cell.displayData || '';
  if (!text) return;
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textBaseline = 'middle';
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;
  drawTruncatedText(ctx, text, rect.x + px, rect.y + rect.height / 2, maxW, 'left');
}

function paintNumber(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const text = cell.displayData || '';
  if (!text) return;
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textBaseline = 'middle';
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;
  drawTruncatedText(ctx, text, rect.x + px, rect.y + rect.height / 2, maxW, 'right');
}

function paintChip(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, chipH: number, color: { bg: string; text: string }, theme: GridTheme): number {
  ctx.font = `${theme.fontSize - 1}px ${theme.fontFamily}`;
  const textW = ctx.measureText(text).width;
  const chipW = textW + 12;
  const chipR = chipH / 2;

  drawRoundedRect(ctx, x, y, chipW, chipH, chipR);
  ctx.fillStyle = color.bg;
  ctx.fill();

  ctx.fillStyle = color.text;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 6, y + chipH / 2);

  return chipW;
}

function paintSCQ(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const data = (cell as any).data as string | null;
  if (!data) return;
  const options = ((cell as any).options?.options as string[]) || [];
  const color = getChipColor(data, options, theme);
  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  paintChip(ctx, data, rect.x + theme.cellPaddingX, chipY, chipH, color, theme);
}

function paintMCQ(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const data = (cell as any).data as string[];
  if (!Array.isArray(data) || data.length === 0) return;
  const options = ((cell as any).options?.options as string[]) || [];
  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;
  const gap = 4;
  let currentX = rect.x + px;
  const maxX = rect.x + rect.width - px;
  let remaining = 0;

  for (let i = 0; i < data.length; i++) {
    const color = getChipColor(data[i], options, theme);
    ctx.font = `${theme.fontSize - 1}px ${theme.fontFamily}`;
    const textW = ctx.measureText(data[i]).width;
    const chipW = textW + 12;

    if (currentX + chipW > maxX) {
      remaining = data.length - i;
      break;
    }

    paintChip(ctx, data[i], currentX, chipY, chipH, color, theme);
    currentX += chipW + gap;
  }

  if (remaining > 0) {
    const indicator = `+${remaining}`;
    ctx.font = `${theme.fontSize - 2}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.cellTextSecondary;
    ctx.textBaseline = 'middle';
    ctx.fillText(indicator, currentX, rect.y + rect.height / 2);
  }
}

function paintDropDown(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const display = cell.displayData;
  if (!display) return;
  const options = ((cell as any).options?.options as any[]) || [];
  const optLabels = options.map((o: any) => typeof o === 'string' ? o : o.label);
  const color = getChipColor(display, optLabels, theme);
  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  paintChip(ctx, display, rect.x + theme.cellPaddingX, chipY, chipH, color, theme);
}

function paintYesNo(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, _theme: GridTheme): void {
  const data = (cell as any).data as string | null;
  const size = 16;
  const cx = rect.x + rect.width / 2 - size / 2;
  const cy = rect.y + (rect.height - size) / 2;
  const r = 3;

  if (data === 'Yes') {
    drawRoundedRect(ctx, cx, cy, size, size, r);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    drawCheckmark(ctx, cx, cy, size);
  } else {
    drawRoundedRect(ctx, cx, cy, size, size, r);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function paintDateTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  paintString(ctx, cell, rect, theme);
}

function paintCreatedTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const text = cell.displayData || '';
  if (!text) return;
  const px = theme.cellPaddingX;
  const iconText = '🔒';

  ctx.font = `${theme.fontSize - 2}px ${theme.fontFamily}`;
  const iconW = ctx.measureText(iconText).width;
  ctx.textBaseline = 'middle';
  ctx.fillText(iconText, rect.x + px, rect.y + rect.height / 2);

  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextSecondary;
  const maxW = rect.width - px * 2 - iconW - 4;
  if (maxW <= 0) return;
  drawTruncatedText(ctx, text, rect.x + px + iconW + 4, rect.y + rect.height / 2, maxW, 'left');
}

function paintCurrency(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  paintNumber(ctx, cell, rect, theme);
}

function paintPhoneNumber(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  paintString(ctx, cell, rect, theme);
}

function paintAddress(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  paintString(ctx, cell, rect, theme);
}

function paintSignature(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const data = (cell as any).data;
  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;

  if (data) {
    const color = { bg: '#dcfce7', text: '#15803d' };
    paintChip(ctx, 'Signed', rect.x + px, chipY, chipH, color, theme);
  } else {
    ctx.font = `italic ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.rowNumberColor;
    ctx.textBaseline = 'middle';
    ctx.fillText('Not signed', rect.x + px, rect.y + rect.height / 2);
  }
}

function paintSlider(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const val = ((cell as any).data as number) ?? 0;
  const max = (cell as any).options?.maxValue ?? 100;
  const pct = Math.min(100, Math.max(0, (val / max) * 100));
  const px = theme.cellPaddingX;
  const barH = 6;
  const barY = rect.y + (rect.height - barH) / 2;

  const displayText = cell.displayData || `${Math.round(pct)}%`;
  ctx.font = `${theme.fontSize - 2}px ${theme.fontFamily}`;
  const textW = ctx.measureText(displayText).width;
  const barW = rect.width - px * 2 - textW - 8;

  if (barW > 10) {
    drawRoundedRect(ctx, rect.x + px, barY, barW, barH, 3);
    ctx.fillStyle = '#e5e7eb';
    ctx.fill();

    if (pct > 0) {
      const fillW = Math.max(3, (barW * pct) / 100);
      drawRoundedRect(ctx, rect.x + px, barY, fillW, barH, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
    }

    ctx.fillStyle = theme.cellTextSecondary;
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, rect.x + px + barW + 8, rect.y + rect.height / 2);
  }
}

function paintFileUpload(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const files = Array.isArray((cell as any).data) ? (cell as any).data : [];
  const count = files.length;
  const px = theme.cellPaddingX;
  ctx.textBaseline = 'middle';
  const cy = rect.y + rect.height / 2;

  if (count > 0) {
    ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
    const text = `📎 ${count} ${count === 1 ? 'file' : 'files'}`;
    ctx.fillStyle = theme.cellTextColor;
    drawTruncatedText(ctx, text, rect.x + px, cy, rect.width - px * 2, 'left');
  } else {
    ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.rowNumberColor;
    ctx.fillText('No files', rect.x + px, cy);
  }
}

function paintTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  paintString(ctx, cell, rect, theme);
}

function paintRanking(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const items = Array.isArray((cell as any).data) ? (cell as any).data as any[] : [];
  if (items.length === 0) return;

  const chipH = 18;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;
  const gap = 3;
  let currentX = rect.x + px;
  const maxX = rect.x + rect.width - px;
  const color = { bg: '#e0e7ff', text: '#4338ca' };

  for (let i = 0; i < items.length; i++) {
    const label = `${i + 1}. ${items[i].label || ''}`;
    ctx.font = `${theme.fontSize - 2}px ${theme.fontFamily}`;
    const textW = ctx.measureText(label).width;
    const chipW = textW + 10;

    if (currentX + chipW > maxX) break;
    paintChip(ctx, label, currentX, chipY, chipH, color, theme);
    currentX += chipW + gap;
  }
}

function paintRating(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, _theme: GridTheme): void {
  const rating = ((cell as any).data as number) ?? 0;
  const maxRating = (cell as any).options?.maxRating ?? 5;
  const px = 12;
  const starSize = 7;
  const innerSize = 3;
  const gap = 2;
  const startX = rect.x + px;
  const cy = rect.y + rect.height / 2;

  for (let i = 0; i < maxRating; i++) {
    const cx = startX + i * (starSize * 2 + gap) + starSize;
    drawStar(ctx, cx, cy, starSize, innerSize);
    if (i < rating) {
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    } else {
      ctx.fillStyle = '#d1d5db';
      ctx.fill();
    }
  }
}

function paintOpinionScale(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const val = ((cell as any).data as number) ?? 0;
  const max = (cell as any).options?.maxValue ?? 10;
  const text = `${val}/${max}`;
  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;
  const color = { bg: '#f3e8ff', text: '#7e22ce' };

  ctx.font = `bold ${theme.fontSize - 1}px ${theme.fontFamily}`;
  paintChip(ctx, text, rect.x + px, chipY, chipH, color, theme);
}

function paintFormula(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const text = cell.displayData || '';
  if (!text) return;
  ctx.font = `italic ${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textBaseline = 'middle';
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;
  drawTruncatedText(ctx, text, rect.x + px, rect.y + rect.height / 2, maxW, 'left');
}

function paintList(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const items = Array.isArray((cell as any).data) ? (cell as any).data : [];
  if (items.length === 0) return;

  const chipH = 18;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;
  const gap = 3;
  let currentX = rect.x + px;
  const maxX = rect.x + rect.width - px;
  const color = { bg: '#f3f4f6', text: '#374151' };

  for (let i = 0; i < items.length; i++) {
    const label = String(items[i]);
    ctx.font = `${theme.fontSize - 2}px ${theme.fontFamily}`;
    const textW = ctx.measureText(label).width;
    const chipW = textW + 10;

    if (currentX + chipW > maxX) break;
    paintChip(ctx, label, currentX, chipY, chipH, color, theme);
    currentX += chipW + gap;
  }
}

function paintEnrichment(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const text = cell.displayData || '';
  if (!text) return;
  const px = theme.cellPaddingX;

  ctx.font = `${theme.fontSize - 2}px ${theme.fontFamily}`;
  const sparkle = '✨';
  const sparkleW = ctx.measureText(sparkle).width;
  ctx.textBaseline = 'middle';
  ctx.fillText(sparkle, rect.x + px, rect.y + rect.height / 2);

  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  const maxW = rect.width - px * 2 - sparkleW - 4;
  if (maxW <= 0) return;
  drawTruncatedText(ctx, text, rect.x + px + sparkleW + 4, rect.y + rect.height / 2, maxW, 'left');
}

export function paintCell(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  switch (cell.type) {
    case CellType.String:
      paintString(ctx, cell, rect, theme);
      break;
    case CellType.Number:
      paintNumber(ctx, cell, rect, theme);
      break;
    case CellType.SCQ:
      paintSCQ(ctx, cell, rect, theme);
      break;
    case CellType.MCQ:
      paintMCQ(ctx, cell, rect, theme);
      break;
    case CellType.DropDown:
      paintDropDown(ctx, cell, rect, theme);
      break;
    case CellType.YesNo:
      paintYesNo(ctx, cell, rect, theme);
      break;
    case CellType.DateTime:
      paintDateTime(ctx, cell, rect, theme);
      break;
    case CellType.CreatedTime:
      paintCreatedTime(ctx, cell, rect, theme);
      break;
    case CellType.Currency:
      paintCurrency(ctx, cell, rect, theme);
      break;
    case CellType.PhoneNumber:
      paintPhoneNumber(ctx, cell, rect, theme);
      break;
    case CellType.Address:
      paintAddress(ctx, cell, rect, theme);
      break;
    case CellType.Signature:
      paintSignature(ctx, cell, rect, theme);
      break;
    case CellType.Slider:
      paintSlider(ctx, cell, rect, theme);
      break;
    case CellType.FileUpload:
      paintFileUpload(ctx, cell, rect, theme);
      break;
    case CellType.Time:
      paintTime(ctx, cell, rect, theme);
      break;
    case CellType.Ranking:
      paintRanking(ctx, cell, rect, theme);
      break;
    case CellType.Rating:
      paintRating(ctx, cell, rect, theme);
      break;
    case CellType.OpinionScale:
      paintOpinionScale(ctx, cell, rect, theme);
      break;
    case CellType.Formula:
      paintFormula(ctx, cell, rect, theme);
      break;
    case CellType.List:
      paintList(ctx, cell, rect, theme);
      break;
    case CellType.Enrichment:
      paintEnrichment(ctx, cell, rect, theme);
      break;
    default:
      paintString(ctx, cell, rect, theme);
      break;
  }
}
