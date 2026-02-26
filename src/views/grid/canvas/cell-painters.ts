import { CellType, ICell } from '@/types';
import { IRenderRect } from './types';
import { GridTheme } from './theme';
import { validateAndParseCurrency } from '@/lib/validators/currency';
import { validateAndParsePhoneNumber } from '@/lib/validators/phone';
import { validateAndParseAddress, getAddress } from '@/lib/validators/address';
import { validateAndParseZipCode } from '@/lib/validators/zipCode';
import { drawFlagSync } from '@/lib/countries';

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

function drawTextLine(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, align: 'left' | 'right' | 'center'): void {
  const measured = ctx.measureText(text);
  let drawX = x;
  if (align === 'right') drawX = x + maxWidth - measured.width;
  else if (align === 'center') drawX = x + (maxWidth - measured.width) / 2;
  ctx.fillText(text, drawX, y);
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxHeight: number, align: 'left' | 'right' | 'center' = 'left'): void {
  if (!text) return;
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + ' ' + words[i] : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      drawTextLine(ctx, line, x, currentY, maxWidth, align);
      line = words[i];
      currentY += lineHeight;
      if (currentY > y + maxHeight - lineHeight) {
        drawTruncatedText(ctx, line + ' ' + words.slice(i + 1).join(' '), x, currentY, maxWidth, align);
        return;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    drawTextLine(ctx, line, x, currentY, maxWidth, align);
  }
}

const FLAG_WIDTH = 20;
const FLAG_HEIGHT = 15;
const FLAG_GAP = 6;
const VERTICAL_LINE_WIDTH = 1;
const VERTICAL_LINE_GAP = 6;

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

function paintString(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
  const text = cell.displayData || '';
  if (!text) return;
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = rect.y + theme.cellPaddingY;
    const maxH = rect.height - theme.cellPaddingY * 2;
    drawWrappedText(ctx, text, rect.x + px, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rect.x + px, rect.y + rect.height / 2);
  } else {
    ctx.textBaseline = 'middle';
    drawTruncatedText(ctx, text, rect.x + px, rect.y + rect.height / 2, maxW, 'left');
  }
}

function paintNumber(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
  const text = cell.displayData || '';
  if (!text) return;
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = rect.y + theme.cellPaddingY;
    const maxH = rect.height - theme.cellPaddingY * 2;
    drawWrappedText(ctx, text, rect.x + px, startY, maxW, lineHeight, maxH, 'right');
  } else if (textWrapMode === 'Overflow') {
    ctx.textBaseline = 'middle';
    const measured = ctx.measureText(text);
    ctx.fillText(text, rect.x + px + maxW - measured.width, rect.y + rect.height / 2);
  } else {
    ctx.textBaseline = 'middle';
    drawTruncatedText(ctx, text, rect.x + px, rect.y + rect.height / 2, maxW, 'right');
  }
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

function getDropDownLabel(item: any): string {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) return item.label || item.name || item.id || '';
  return String(item);
}

function paintDropDown(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const rawData = (cell as any).data;
  if (!Array.isArray(rawData) || rawData.length === 0) return;
  const labels = rawData.map(getDropDownLabel).filter(Boolean);
  if (labels.length === 0) return;
  const options = ((cell as any).options?.options as any[]) || [];
  const optLabels = options.map((o: any) => typeof o === 'string' ? o : o.label);
  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;
  const gap = 4;
  let currentX = rect.x + px;
  const maxX = rect.x + rect.width - px;
  let remaining = 0;

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const color = getChipColor(label, optLabels, theme);
    ctx.font = `${theme.fontSize - 1}px ${theme.fontFamily}`;
    const textW = ctx.measureText(label).width;
    const chipW = textW + 12;

    if (currentX + chipW > maxX) {
      remaining = labels.length - i;
      break;
    }

    paintChip(ctx, label, currentX, chipY, chipH, color, theme);
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

function paintDateTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
  paintString(ctx, cell, rect, theme, textWrapMode);
}

function paintCreatedTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
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
  const textX = rect.x + px + iconW + 4;

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = rect.y + theme.cellPaddingY;
    const maxH = rect.height - theme.cellPaddingY * 2;
    drawWrappedText(ctx, text, textX, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    ctx.fillText(text, textX, rect.y + rect.height / 2);
  } else {
    drawTruncatedText(ctx, text, textX, rect.y + rect.height / 2, maxW, 'left');
  }
}

