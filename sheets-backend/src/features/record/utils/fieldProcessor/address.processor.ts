import { BaseFieldProcessor } from './base.processor';
import { BadRequestException } from '@nestjs/common';
import { DATA_KEYS } from 'src/features/field/DTO/mappings.dto';

export class AddressFieldProcessor extends BaseFieldProcessor {
  normalizeData(): Record<string, any> {
    const data = this.fieldInfo.data;

    if (data === null || data === undefined) {
      return {};
    }

    if (typeof data === 'string' || Array.isArray(data)) {
      return {
        addressLineOne: Array.isArray(data) ? JSON.stringify(data) : data,
      };
    }

    if (typeof data === 'object') {
      const dataKeys = Object.keys(data);
      const hasOnlyAllowedKeys = dataKeys.every((key) =>
        DATA_KEYS.ADDRESS.includes(key),
      );

      if (hasOnlyAllowedKeys) {
        const normalized: Record<string, any> = {};
        for (const key of DATA_KEYS.ADDRESS) {
          if (data.hasOwnProperty(key)) {
            const value = data[key];
            if (value !== null && value !== undefined) {
              normalized[key] = value;
            }
          }
        }
        return normalized;
      }

      // Contains disallowed keys → stringify the whole object into addressLineOne
      return {
        addressLineOne: JSON.stringify(data),
      };
    }

    // Other types like number, boolean
    return {
      addressLineOne: JSON.stringify(data),
    };
  }

  getMissingOptions(): any[] {
    // No options to update for address
    return [];
  }

  getUpdatedOptions(): any[] {
    // No options to update for address
    return [];
  }

  async process(): Promise<void> {
    try {
      this.normalizedData = this.normalizeData();
    } catch (error) {
      throw new BadRequestException(
        `Invalid data format for ${this.field.type}`,
      );
    }

    this.fieldInfo.data = this.normalizedData;
    this.recordData[this.field.dbFieldName] = this.fieldInfo.data;
  }
}
