import { CellType, ICell, ICurrencyData, IPhoneNumberData, IAddressData } from '@/types';
import { IRenderRect } from './types';
import { GridTheme } from './theme';
import { validateAndParseCurrency } from '@/lib/validators/currency';
import { validateAndParsePhoneNumber } from '@/lib/validators/phone';
import { validateAndParseAddress, getAddress } from '@/lib/validators/address';
import { getCountry, drawFlagSync } from '@/lib/countries';

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
    ctx.fillStyle = '#39A380';
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

function paintError(ctx: CanvasRenderingContext2D, value: string, rect: IRenderRect, theme: GridTheme): void {
  ctx.fillStyle = '#FFEBEE';
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textBaseline = 'middle';
  const px = theme.cellPaddingX;
  const iconSize = 16;
  const iconGap = 4;
  const maxW = rect.width - px * 2 - iconSize - iconGap;
  if (maxW > 0) {
    drawTruncatedText(ctx, value, rect.x + px, rect.y + rect.height / 2, maxW, 'left');
  }

  const iconX = rect.x + rect.width - px - iconSize;
  const iconY = rect.y + (rect.height - iconSize) / 2;
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(iconX, iconY, iconSize, iconSize);
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = 1;
  ctx.strokeRect(iconX, iconY, iconSize, iconSize);
}

function paintLoading(ctx: CanvasRenderingContext2D, rect: IRenderRect, theme: GridTheme, text?: string): void {
  if (text) {
    ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
    ctx.fillStyle = '#607D8B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rect.x + rect.width / 2, rect.y + rect.height / 2);
    ctx.textAlign = 'left';
  } else {
    const px = theme.cellPaddingX;
    const skeletonW = rect.width - px * 2;
    const skeletonH = 20;
    const skeletonX = rect.x + px;
    const skeletonY = rect.y + (rect.height - skeletonH) / 2;
    const gradient = ctx.createLinearGradient(skeletonX, skeletonY, skeletonX + skeletonW, skeletonY);
    gradient.addColorStop(0, '#F7F8F9');
    gradient.addColorStop(0.5, '#DDE5EA');
    gradient.addColorStop(1, '#F7F8F9');
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, skeletonX, skeletonY, skeletonW, skeletonH, 4);
    ctx.fill();
  }
}

const FLAG_W = 20;
const FLAG_H = 15;
const FLAG_GAP = 6;
const TEXT_GAP = 6;
const CHEVRON_W = 15;
const CHEVRON_GAP = 6;
const VLINE_W = 1;
const VLINE_GAP = 8;

function paintCurrency(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const cellData = (cell as any).data;
  const displayData = cell.displayData;
  const cellValue = cellData || displayData;

  const { isValid, parsedValue } = validateAndParseCurrency(cellValue);

  if (!isValid && cellValue !== null && cellValue !== undefined && cellValue !== '') {
    paintError(ctx, typeof cellValue === 'string' ? cellValue : JSON.stringify(cellValue), rect, theme);
    return;
  }

  if (!parsedValue || (!parsedValue.currencyCode && !parsedValue.currencySymbol && !parsedValue.currencyValue)) {
    return;
  }

  const { x, y, height } = rect;
  const centerY = y + height / 2;
  let currentX = x + theme.cellPaddingX;

  ctx.save();
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (parsedValue.countryCode) {
    drawFlagSync(ctx, currentX, centerY - FLAG_H / 2, FLAG_W, FLAG_H, parsedValue.countryCode);
  }
  currentX += FLAG_W + FLAG_GAP;

  ctx.fillStyle = theme.cellTextColor;
  ctx.fillText(parsedValue.currencyCode || '', currentX, centerY);
  currentX += ctx.measureText(parsedValue.currencyCode || '').width + TEXT_GAP;

  ctx.fillText(parsedValue.currencySymbol || '', currentX, centerY);
  currentX += ctx.measureText(parsedValue.currencySymbol || '').width + TEXT_GAP;

  ctx.fillStyle = theme.cellTextColor;
  ctx.beginPath();
  ctx.moveTo(currentX, centerY - 4);
  ctx.lineTo(currentX + CHEVRON_W, centerY - 4);
  ctx.lineTo(currentX + CHEVRON_W / 2, centerY + 4);
  ctx.closePath();
  ctx.fill();
  currentX += CHEVRON_W + CHEVRON_GAP;

  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = VLINE_W;
  ctx.beginPath();
  ctx.moveTo(currentX, centerY - 12);
  ctx.lineTo(currentX, centerY + 12);
  ctx.stroke();
  currentX += VLINE_W + VLINE_GAP;

  ctx.fillStyle = theme.cellTextColor;
  ctx.fillText(parsedValue.currencyValue || '', currentX, centerY);

  ctx.restore();
}

