import { BaseFieldProcessor } from './base.processor';
import { BadRequestException } from '@nestjs/common';

export class MCQFieldProcessor extends BaseFieldProcessor {
  normalizeData(): string[] {
    const data = this.fieldInfo.data;
    let normalized: string[];

    if (data === null || data === undefined) {
      normalized = [];
    } else if (typeof data === 'string') {
      normalized = [data];
    } else if (typeof data === 'object') {
      // Handle arrays and objects
      if (Array.isArray(data)) {
        normalized = data.map((item) => {
          if (item === null || item === undefined) return '';
          if (typeof item === 'string') return item;
          return JSON.stringify(item);
        });
      } else {
        // Single object
        normalized = [JSON.stringify(data)];
      }
    } else {
      // For other types like number or boolean
      normalized = [JSON.stringify(data)];
    }

    return normalized.filter((val) => val !== null && val !== undefined);
  }

  getMissingOptions(currentOptions: string[]): string[] {
    const isValidLabel = (label: any) =>
      label && typeof label === 'string' && label.trim() !== '';

    return this.normalizedData.filter(
      (value: string) => isValidLabel(value) && !currentOptions.includes(value),
    );
  }

  getUpdatedOptions(currentOptions: string[], missingValues: string[]) {
    return [...currentOptions, ...missingValues];
  }

  async process(): Promise<void> {
    const field = this.field;
    const field_info = this.fieldInfo;
    const current_options: string[] = field.options.options;

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
