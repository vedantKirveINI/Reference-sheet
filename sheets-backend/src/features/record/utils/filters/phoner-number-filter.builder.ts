import { DATA_KEYS } from 'src/features/field/DTO/mappings.dto';
import { JsonObjectFilterBuilder } from './json-object-filter.builder';

export class PhoneNumberFilterBuilder extends JsonObjectFilterBuilder {
  protected allowed_keys: string[] = DATA_KEYS.PHONE_NUMBER;

  constructor(
    protected column_name: string,
    protected operator: string,
    protected value: string,
    protected nested_key: string | null = null, // Handle the case where it's not provided
  ) {
    super(column_name, operator, value, nested_key, DATA_KEYS.PHONE_NUMBER);
  }
}
