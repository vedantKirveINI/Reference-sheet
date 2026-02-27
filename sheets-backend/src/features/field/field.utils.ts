export class FieldUtils {
  getDBFieldName(field_name: string, uuid: string): string {
    // Trim leading and trailing spaces
    let formatted_field_name = field_name.trim();

    // Replace non-alphanumeric characters (except underscores and spaces) with underscores
    formatted_field_name = formatted_field_name.replace(
      /[^\p{L}\p{N}_\s]/gu,
      '_',
    );

    // Replace spaces with underscores and remove consecutive underscores
    formatted_field_name = formatted_field_name
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();

    // If the name starts with a number, prepend an underscore to make it valid
    if (/^\d/.test(formatted_field_name)) {
      formatted_field_name = '_' + formatted_field_name;
    }

    // Ensure the field name is not empty
    if (formatted_field_name === '') {
      formatted_field_name = '_field';
    }

    // PostgreSQL column name limit
    const max_bytes = 63;
    const uuid_bytes = Buffer.byteLength(`_${uuid}`, 'utf8'); // UUID + separator
    let formatted_bytes = Buffer.byteLength(formatted_field_name, 'utf8');

    // Trim formatted_field_name to fit within the byte limit
    while (formatted_bytes + uuid_bytes > max_bytes) {
      formatted_field_name = formatted_field_name.slice(0, -1); // Remove the last character
      formatted_bytes = Buffer.byteLength(formatted_field_name, 'utf8'); // Recalculate byte length
    }

    // Append the UUID to ensure uniqueness
    return `${formatted_field_name}_${uuid}`;
  }

  getFilterFieldIdsAndClean({ filter, field_ids }) {
    function traverseAndClean(node: any): boolean {
      if ('field' in node) {
        // Check if the field value is in field_ids
        if (field_ids[node.field]) {
          return false; // Mark this node for removal
        }
      } else if ('childs' in node && Array.isArray(node.childs)) {
        // GroupNodeSchema: Recursively traverse and clean its childs
        node.childs = node.childs.filter(traverseAndClean);

        // If the node's childs array becomes empty, return false to remove this node
        if (node.childs.length === 0) {
          return false;
        }
      }

      return true; // Keep this node
    }

    if (filter && filter.childs) {
      // Filter out unwanted nodes and recursively traverse
      filter.childs = filter.childs.filter(traverseAndClean);

      // If the entire filter's childs array is empty, clear the filter object
      if (filter.childs.length === 0) {
        Object.keys(filter).forEach((key) => delete filter[key]); // Clear all keys in the filter
      }
    }
  }
}
