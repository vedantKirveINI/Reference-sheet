import { BadRequestException } from '@nestjs/common';

export class JsonObjectFilterBuilder {
  constructor(
    protected column_name: string,
    protected operator: string,
    protected value: string,
    protected nested_key: string | null = null, // Handle the case where it's not provided
    protected allowed_keys: string[], // This will be set in the subclass
  ) {}

  build(): string {
    // Validate nested_key when necessary
    if (this.nested_key && !this.allowed_keys.includes(this.nested_key)) {
      throw new BadRequestException(`${this.nested_key} is not a valid key`);
    }

    const coalesced_fields = this.allowed_keys
      .map((key) => `COALESCE("${this.column_name}" ->> '${key}', '')`)
      .join(" || ' ' || ");

    return this.build_where_query(coalesced_fields);
  }

  private build_where_query(coalesced_fields: string): string {
    // Use the operator to delegate to the respective method
    switch (this.operator) {
      case '=':
        return this.handleEquals();

      case '!=':
        return this.handleNotEquals();

      case 'ilike':
        return this.handleILike(coalesced_fields);

      case 'not_ilike':
        return this.handleNotILike(coalesced_fields);

      case "=''":
        return this.handleEmpty();

      case "!=''":
        return this.handleNotEmpty();

      default:
        throw new BadRequestException(`Unsupported operator: ${this.operator}`);
    }
  }

  // Operator handling methods
  protected handleEquals(): string {
    if (!this.nested_key)
      throw new BadRequestException('nested_key is required for =');
    return `"${this.column_name}" ->> '${this.nested_key}' = ${this.value}`;
  }

  protected handleNotEquals(): string {
    if (!this.nested_key)
      throw new BadRequestException('nested_key is required for !=');
    return `"${this.column_name}" ->> '${this.nested_key}' != ${this.value}`;
  }

  protected handleILike(coalesced_fields: string): string {
    return this.nested_key
      ? `"${this.column_name}" ->> '${this.nested_key}' ILIKE ${this.value}`
      : `(${coalesced_fields}) ILIKE ${this.value}`;
  }

  protected handleNotILike(coalesced_fields: string): string {
    return this.nested_key
      ? `"${this.column_name}" ->> '${this.nested_key}' NOT ILIKE ${this.value}`
      : `(${coalesced_fields}) NOT ILIKE ${this.value}`;
  }

  protected handleEmpty(): string {
    return this.nested_key
      ? `COALESCE("${this.column_name}" ->> '${this.nested_key}', '') =''`
      : `"${this.column_name}" = '{}'::jsonb OR "${this.column_name}" IS NULL`;
  }

  protected handleNotEmpty(): string {
    return this.nested_key
      ? `COALESCE("${this.column_name}" ->> '${this.nested_key}', '') !=''`
      : `"${this.column_name}" IS NOT NULL AND "${this.column_name}" != '{}'::jsonb`;
  }
}
