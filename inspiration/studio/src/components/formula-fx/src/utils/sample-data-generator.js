const SAMPLE_NAMES = [
  "John Smith", "Emma Wilson", "Michael Chen", "Sarah Johnson", 
  "David Brown", "Lisa Garcia", "James Taylor", "Emily Davis"
];

const SAMPLE_EMAILS = [
  "john.smith@example.com", "emma.wilson@company.org", 
  "m.chen@business.net", "sarah.j@email.com"
];

const SAMPLE_COMPANIES = [
  "Acme Corp", "TechFlow Inc", "Global Solutions", "Innovate Labs"
];

const SAMPLE_PRODUCTS = [
  "Premium Widget", "Standard Package", "Enterprise Suite", "Starter Kit"
];

const SAMPLE_CITIES = [
  "New York", "San Francisco", "London", "Tokyo", "Sydney", "Berlin"
];

export function generateSampleValue(variableData, variableName = "") {
  if (!variableData) {
    return inferSampleFromName(variableName);
  }

  const realData = variableData.sample_value ?? variableData.default;
  if (realData !== undefined && realData !== null && realData !== "") {
    return realData;
  }

  const type = (variableData.type || variableData.valueType || "").toLowerCase();

  if (type === "array" || type === "list") {
    return generateArrayFromSchema(variableData);
  }

  if (type === "object" || type === "json" || type === "record") {
    return generateObjectFromVariableData(variableData);
  }

  const name = (variableName || variableData.name || variableData.key || "").toLowerCase();

  if (name) {
    const nameBasedValue = inferSampleFromName(name, type || "string");
    if (nameBasedValue !== null) {
      return nameBasedValue;
    }
  }

  if (type) {
    return generateByType(type, variableData);
  }

  if (Array.isArray(variableData.schema) && variableData.schema.length > 0) {
    return generateObjectFromSchemaArray(variableData.schema);
  }

  return inferSampleFromName(variableName) || "Sample value";
}

function generateArrayFromSchema(variableData) {
  const schema = variableData.schema;

  if (Array.isArray(schema) && schema.length > 0) {
    const firstChild = schema[0];

    if (firstChild?.type === "object" && Array.isArray(firstChild.schema) && firstChild.schema.length > 0) {
      return [
        generateObjectFromSchemaArray(firstChild.schema),
        generateObjectFromSchemaArray(firstChild.schema),
        generateObjectFromSchemaArray(firstChild.schema),
      ];
    }

    if (firstChild?.type === "array") {
      return [
        generateArrayFromSchema(firstChild),
        generateArrayFromSchema(firstChild),
      ];
    }

    if (schema.length > 1 || (firstChild?.key && firstChild?.type !== "array")) {
      return [
        generateObjectFromSchemaArray(schema),
        generateObjectFromSchemaArray(schema),
        generateObjectFromSchemaArray(schema),
      ];
    }

    const itemType = firstChild?.type || variableData.itemType || "string";
    return [
      generateByType(itemType),
      generateByType(itemType),
      generateByType(itemType),
    ];
  }

  const itemType = variableData.itemType || variableData.items?.type || "string";
  return [
    generateByType(itemType),
    generateByType(itemType),
    generateByType(itemType),
  ];
}

function generateObjectFromVariableData(variableData) {
  if (Array.isArray(variableData.schema) && variableData.schema.length > 0) {
    return generateObjectFromSchemaArray(variableData.schema);
  }

  if (variableData.properties) {
    return generateObjectFromProperties(variableData.properties);
  }

  return {
    id: generateShortId(),
    name: pickRandom(SAMPLE_NAMES),
    value: randomInt(1, 100),
  };
}