function paintError(ctx: CanvasRenderingContext2D, value: string, rect: IRenderRect, theme: GridTheme): void {
  ctx.fillStyle = '#FEF2F2';
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
  const cx = iconX + iconSize / 2;
  const cy = iconY + iconSize / 2;

  ctx.save();
  // Draw warning triangle
  ctx.beginPath();
  ctx.moveTo(cx, iconY + 1);
  ctx.lineTo(iconX + iconSize - 1, iconY + iconSize - 1);
  ctx.lineTo(iconX + 1, iconY + iconSize - 1);
  ctx.closePath();
  ctx.fillStyle = '#EF4444';
  ctx.fill();

  // Draw exclamation mark (white)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(iconSize * 0.65)}px ${theme.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', cx, cy + 2);
  ctx.textAlign = 'left';
  ctx.restore();
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

function paintCurrency(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
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

  const fullText = `${parsedValue.currencyCode ? parsedValue.currencyCode + ' ' : ''}${parsedValue.currencySymbol || ''}${parsedValue.currencyValue || ''}`;
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;

  ctx.save();
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textAlign = 'left';

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = rect.y + theme.cellPaddingY;
    const maxH = rect.height - theme.cellPaddingY * 2;
    drawWrappedText(ctx, fullText, rect.x + px, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    ctx.textBaseline = 'middle';
    ctx.fillText(fullText, rect.x + px, rect.y + rect.height / 2);
  } else {
    ctx.textBaseline = 'middle';
    const { x, y, height } = rect;
    const centerY = y + height / 2;
    let currentX = x + px;
    const maxX = x + rect.width - px;

    if (parsedValue.countryCode) {
      drawFlagSync(ctx, currentX, centerY - FLAG_HEIGHT / 2, FLAG_WIDTH, FLAG_HEIGHT, parsedValue.countryCode);
      currentX += FLAG_WIDTH + FLAG_GAP;
    }

    ctx.beginPath();
    ctx.strokeStyle = '#E0E0E0';
    ctx.moveTo(currentX, centerY - 12);
    ctx.lineTo(currentX, centerY + 12);
    ctx.lineWidth = VERTICAL_LINE_WIDTH;
    ctx.stroke();
    currentX += VERTICAL_LINE_WIDTH + VERTICAL_LINE_GAP;

    ctx.fillStyle = theme.cellTextColor;
    const displayStr = `${parsedValue.currencySymbol || ''}${parsedValue.currencyValue || ''}`;
    const availW = maxX - currentX;
    if (availW > 0) {
      drawTruncatedText(ctx, displayStr, currentX, centerY, availW, 'left');
    }
  }

  ctx.restore();
}

function paintZipCode(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const cellData = (cell as any).data;
  const displayData = cell.displayData;
  const cellValue = cellData ?? displayData;

  const { isValid, parsedValue } = validateAndParseZipCode(cellValue);

  const hasAnyValue =
    (cellData != null && cellData !== undefined) ||
    (displayData != null && displayData !== undefined && displayData !== '');

  if (!isValid && hasAnyValue) {
    const errorValue =
      typeof displayData === 'string' && displayData !== ''
        ? displayData
        : cellData != null && cellData !== undefined
          ? typeof cellData === 'string'
            ? cellData
            : JSON.stringify(cellData)
          : String(cellValue ?? '');
    paintError(ctx, errorValue, rect, theme);
    return;
  }

  if (!parsedValue || !parsedValue.zipCode) return;

  const { x, y, height } = rect;
  const centerY = y + height / 2;
  let currentX = x + theme.cellPaddingX;
  const maxX = x + rect.width - theme.cellPaddingX;

  ctx.save();
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (parsedValue.countryCode) {
    drawFlagSync(
      ctx,
      currentX,
      centerY - FLAG_HEIGHT / 2,
      FLAG_WIDTH,
      FLAG_HEIGHT,
      parsedValue.countryCode
    );
    currentX += FLAG_WIDTH + FLAG_GAP;
  }

  ctx.beginPath();
  ctx.strokeStyle = '#E0E0E0';
  ctx.moveTo(currentX, centerY - 12);
  ctx.lineTo(currentX, centerY + 12);
  ctx.lineWidth = VERTICAL_LINE_WIDTH;
  ctx.stroke();
  currentX += VERTICAL_LINE_WIDTH + VERTICAL_LINE_GAP;

  ctx.fillStyle = theme.cellTextColor;
  const availW = maxX - currentX;
  if (availW > 0) {
    drawTruncatedText(ctx, parsedValue.zipCode, currentX, centerY, availW, 'left');
  }

  ctx.restore();
}

function paintPhoneNumber(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
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
  if (!countryNumber && !phoneNumber) return;

  const fullText = countryNumber ? `+${countryNumber} ${phoneNumber || ''}`.trim() : (phoneNumber || '');
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  const { x, y, height } = rect;
  const centerY = y + height / 2;
  let currentX = x + px;
  const maxX = x + rect.width - px;

  ctx.save();
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.fillStyle = theme.cellTextColor;
  ctx.textAlign = 'left';

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = rect.y + theme.cellPaddingY;
    const maxH = rect.height - theme.cellPaddingY * 2;
    drawWrappedText(ctx, fullText, rect.x + px, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    if (countryCode) {
      drawFlagSync(ctx, currentX, centerY - FLAG_HEIGHT / 2, FLAG_WIDTH, FLAG_HEIGHT, countryCode);
      currentX += FLAG_WIDTH + FLAG_GAP;
    }
    ctx.beginPath();
    ctx.strokeStyle = '#E0E0E0';
    ctx.moveTo(currentX, centerY - 12);
    ctx.lineTo(currentX, centerY + 12);
    ctx.lineWidth = VERTICAL_LINE_WIDTH;
    ctx.stroke();
    currentX += VERTICAL_LINE_WIDTH + VERTICAL_LINE_GAP;
    ctx.textBaseline = 'middle';
    ctx.fillText(fullText, currentX, centerY);
  } else {
    ctx.textBaseline = 'middle';
    if (countryCode) {
      drawFlagSync(ctx, currentX, centerY - FLAG_HEIGHT / 2, FLAG_WIDTH, FLAG_HEIGHT, countryCode);
      currentX += FLAG_WIDTH + FLAG_GAP;
    }
    ctx.beginPath();
    ctx.strokeStyle = '#E0E0E0';
    ctx.moveTo(currentX, centerY - 12);
    ctx.lineTo(currentX, centerY + 12);
    ctx.lineWidth = VERTICAL_LINE_WIDTH;
    ctx.stroke();
    currentX += VERTICAL_LINE_WIDTH + VERTICAL_LINE_GAP;
    const availW = maxX - currentX;
    if (availW > 0) {
      drawTruncatedText(ctx, fullText, currentX, centerY, availW, 'left');
    }
  }

  ctx.restore();
}

function paintAddress(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
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
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = rect.y + theme.cellPaddingY;
    const maxH = rect.height - theme.cellPaddingY * 2;
    drawWrappedText(ctx, addressString, rect.x + px, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    ctx.textBaseline = 'middle';
    ctx.fillText(addressString, rect.x + px, rect.y + rect.height / 2);
  } else {
    ctx.textBaseline = 'middle';
    drawTruncatedText(ctx, addressString, rect.x + px, rect.y + rect.height / 2, maxW, 'left');
  }
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
  const val = (cell as any).data as number | null;
  const minV = (cell as any).options?.minValue ?? 0;
  const maxV = (cell as any).options?.maxValue ?? 10;
  if (val === null || val === undefined) return;
  const range = maxV - minV || 1;
  const pct = Math.min(100, Math.max(0, ((val - minV) / range) * 100));
  const px = theme.cellPaddingX;
  const barH = 6;
  const barY = rect.y + (rect.height - barH) / 2;

  const displayText = cell.displayData || `${val}/${maxV}`;
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

function paintTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
  paintString(ctx, cell, rect, theme, textWrapMode);
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
  const val = (cell as any).data as number | null;
  const max = (cell as any).options?.maxValue ?? 10;
  if (val === null || val === undefined) return;
  const text = `${val}/${max}`;
  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;
  const color = { bg: '#f3e8ff', text: '#7e22ce' };

  ctx.font = `bold ${theme.fontSize - 1}px ${theme.fontFamily}`;
  paintChip(ctx, text, rect.x + px, chipY, chipH, color, theme);
}

function paintFormula(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
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
  const px = theme.cellPaddingX;
  const maxW = rect.width - px * 2;
  if (maxW <= 0) return;

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = rect.y + theme.cellPaddingY;
    const maxH = rect.height - theme.cellPaddingY * 2;
    drawWrappedText(ctx, text, rect.x + px, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rect.x + px, rect.y + rect.height / 2);
  } else {
    ctx.textBaseline = 'middle';
    drawTruncatedText(ctx, text, rect.x + px, rect.y + rect.height / 2, maxW, 'left');
  }
}

