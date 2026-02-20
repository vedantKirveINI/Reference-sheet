import { BaseFieldProcessor } from './base.processor';
import { BadRequestException } from '@nestjs/common';

export class DropdownStaticFieldProcessor extends BaseFieldProcessor {
  normalizeData(): string[] {
    const field_info = this.fieldInfo;
    let data: string[];

    if (typeof field_info.data === 'string') {
      data = [field_info.data];
    } else if (
      typeof field_info.data === 'object' &&
      !Array.isArray(field_info.data)
    ) {
      data = [JSON.stringify(field_info.data)];
    } else if (Array.isArray(field_info.data)) {
      data = field_info.data;
    } else {
      data = [];
    }

    return data.filter((value: any) => value !== null);
  }

  getMissingOptions(currentOptions: string[]): string[] {
    const isValidLabel = (label: any) =>
      label && typeof label === 'string' && label.trim() !== '';

    return this.normalizedData.filter(
      (value: string) => isValidLabel(value) && !currentOptions.includes(value),
    );
  }

  getUpdatedOptions(currentOptions: string[], missingValues: string[]) {
    return {
      ...this.field.options,
      options: [...currentOptions, ...missingValues],
    };
  }

  async process(): Promise<void> {
    const field = this.field;
    const field_info = this.fieldInfo;
    const current_options = field.options.options;

    try {
      this.normalizedData = this.normalizeData();
    } catch (error) {
      throw new BadRequestException(`Invalid data format for ${field.type}`);
    }

    const missing_values = this.getMissingOptions(current_options);

    if (missing_values.length > 0) {
      const updated_options = this.getUpdatedOptions(
        current_options,
        missing_values,
      );

      this.prepareUpdateFieldPayload(updated_options);
      await this.updateField();
    }

    field_info.data = this.normalizedData;
    this.recordData[field.dbFieldName] = field_info.data;
  }
}