function generateObjectFromSchemaArray(schemaArray) {
  const result = {};
  for (const field of schemaArray) {
    if (!field || !field.key) continue;
    const fieldName = field.label || field.key;
    const fieldType = (field.type || "string").toLowerCase();

    const realData = field.default ?? field.sample_value;
    if (realData !== undefined && realData !== null && realData !== "") {
      result[fieldName] = realData;
      continue;
    }

    if (fieldType === "object" && Array.isArray(field.schema) && field.schema.length > 0) {
      result[fieldName] = generateObjectFromSchemaArray(field.schema);
      continue;
    }
    if (fieldType === "array") {
      result[fieldName] = generateArrayFromSchema(field);
      continue;
    }

    const nameInferred = inferSampleFromName(fieldName, fieldType);
    if (nameInferred !== null) {
      result[fieldName] = nameInferred;
    } else {
      result[fieldName] = generateByType(fieldType, field);
    }
  }
  return result;
}

function inferSampleFromName(name, type = "string") {
  if (!name) return null;
  const nameLower = name.toLowerCase();

  if (nameLower.includes("email") || nameLower.includes("mail")) {
    return pickRandom(SAMPLE_EMAILS);
  }
  if (nameLower.includes("name") && !nameLower.includes("company") && !nameLower.includes("product")) {
    if (nameLower.includes("first")) return pickRandom(SAMPLE_NAMES).split(" ")[0];
    if (nameLower.includes("last")) return pickRandom(SAMPLE_NAMES).split(" ")[1];
    return pickRandom(SAMPLE_NAMES);
  }
  if (nameLower.includes("company") || nameLower.includes("organization") || nameLower.includes("org")) {
    return pickRandom(SAMPLE_COMPANIES);
  }
  if (nameLower.includes("product") || nameLower.includes("item")) {
    return pickRandom(SAMPLE_PRODUCTS);
  }
  if (nameLower.includes("city") || nameLower.includes("location")) {
    return pickRandom(SAMPLE_CITIES);
  }
  if (nameLower.includes("phone") || nameLower.includes("tel")) {
    return "+1 (555) " + randomInt(100, 999) + "-" + randomInt(1000, 9999);
  }
  if (nameLower.includes("address")) {
    return randomInt(100, 9999) + " " + pickRandom(["Main St", "Oak Ave", "Park Blvd", "First St"]);
  }
  if (nameLower.includes("zip") || nameLower.includes("postal")) {
    return String(randomInt(10000, 99999));
  }
  if (nameLower.includes("country")) {
    return pickRandom(["United States", "United Kingdom", "Canada", "Australia", "Germany"]);
  }
  if (nameLower.includes("subject")) {
    return pickRandom(["Meeting scheduled for tomorrow", "Summary of our call", "Project update: Q4 results", "Invoice #" + randomInt(1000, 9999)]);
  }
  if (nameLower.includes("from") && (nameLower.includes("email") || nameLower.length <= 10)) {
    return pickRandom(SAMPLE_EMAILS);
  }
  if (nameLower.includes("to") && nameLower.length <= 6) {
    return pickRandom(SAMPLE_EMAILS);
  }
  if (nameLower.includes("body") || nameLower.includes("content") || nameLower.includes("message") || nameLower.includes("text")) {
    return "Hi there, I wanted to follow up on our previous conversation about the project timeline. Could we schedule a call this week to discuss next steps?";
  }
  if (nameLower.includes("title") || nameLower.includes("heading") || nameLower.includes("header")) {
    return pickRandom(["Quarterly Business Review", "Product Launch Plan", "Team Meeting Notes", "Customer Feedback Summary"]);
  }
  if (nameLower.includes("price") || nameLower.includes("amount") || nameLower.includes("cost") || nameLower.includes("total")) {
    return parseFloat((Math.random() * 500 + 10).toFixed(2));
  }
  if (nameLower.includes("quantity") || nameLower.includes("qty") || nameLower.includes("count")) {
    return randomInt(1, 100);
  }
  if (nameLower.includes("percent") || nameLower.includes("rate")) {
    return randomInt(1, 100);
  }
  if (nameLower.includes("age")) {
    return randomInt(18, 65);
  }
  if (nameLower.includes("year")) {
    return randomInt(2020, 2026);
  }
  if (nameLower.includes("month")) {
    return randomInt(1, 12);
  }
  if (nameLower.includes("day")) {
    return randomInt(1, 28);
  }
  if (nameLower.includes("date") || nameLower.includes("created") || nameLower.includes("updated")) {
    return generateSampleDate();
  }
  if (nameLower.includes("time") || nameLower.includes("timestamp")) {
    return new Date().toISOString();
  }
  if (nameLower.includes("id") || nameLower.includes("uuid")) {
    return generateShortId();
  }
  if (nameLower.includes("url") || nameLower.includes("link") || nameLower.includes("website")) {
    return "https://example.com/" + generateShortId();
  }
  if (nameLower.includes("description") || nameLower.includes("note") || nameLower.includes("comment")) {
    return "Sample description text for testing purposes.";
  }
  if (nameLower.includes("status")) {
    return pickRandom(["Active", "Pending", "Completed", "Draft"]);
  }
  if (nameLower.includes("label") || nameLower.includes("tag") || nameLower.includes("category")) {
    return pickRandom(["Important", "Urgent", "Follow-up", "Review", "Archive"]);
  }
  if (nameLower.includes("active") || nameLower.includes("enabled") || nameLower.includes("verified") || nameLower.includes("confirmed")) {
    return true;
  }
  if (nameLower.includes("disabled") || nameLower.includes("deleted") || nameLower.includes("archived")) {
    return false;
  }

  return null;
}