function paintList(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const rawItems = Array.isArray((cell as any).data) ? (cell as any).data : [];
  const items = rawItems.map((x: any) => String(x));
  if (items.length === 0) return;

  const chipH = 20;
  const chipY = rect.y + (rect.height - chipH) / 2;
  const px = theme.cellPaddingX;
  const gap = 4;
  let currentX = rect.x + px;
  const maxX = rect.x + rect.width - px;
  let remaining = 0;

  for (let i = 0; i < items.length; i++) {
    const label = items[i];
    const color = getChipColor(label, items, theme);
    ctx.font = `${theme.fontSize - 1}px ${theme.fontFamily}`;
    const textW = ctx.measureText(label).width;
    const chipW = textW + 12;

    if (currentX + chipW > maxX) {
      remaining = items.length - i;
      break;
    }
    paintChip(ctx, label, currentX, chipY, chipH, color, theme);
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

function paintEnrichment(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const text = cell.displayData || '';
  const px = theme.cellPaddingX;

  if (!text) {
    const btnSize = 22;
    const btnX = rect.x + (rect.width - btnSize) / 2;
    const btnY = rect.y + (rect.height - btnSize) / 2;
    
    ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnSize, btnSize, 4);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnSize, btnSize, 4);
    ctx.stroke();
    
    const cx = btnX + btnSize / 2;
    const cy = btnY + btnSize / 2;
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 5);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx - 3, cy + 5);
    ctx.closePath();
    ctx.fill();
    return;
  }

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

