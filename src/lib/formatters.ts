import { validateAndParseCurrency } from './validators/currency';
import { validateAndParsePhoneNumber } from './validators/phone';
import { validateAndParseAddress, getAddress } from './validators/address';

export function formatCurrency(data: any): string {
  const { isValid, parsedValue } = validateAndParseCurrency(data);
  if (!isValid || !parsedValue) return '';
  const parts: string[] = [];
  if (parsedValue.currencySymbol) parts.push(parsedValue.currencySymbol);
  if (parsedValue.currencyValue) parts.push(parsedValue.currencyValue);
  if (parts.length === 0 && parsedValue.currencyCode) return parsedValue.currencyCode;
  return parts.join(' ');
}

export function formatPhoneNumber(data: any): string {
  const { isValid, parsedValue } = validateAndParsePhoneNumber(data);
  if (!isValid || !parsedValue) return '';
  const parts: string[] = [];
  if (parsedValue.countryNumber) parts.push(`+${parsedValue.countryNumber}`);
  if (parsedValue.phoneNumber) parts.push(parsedValue.phoneNumber);
  return parts.join(' ');
}

export function formatAddress(data: any): string {
  if (typeof data === 'string') {
    if (!data.startsWith('{') && !data.startsWith('[')) return data;
    const { isValid, parsedValue } = validateAndParseAddress(data);
    if (!isValid || !parsedValue) return '';
    return getAddress(parsedValue);
  }
  const { isValid, parsedValue } = validateAndParseAddress(data);
  if (!isValid || !parsedValue) return '';
  return getAddress(parsedValue);
}

export function formatCellValue(type: string, data: any): string {
  switch (type) {
    case 'Currency': return formatCurrency(data);
    case 'PhoneNumber': return formatPhoneNumber(data);
    case 'Address': return formatAddress(data);
    default: return typeof data === 'string' ? data : JSON.stringify(data ?? '');
  }
}