function generateByType(type, variableData = {}) {
  switch (type) {
    case "string":
    case "text":
    case "html":
    case "xml":
      return "Sample text";

    case "number":
    case "float":
    case "double":
    case "decimal":
      return parseFloat((Math.random() * 1000).toFixed(2));

    case "int":
    case "integer":
      return randomInt(1, 1000);

    case "boolean":
    case "bool":
      return Math.random() > 0.5;

    case "date":
    case "datetime":
      return generateSampleDate();

    case "array":
    case "list":
      return generateArrayFromSchema(variableData);

    case "object":
    case "json":
    case "record":
      return generateObjectFromVariableData(variableData);

    default:
      return "Sample value";
  }
}

function generateObjectFromProperties(properties) {
  const result = {};
  for (const [key, config] of Object.entries(properties)) {
    const type = (config.type || "string").toLowerCase();
    result[key] = generateSampleValue(config, key);
  }
  return result;
}

function generateSampleDate() {
  const now = new Date();
  const randomDays = randomInt(-30, 30);
  const date = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

function generateShortId() {
  return Math.random().toString(36).substring(2, 10);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSampleDataForBlocks(blocks) {
  const sampleData = {};

  for (const block of blocks) {
    if (!block) continue;

    const isVariable = 
      block.type === "NODE" || 
      block.subCategory === "NODE" ||
      block.subCategory === "LOCAL" ||
      block.subCategory === "GLOBAL" ||
      block.variableData;

    if (isVariable) {
      const key = block.value || block.displayValue || block.name;
      if (key && !sampleData[key]) {
        const variableData = block.variableData || {};
        const name = block.name || block.displayValue || block.value || "";
        sampleData[key] = generateSampleValue(variableData, name);
      }
    }
  }

  return sampleData;
}

export function evaluateWithSampleData(blocks, sampleData = {}) {
  if (!blocks || blocks.length === 0) {
    return { success: false, value: null, error: "No formula content" };
  }

  const evaluatedBlocks = blocks.map(block => {
    if (!block) return block;

    const isVariable = 
      block.type === "NODE" || 
      block.subCategory === "NODE" ||
      block.subCategory === "LOCAL" ||
      block.subCategory === "GLOBAL" ||
      block.variableData;

    if (isVariable) {
      const key = block.value || block.displayValue || block.name;
      if (key && sampleData[key] !== undefined) {
        return {
          ...block,
          sampleValue: sampleData[key],
        };
      }
    }

    return block;
  });

  return { blocks: evaluatedBlocks, sampleData };
}

export default {
  generateSampleValue,
  generateSampleDataForBlocks,
  evaluateWithSampleData,
};
