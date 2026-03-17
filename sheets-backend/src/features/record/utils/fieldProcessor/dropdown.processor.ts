import { BaseFieldProcessor } from './base.processor';
import { BadRequestException } from '@nestjs/common';

export class DropdownFieldProcessor extends BaseFieldProcessor {
  normalizeData(): Array<{ id: number | string; label: string }> {
    let data = this.fieldInfo.data;

    const normalized: Array<{ id: number | string; label: string }> = [];

    const toLabelString = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);
      try {
        return JSON.stringify(value);
      } catch {
        return '';
      }
    };

    if (!Array.isArray(data)) {
      data = [data];
    }

    data.forEach(
      (item: string | number | Record<string, any> | null | undefined) => {
        if (item === null || item === undefined) {
          return;
        }

        if (typeof item === 'string') {
          const trimmedItem = item.trim();
          if (trimmedItem !== '') {
            normalized.push({ id: this.generateId(), label: trimmedItem });
          }
        } else if (typeof item === 'number') {
          normalized.push({ id: item, label: item.toString() });
        } else if (typeof item === 'object') {
          // Handle object with id and label
          const labelString = toLabelString((item as any)?.label);
          if (labelString !== '') {
            const trimmedItem = labelString.trim();
            if (trimmedItem !== '') {
              if (![null, undefined, ''].includes((item as any)?.id)) {
                normalized.push({ id: (item as any).id, label: trimmedItem });
              } else {
                normalized.push({ id: this.generateId(), label: trimmedItem });
              }
            }
          } else if (!this.lodash.isEmpty(item)) {
            normalized.push({
              id: this.generateId(),
              label: JSON.stringify(item),
            });
          }
        }
      },
    );

    return normalized;
  }

  getMissingOptions(
    currentOptions: Array<{ id: number | string; label: string }>,
  ): Array<{ id: number | string; label: string }> {
    const safeTrim = (value: unknown): string =>
      typeof value === 'string' ? value.trim() : '';

    const currentLabels = currentOptions
      .map((option) => safeTrim((option as any)?.label))
      .filter((label) => label !== '');

    return this.normalizedData.filter((item) => {
      const isValidLabel =
        item.label &&
        typeof item.label === 'string' &&
        item.label.trim() !== '';
      const isNewLabel = !currentLabels.includes(item.label.trim());
      return isValidLabel && isNewLabel;
    });
  }

  getUpdatedOptions(
    currentOptions: Array<{ id: number | string; label: string }>,
    missingValues: Array<{ id: number | string; label: string }>,
  ): Array<{ id: number | string; label: string }> {
    return [...currentOptions, ...missingValues];
  }

  private generateId(): number {
    // Generate a unique ID using timestamp + random number
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  async process(): Promise<void> {
    const field = this.field;
    const field_info = this.fieldInfo;
    const current_options: Array<{ id: number | string; label: string }> =
      Array.isArray(field?.options?.options) ? field.options.options : [];

    try {
      this.normalizedData = this.normalizeData();
    } catch (error) {
      throw new BadRequestException(`Invalid data format for ${field.type}`);
    }

    const missing_values = this.getMissingOptions(current_options);

    if (missing_values.length > 0) {
      const updated_options = {
        ...(field?.options ?? {}),
        options: this.getUpdatedOptions(current_options, missing_values),
      };

      this.prepareUpdateFieldPayload(updated_options);
      await this.updateField();
    }

    field_info.data = this.normalizedData;
    this.recordData[field.dbFieldName] = field_info.data;
  }
}
