const SAMPLE_FIRST_NAMES = ["John", "Jane", "Alex", "Sarah", "Michael", "Emily"];
const SAMPLE_LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller"];
const SAMPLE_DOMAINS = ["example.com", "test.org", "demo.net", "sample.io"];
const SAMPLE_COMPANIES = ["Acme Corp", "TechStart Inc", "Global Solutions", "InnovateCo"];

const generateRandomString = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomNumber = (min = 1, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomEmail = () => {
  const firstName = SAMPLE_FIRST_NAMES[Math.floor(Math.random() * SAMPLE_FIRST_NAMES.length)].toLowerCase();
  const lastName = SAMPLE_LAST_NAMES[Math.floor(Math.random() * SAMPLE_LAST_NAMES.length)].toLowerCase();
  const domain = SAMPLE_DOMAINS[Math.floor(Math.random() * SAMPLE_DOMAINS.length)];
  return `${firstName}.${lastName}@${domain}`;
};

const generateRandomPhone = () => {
  const areaCode = generateRandomNumber(200, 999);
  const exchange = generateRandomNumber(200, 999);
  const subscriber = generateRandomNumber(1000, 9999);
  return `+1 (${areaCode}) ${exchange}-${subscriber}`;
};

const generateRandomDate = (future = false) => {
  const now = new Date();
  const offset = future 
    ? generateRandomNumber(1, 365) * 24 * 60 * 60 * 1000
    : -generateRandomNumber(1, 365) * 24 * 60 * 60 * 1000;
  const date = new Date(now.getTime() + offset);
  return date.toISOString().split("T")[0];
};

const generateRandomUrl = () => {
  const protocol = "https";
  const domain = SAMPLE_DOMAINS[Math.floor(Math.random() * SAMPLE_DOMAINS.length)];
  const path = generateRandomString(6);
  return `${protocol}://${domain}/api/${path}`;
};

const generateRandomBoolean = () => {
  return Math.random() > 0.5;
};

const generateRandomName = () => {
  const firstName = SAMPLE_FIRST_NAMES[Math.floor(Math.random() * SAMPLE_FIRST_NAMES.length)];
  const lastName = SAMPLE_LAST_NAMES[Math.floor(Math.random() * SAMPLE_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

const generateRandomCompany = () => {
  return SAMPLE_COMPANIES[Math.floor(Math.random() * SAMPLE_COMPANIES.length)];
};

const generateRandomJson = () => {
  return JSON.stringify({
    id: generateRandomNumber(1, 1000),
    name: generateRandomName(),
    email: generateRandomEmail(),
    active: generateRandomBoolean(),
  }, null, 2);
};

const generateRandomArray = (count = 3) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    value: generateRandomString(6),
  }));
};

const inferFieldType = (fieldKey, fieldSchema = {}) => {
  const key = fieldKey.toLowerCase();
  const type = fieldSchema.type?.toLowerCase() || "";
  const format = fieldSchema.format?.toLowerCase() || "";

  if (key.includes("email") || format === "email") return "email";
  if (key.includes("phone") || key.includes("mobile") || key.includes("tel")) return "phone";
  if (key.includes("date") || format === "date" || format === "datetime") return "date";
  if (key.includes("url") || key.includes("link") || key.includes("website") || format === "uri") return "url";
  if (key.includes("name") && !key.includes("company")) return "name";
  if (key.includes("company") || key.includes("organization")) return "company";
  if (key.includes("json") || key.includes("payload") || key.includes("body")) return "json";
  if (key.includes("array") || key.includes("list") || key.includes("items")) return "array";
  if (key.includes("bool") || key.includes("active") || key.includes("enabled") || key.includes("is_")) return "boolean";
  if (key.includes("count") || key.includes("number") || key.includes("amount") || key.includes("qty") || type === "number" || type === "integer") return "number";
  if (key.includes("id") && key.length <= 5) return "id";

  return "text";
};

export const generateSampleValue = (fieldKey, fieldSchema = {}) => {
  const fieldType = inferFieldType(fieldKey, fieldSchema);

  switch (fieldType) {
    case "email":
      return generateRandomEmail();
    case "phone":
      return generateRandomPhone();
    case "date":
      return generateRandomDate();
    case "url":
      return generateRandomUrl();
    case "name":
      return generateRandomName();
    case "company":
      return generateRandomCompany();
    case "json":
      return generateRandomJson();
    case "array":
      return JSON.stringify(generateRandomArray());
    case "boolean":
      return generateRandomBoolean();
    case "number":
      return generateRandomNumber(1, 1000);
    case "id":
      return generateRandomNumber(1000, 9999).toString();
    case "text":
    default:
      return `Sample ${fieldKey.replace(/_/g, " ")}`;
  }
};

export const generateSampleDataForFields = (fields) => {
  if (!fields || !Array.isArray(fields)) return {};

  return fields.reduce((acc, field) => {
    const key = typeof field === "string" ? field : field.key || field.name || field.id;
    const schema = typeof field === "object" ? field : {};
    
    if (key) {
      acc[key] = generateSampleValue(key, schema);
    }
    return acc;
  }, {});
};

export const generateSampleDataFromSchema = (schema, fieldConfig = {}) => {
  if (!schema) return {};

  if (schema.keys && Array.isArray(schema.keys)) {
    const fields = schema.keys.map((key) => {
      const blockData = schema.blocks?.[key] || {};
      
      // Look up type from fieldConfig if available (more reliable source from table schema)
      // Try multiple key patterns since keys might be in different formats
      const configEntry = fieldConfig[key] || 
                         fieldConfig[key.replace(/^(data_|record_|field_)/, '')] ||
                         fieldConfig[key.match(/^(\d+)/)?.[1]];
      
      const resolvedType = configEntry?.type || blockData.type;
      
      return {
        key,
        type: resolvedType,
        format: blockData.format,
      };
    });
    return generateSampleDataForFields(fields);
  }

  if (schema.properties) {
    const fields = Object.entries(schema.properties).map(([key, value]) => {
      const configEntry = fieldConfig[key];
      const resolvedType = configEntry?.type || value.type;
      
      return {
        key,
        type: resolvedType,
        format: value.format,
      };
    });
    return generateSampleDataForFields(fields);
  }

  return {};
};

export const humanizeFieldName = (fieldKey) => {
  if (!fieldKey) return "";
  
  return fieldKey
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

export default {
  generateSampleValue,
  generateSampleDataForFields,
  generateSampleDataFromSchema,
  humanizeFieldName,
};