function paintPhoneNumber(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const cellData = (cell as any).data;
  const displayData = cell.displayData;
  const cellValue = cellData || displayData;

  const { isValid, parsedValue } = validateAndParsePhoneNumber(cellValue);

  if (!isValid && cellValue !== null && cellValue !== undefined && cellValue !== '') {
    paintError(ctx, typeof cellValue === 'string' ? cellValue : JSON.stringify(cellValue), rect, theme);
    return;
  }

  if (!parsedValue) return;

  const { countryCode, countryNumber, phoneNumber } = parsedValue;
  if (!countryCode && !countryNumber && !phoneNumber) return;

  const { x, y, height } = rect;
  const centerY = y + height / 2;
  let currentX = x + theme.cellPaddingX;

  ctx.save();
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (countryCode) {
    const country = getCountry(countryCode);
    if (country) {
      drawFlagSync(ctx, currentX, centerY - FLAG_H / 2, FLAG_W, FLAG_H, countryCode);
      currentX += FLAG_W + FLAG_GAP;
    }
  }

  if (countryNumber) {
    const codeText = `+${countryNumber}`;
    ctx.fillStyle = theme.cellTextColor;
    ctx.fillText(codeText, currentX, centerY);
    currentX += ctx.measureText(codeText).width + 4;
  }

  if (countryCode || countryNumber) {
    ctx.fillStyle = theme.cellTextColor;
    ctx.beginPath();
    ctx.moveTo(currentX, centerY - 4);
    ctx.lineTo(currentX + 8, centerY - 4);
    ctx.lineTo(currentX + 4, centerY + 4);
    ctx.closePath();
    ctx.fill();
    currentX += CHEVRON_W + VLINE_GAP;

    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = VLINE_W;
    ctx.beginPath();
    ctx.moveTo(currentX, centerY - FLAG_H / 2);
    ctx.lineTo(currentX, centerY + FLAG_H / 2);
    ctx.stroke();
    currentX += VLINE_W + VLINE_GAP;
  }

  if (phoneNumber) {
    ctx.fillStyle = theme.cellTextColor;
    ctx.fillText(phoneNumber, currentX, centerY);
  }

  ctx.restore();
}