function paintLastModifiedTime(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const displayData = (cell as any).displayData || '';
  ctx.fillStyle = theme.cellTextSecondary;
  ctx.font = `13px ${theme.fontFamily}`;
  const maxW = w - pad * 2;

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = y + theme.cellPaddingY;
    const maxH = h - theme.cellPaddingY * 2;
    drawWrappedText(ctx, displayData, x + pad, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    ctx.textBaseline = 'middle';
    ctx.fillText(displayData, x + pad, y + h / 2);
  } else {
    ctx.textBaseline = 'middle';
    drawTruncatedText(ctx, displayData, x + pad, y + h / 2, maxW);
  }
}

function paintAutoNumber(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const data = (cell as any).data;
  const text = data != null ? String(data) : '';
  ctx.fillStyle = theme.cellTextSecondary;
  ctx.font = `13px ${theme.fontFamily}`;
  const maxW = w - pad * 2;

  if (textWrapMode === 'Wrap') {
    ctx.textBaseline = 'top';
    const lineHeight = theme.fontSize + 4;
    const startY = y + theme.cellPaddingY;
    const maxH = h - theme.cellPaddingY * 2;
    drawWrappedText(ctx, text, x + pad, startY, maxW, lineHeight, maxH, 'left');
  } else if (textWrapMode === 'Overflow') {
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + pad, y + h / 2);
  } else {
    ctx.textBaseline = 'middle';
    drawTruncatedText(ctx, text, x + pad, y + h / 2, maxW);
  }
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

