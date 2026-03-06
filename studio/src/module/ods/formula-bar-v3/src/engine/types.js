export const TypeKind = {
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  DATE: 'date',
  ARRAY: 'array',
  OBJECT: 'object',
  ANY: 'any',
  NULL: 'null',
  VOID: 'void',
};

export const createType = (kind, nullable = false, elementType = null) => ({
  kind,
  nullable,
  elementType,
});

export const TYPE_NUMBER = createType(TypeKind.NUMBER);
export const TYPE_STRING = createType(TypeKind.STRING);
export const TYPE_BOOLEAN = createType(TypeKind.BOOLEAN);
export const TYPE_DATE = createType(TypeKind.DATE);
export const TYPE_ANY = createType(TypeKind.ANY);
export const TYPE_NULL = createType(TypeKind.NULL, true);
export const TYPE_VOID = createType(TypeKind.VOID);

export const createNullableType = (kind) => createType(kind, true);

export const typeToString = (type) => {
  if (!type) return 'unknown';
  const base = type.kind || 'unknown';
  if (type.elementType) {
    return `${base}<${typeToString(type.elementType)}>${type.nullable ? '?' : ''}`;
  }
  return type.nullable ? `${base}?` : base;
};

export const parseTypeFromRegistry = (typeStr) => {
  if (!typeStr) return TYPE_ANY;
  const nullable = typeStr.includes('?') || typeStr.includes('null');
  const cleanType = typeStr.replace('?', '').replace(/\s*\|\s*null/i, '').toLowerCase();
  
  switch (cleanType) {
    case 'number':
      return createType(TypeKind.NUMBER, nullable);
    case 'string':
    case 'text':
      return createType(TypeKind.STRING, nullable);
    case 'boolean':
    case 'bool':
      return createType(TypeKind.BOOLEAN, nullable);
    case 'date':
    case 'datetime':
      return createType(TypeKind.DATE, nullable);
    case 'array':
      return createType(TypeKind.ARRAY, nullable);
    case 'object':
      return createType(TypeKind.OBJECT, nullable);
    default:
      return createType(TypeKind.ANY, nullable);
  }
};

export const isTypeCompatible = (expected, actual) => {
  if (!expected || !actual) return true;
  if (expected.kind === TypeKind.ANY || actual.kind === TypeKind.ANY) return true;
  if (expected.nullable && actual.kind === TypeKind.NULL) return true;
  return expected.kind === actual.kind;
};

export const mergeTypes = (type1, type2) => {
  if (!type1) return type2;
  if (!type2) return type1;
  if (type1.kind === type2.kind) {
    return createType(type1.kind, type1.nullable || type2.nullable, type1.elementType || type2.elementType);
  }
  return TYPE_ANY;
};