function paintAddress(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const cellData = (cell as any).data;
  const displayData = cell.displayData;
  const cellValue = cellData || displayData;

  if (!cellValue) return;

  let addressString = '';

  if (displayData && typeof displayData === 'string' && displayData.trim() !== '') {
    if (!displayData.startsWith('{') && !displayData.startsWith('[')) {
      addressString = displayData;
    } else {
      const result = validateAndParseAddress(displayData);
      if (!result.isValid && cellValue !== null && cellValue !== undefined && cellValue !== '') {
        paintError(ctx, typeof cellValue === 'string' ? cellValue : JSON.stringify(cellValue), rect, theme);
        return;
      }
      if (result.isValid && result.parsedValue) {
        addressString = getAddress(result.parsedValue);
      }
    }
  } else if (cellData) {
    const result = validateAndParseAddress(cellData);
    if (!result.isValid) {
      paintError(ctx, JSON.stringify(cellData), rect, theme);
      return;
    }
    if (result.parsedValue) {
      addressString = getAddress(result.parsedValue);
    }
  }

  if (!addressString) return;

  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textBaseline = 'middle';
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;
  drawTruncatedText(ctx, addressString, rect.x + px, rect.y + rect.height / 2, maxW, 'left');
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
      ctx.fillStyle = '#39A380';
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
  const meta = (cell as any).options?.computedFieldMeta;
  if (meta?.shouldShowLoading) {
    paintLoading(ctx, rect, theme, 'Loading...');
    return;
  }
  if (meta?.hasError) {
    paintError(ctx, cell.displayData || 'Error', rect, theme);
    return;
  }
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

export { paintError as paintErrorCell, paintLoading as paintLoadingCell };

function paintLink(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const data = (cell as any).data;
  if (!data || !Array.isArray(data) || data.length === 0) {
    ctx.fillStyle = theme.cellTextSecondary;
    ctx.font = `13px ${theme.fontFamily}`;
    ctx.textBaseline = 'middle';
    drawTruncatedText(ctx, '', x + pad, y + h / 2, w - pad * 2);
    return;
  }
  let curX = x + pad;
  const chipH = 22;
  const chipY = y + (h - chipH) / 2;
  ctx.font = `12px ${theme.fontFamily}`;
  for (const record of data) {
    const title = record.title || record.name || `#${record.id}`;
    const textW = ctx.measureText(title).width;
    const chipW = textW + 16;
    if (curX + chipW > x + w - pad) break;
    drawRoundedRect(ctx, curX, chipY, chipW, chipH, 4);
    ctx.fillStyle = '#e0f2fe';
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, curX + 8, chipY + chipH / 2);
    curX += chipW + 4;
  }
}

function paintUserAvatar(ctx: CanvasRenderingContext2D, user: any, cx: number, cy: number, radius: number, theme: GridTheme): void {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = theme.activeCellBorderColor;
  ctx.fill();
  const initial = (user.name || user.email || '?')[0].toUpperCase();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${radius}px ${theme.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, cx, cy);
  ctx.textAlign = 'left';
}

function paintUser(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const data = (cell as any).data;
  if (!data || !Array.isArray(data) || data.length === 0) return;
  let curX = x + pad;
  const avatarR = 10;
  for (const user of data) {
    if (curX + avatarR * 2 + 4 > x + w - pad) break;
    paintUserAvatar(ctx, user, curX + avatarR, y + h / 2, avatarR, theme);
    const name = user.name || user.email || '';
    ctx.font = `13px ${theme.fontFamily}`;
    ctx.fillStyle = theme.cellTextColor;
    ctx.textBaseline = 'middle';
    const nameW = ctx.measureText(name).width;
    const availableW = x + w - pad - (curX + avatarR * 2 + 6);
    if (availableW > 20) {
      drawTruncatedText(ctx, name, curX + avatarR * 2 + 6, y + h / 2, Math.min(nameW, availableW));
      curX += avatarR * 2 + 6 + Math.min(nameW, availableW) + 8;
    } else {
      curX += avatarR * 2 + 4;
    }
  }
}

