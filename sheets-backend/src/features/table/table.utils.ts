export class TableUtils {
  parseNumberWithCommas(value: string): number | undefined {
    // Remove commas and parse the string to a float number
    const cleanedValue = value.replace(/,/g, '');

    // Check if the cleaned value is a valid number
    const parsed_number = parseFloat(cleanedValue);
    return isNaN(parsed_number) ? undefined : parsed_number;
  }
}