function formatLookupValue(val: any, options?: any): string {
  if (val === null || val === undefined) return '';
  const lookupType = options?.lookupFieldType || options?.sourceFieldType;
  if (lookupType === 'NUMBER' || lookupType === CellType.Number) {
    const num = Number(val);
    if (!isNaN(num)) return num.toLocaleString();
  }
  if (lookupType === 'CURRENCY' || lookupType === CellType.Currency) {
    if (typeof val === 'object' && val?.currencyValue) {
      return `${val.currencySymbol || '$'}${Number(val.currencyValue).toLocaleString()}`;
    }
    const num = Number(val);
    if (!isNaN(num)) return `$${num.toLocaleString()}`;
  }
  if (lookupType === 'DATE' || lookupType === CellType.DateTime) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleDateString();
  }
  if (lookupType === 'CHECKBOX' || lookupType === CellType.Checkbox) {
    return val ? '✓' : '✗';
  }
  if (typeof val === 'object') {
    if (val.label) return val.label;
    if (val.name) return val.name;
    if (val.title) return val.title;
    if (val.currencyValue != null) return `${val.currencySymbol || '$'}${val.currencyValue}`;
    if (val.phoneNumber) {
      const cn = String(val.countryNumber || '').replace(/^\+/, '');
      return cn ? `+${cn} ${val.phoneNumber}` : val.phoneNumber;
    }
    if (val.addressLineOne) return [val.addressLineOne, val.city, val.state].filter(Boolean).join(', ');
    return JSON.stringify(val);
  }
  return String(val);
}

function formatRollupValue(displayData: string, data: any, options?: any): string {
  if (displayData) return displayData;
  if (data === null || data === undefined) return '';
  const num = Number(data);
  if (!isNaN(num)) {
    const expr = options?.expression || '';
    if (expr.toLowerCase().includes('count')) return String(Math.round(num));
    return num.toLocaleString();
  }
  return String(data);
}

function paintRollup(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const options = (cell as any).options;
  const formatted = formatRollupValue((cell as any).displayData || '', (cell as any).data, options);
  ctx.fillStyle = theme.cellTextColor;
  ctx.font = `bold 13px ${theme.fontFamily}`;
  ctx.textBaseline = 'middle';
  drawTruncatedText(ctx, formatted, x + pad, y + h / 2, w - pad * 2);
}

function paintLookup(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme): void {
  const { x, y, width: w, height: h } = rect;
  const pad = 8;
  const data = (cell as any).data;
  const options = (cell as any).options;
  if (!data || !Array.isArray(data) || data.length === 0) {
    const displayData = (cell as any).displayData;
    if (displayData) {
      ctx.fillStyle = theme.cellTextSecondary;
      ctx.font = `13px ${theme.fontFamily}`;
      ctx.textBaseline = 'middle';
      drawTruncatedText(ctx, displayData, x + pad, y + h / 2, w - pad * 2);
    }
    return;
  }
  let curX = x + pad;
  const chipH = 20;
  const chipY = y + (h - chipH) / 2;
  ctx.font = `12px ${theme.fontFamily}`;
  for (const val of data) {
    const text = formatLookupValue(val, options);
    if (!text) continue;
    const textW = ctx.measureText(text).width;
    const chipW = textW + 12;
    if (curX + chipW > x + w - pad) break;
    drawRoundedRect(ctx, curX, chipY, chipW, chipH, 3);
    ctx.fillStyle = '#f0fdf4';
    ctx.fill();
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = theme.cellTextColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, curX + 6, chipY + chipH / 2);
    curX += chipW + 4;
  }
}

export function paintCell(ctx: CanvasRenderingContext2D, cell: ICell, rect: IRenderRect, theme: GridTheme, textWrapMode: string = 'Clip'): void {
  switch (cell.type) {
    case CellType.String:
      paintString(ctx, cell, rect, theme, textWrapMode);
      break;
    case CellType.Number:
      paintNumber(ctx, cell, rect, theme, textWrapMode);
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
      paintDateTime(ctx, cell, rect, theme, textWrapMode);
      break;
    case CellType.CreatedTime:
      paintCreatedTime(ctx, cell, rect, theme, textWrapMode);
      break;
    case CellType.Currency:
      paintCurrency(ctx, cell, rect, theme, textWrapMode);
      break;
    case CellType.PhoneNumber:
      paintPhoneNumber(ctx, cell, rect, theme, textWrapMode);
      break;
    case CellType.ZipCode:
      paintZipCode(ctx, cell, rect, theme);
      break;
    case CellType.Address:
      paintAddress(ctx, cell, rect, theme, textWrapMode);
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
      paintTime(ctx, cell, rect, theme, textWrapMode);
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
      paintFormula(ctx, cell, rect, theme, textWrapMode);
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
      paintLastModifiedTime(ctx, cell, rect, theme, textWrapMode);
      break;
    case CellType.AutoNumber:
      paintAutoNumber(ctx, cell, rect, theme, textWrapMode);
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
      paintString(ctx, cell, rect, theme, textWrapMode);
      break;
  }
}