function paintCreatedBy(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const data = (cell as any).data;
  if (!data) return;
  const avatarR = 10;
  paintUserAvatar(ctx, data, x + pad + avatarR, y + h / 2, avatarR, theme);
  const name = data.name || data.email || '';
  ctx.font = `13px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextSecondary;
  ctx.textBaseline = 'middle';
  drawTruncatedText(ctx, name, x + pad + avatarR * 2 + 6, y + h / 2, w - pad * 2 - avatarR * 2 - 6);
}

function paintLastModifiedBy(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  paintCreatedBy(ctx, cell, rect, theme);
}

function paintLastModifiedTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const displayData = (cell as any).displayData || '';
  ctx.fillStyle = theme.cellTextSecondary;
  ctx.font = `13px ${theme.fontFamily}`;
  ctx.textBaseline = 'middle';
  drawTruncatedText(ctx, displayData, x + pad, y + h / 2, w - pad * 2);
}

function paintAutoNumber(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const data = (cell as any).data;
  const text = data != null ? String(data) : '';
  ctx.fillStyle = theme.cellTextSecondary;
  ctx.font = `13px ${theme.fontFamily}`;
  ctx.textBaseline = 'middle';
  drawTruncatedText(ctx, text, x + pad, y + h / 2, w - pad * 2);
}

function paintButton(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const options = (cell as any).options || {};
  const label = options.label || 'Click';
  const style = options.style || 'primary';
  ctx.font = `bold 12px ${theme.fontFamily}`;
  const btnW = Math.min(ctx.measureText(label).width + 24, w - 16);
  const btnH = 28;
  const btnX = x + (w - btnW) / 2;
  const btnY = y + (h - btnH) / 2;

  const colorMap: Record<string, string> = {
    primary: theme.activeCellBorderColor,
    default: '#6b7280',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  };

  drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 6);
  ctx.fillStyle = colorMap[style] || colorMap.primary;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 12px ${theme.fontFamily}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(label, btnX + btnW / 2, btnY + btnH / 2);
  ctx.textAlign = 'left';
}

function paintCheckbox(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const data = (cell as any).data;
  const size = 18;
  const cbX = x + (w - size) / 2;
  const cbY = y + (h - size) / 2;

  drawRoundedRect(ctx, cbX, cbY, size, size, 3);
  if (data === true) {
    ctx.fillStyle = theme.activeCellBorderColor;
    ctx.fill();
    drawCheckmark(ctx, cbX, cbY, size);
  } else {
    ctx.strokeStyle = theme.cellBorderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function paintRollup(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const displayData = (cell as any).displayData || '';
  ctx.fillStyle = theme.cellTextSecondary;
  ctx.font = `13px ${theme.fontFamily}`;
  ctx.textBaseline = 'middle';
  drawTruncatedText(ctx, displayData, x + pad, y + h / 2, w - pad * 2);
}

function paintLookup(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const data = (cell as any).data;
  if (!data || !Array.isArray(data) || data.length === 0) return;
  let curX = x + pad;
  const chipH = 20;
  const chipY = y + (h - chipH) / 2;
  ctx.font = `12px ${theme.fontFamily}`;
  for (const val of data) {
    const text = String(val);
    const textW = ctx.measureText(text).width;
    const chipW = textW + 12;
    if (curX + chipW > x + w - pad) break;
    drawRoundedRect(ctx, curX, chipY, chipW, chipH, 3);
    ctx.fillStyle = theme.headerBgColor;
    ctx.fill();
    ctx.fillStyle = theme.cellTextColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, curX + 6, chipY + chipH / 2);
    curX += chipW + 4;
  }
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
    case CellType.Link:
      paintLink(ctx, cell, rect, theme);
      break;
    case CellType.User:
      paintUser(ctx, cell, rect, theme);
      break;
    case CellType.CreatedBy:
      paintCreatedBy(ctx, cell, rect, theme);
      break;
    case CellType.LastModifiedBy:
      paintLastModifiedBy(ctx, cell, rect, theme);
      break;
    case CellType.LastModifiedTime:
      paintLastModifiedTime(ctx, cell, rect, theme);
      break;
    case CellType.AutoNumber:
      paintAutoNumber(ctx, cell, rect, theme);
      break;
    case CellType.Button:
      paintButton(ctx, cell, rect, theme);
      break;
    case CellType.Checkbox:
      paintCheckbox(ctx, cell, rect, theme);
      break;
    case CellType.Rollup:
      paintRollup(ctx, cell, rect, theme);
      break;
    case CellType.Lookup:
      paintLookup(ctx, cell, rect, theme);
      break;
    default:
      paintString(ctx, cell, rect, theme);
      break;
  }
}
