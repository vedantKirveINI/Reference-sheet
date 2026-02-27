import { BaseFieldProcessor } from './base.processor';
import { BadRequestException } from '@nestjs/common';

export class SCQFieldProcessor extends BaseFieldProcessor {
  normalizeData(): string {
    const data = this.fieldInfo.data;

    if (data === null || data === undefined) {
      return '';
    }

    if (typeof data === 'string') {
      return data.trim();
    }

    try {
      return JSON.stringify(data);
    } catch (e) {
      throw new BadRequestException('Failed to stringify SCQ data');
    }
  }

  getMissingOptions(currentOptions: string[]): string[] {
    const normalized = this.normalizedData;

    const isValidLabel =
      normalized && typeof normalized === 'string' && normalized.trim() !== '';

    if (isValidLabel && !currentOptions.includes(normalized)) {
      return [normalized];
    }

    return [];
  }

  getUpdatedOptions(
    currentOptions: string[],
    missingValues: string[],
  ): string[] {
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
