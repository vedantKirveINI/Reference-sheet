import { BaseFieldProcessor } from './base.processor';
import { BadRequestException } from '@nestjs/common';

export class DropdownFieldProcessor extends BaseFieldProcessor {
  normalizeData(): Array<{ id: number | string; label: string }> {
    let data = this.fieldInfo.data;

    const normalized: Array<{ id: number | string; label: string }> = [];

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
          if (![null, undefined, ''].includes(item.label)) {
            const trimmedItem = item.label.trim();
            if (trimmedItem !== '') {
              if (![null, undefined, ''].includes(item.id)) {
                normalized.push({ id: item.id, label: trimmedItem });
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
    const currentLabels = currentOptions.map((option) => option.label.trim());

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
      field.options.options || [];

    try {
      this.normalizedData = this.normalizeData();
    } catch (error) {
      throw new BadRequestException(`Invalid data format for ${field.type}`);
    }

    const missing_values = this.getMissingOptions(current_options);

    if (missing_values.length > 0) {
      const updated_options = {
        ...field.options,
        options: this.getUpdatedOptions(current_options, missing_values),
      };

      this.prepareUpdateFieldPayload(updated_options);
      await this.updateField();
    }

    field_info.data = this.normalizedData;
    this.recordData[field.dbFieldName] = field_info.data;
  }
}
