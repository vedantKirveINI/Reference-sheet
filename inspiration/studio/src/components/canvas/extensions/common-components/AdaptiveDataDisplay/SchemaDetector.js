const ADDRESS_KEYS = ['street', 'address', 'address1', 'address2', 'addressLine1', 'addressLine2', 'streetAddress'];
const CITY_KEYS = ['city', 'town', 'locality'];
const STATE_KEYS = ['state', 'province', 'region', 'stateProvince'];
const ZIP_KEYS = ['zip', 'zipCode', 'postalCode', 'postcode', 'postal'];
const COUNTRY_KEYS = ['country', 'countryCode', 'nation'];

const CONNECTION_KEYS = ['host', 'hostname', 'server'];
const PORT_KEYS = ['port'];
const DATABASE_KEYS = ['database', 'db', 'databaseName', 'dbName'];
const USERNAME_KEYS = ['username', 'user', 'login'];

const normalizeKey = (key) => key?.toLowerCase()?.replace(/[_-]/g, '') || '';

const hasMatchingKeys = (data, targetKeys, minMatches = 1) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;
  const dataKeys = Object.keys(data).map(normalizeKey);
  const matches = targetKeys.filter(tk => dataKeys.some(dk => dk.includes(normalizeKey(tk))));
  return matches.length >= minMatches;
};

const countMatchingKeys = (data, keyGroups) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return 0;
  const dataKeys = Object.keys(data).map(normalizeKey);
  let count = 0;
  for (const group of keyGroups) {
    if (group.some(tk => dataKeys.some(dk => dk.includes(normalizeKey(tk))))) {
      count++;
    }
  }
  return count;
};

const findKeyValue = (data, targetKeys) => {
  if (typeof data !== 'object' || data === null) return null;
  for (const key of Object.keys(data)) {
    const normalizedKey = normalizeKey(key);
    if (targetKeys.some(tk => normalizedKey.includes(normalizeKey(tk)))) {
      return { key, value: data[key] };
    }
  }
  return null;
};

export const detectAddressSchema = (data) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  
  const addressKeyGroups = [ADDRESS_KEYS, CITY_KEYS, STATE_KEYS, ZIP_KEYS, COUNTRY_KEYS];
  const matchCount = countMatchingKeys(data, addressKeyGroups);
  
  if (matchCount < 2) return null;
  
  const street = findKeyValue(data, ADDRESS_KEYS);
  const city = findKeyValue(data, CITY_KEYS);
  const state = findKeyValue(data, STATE_KEYS);
  const zip = findKeyValue(data, ZIP_KEYS);
  const country = findKeyValue(data, COUNTRY_KEYS);
  
  const hasStreetOrCityWithOther = (street?.value || city?.value) && matchCount >= 2;
  
  if (!hasStreetOrCityWithOther) return null;
  
  const matchedKeys = new Set();
  [street, city, state, zip, country].forEach(match => {
    if (match?.key) matchedKeys.add(match.key);
  });
  
  const remainingFields = {};
  for (const [key, value] of Object.entries(data)) {
    if (!matchedKeys.has(key)) {
      remainingFields[key] = value;
    }
  }
  
  return {
    type: 'address',
    fields: {
      street: street?.value,
      city: city?.value,
      state: state?.value,
      zip: zip?.value,
      country: country?.value,
    },
    remainingFields,
    originalData: data,
  };
};

export const detectConnectionSchema = (data) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  
  const connectionKeyGroups = [CONNECTION_KEYS, PORT_KEYS, DATABASE_KEYS, USERNAME_KEYS];
  const matchCount = countMatchingKeys(data, connectionKeyGroups);
  
  if (matchCount < 2) return null;
  
  const host = findKeyValue(data, CONNECTION_KEYS);
  const port = findKeyValue(data, PORT_KEYS);
  const database = findKeyValue(data, DATABASE_KEYS);
  const username = findKeyValue(data, USERNAME_KEYS);
  
  const hasHostWithOther = host?.value && (port?.value !== undefined || database?.value);
  const hasDbWithPort = database?.value && port?.value !== undefined;
  
  if (!hasHostWithOther && !hasDbWithPort) return null;
  
  const matchedKeys = new Set();
  [host, port, database, username].forEach(match => {
    if (match?.key) matchedKeys.add(match.key);
  });
  
  const remainingFields = {};
  for (const [key, value] of Object.entries(data)) {
    if (!matchedKeys.has(key)) {
      remainingFields[key] = value;
    }
  }
  
  return {
    type: 'connection',
    fields: {
      host: host?.value,
      port: port?.value,
      database: database?.value,
      username: username?.value,
    },
    remainingFields,
    originalData: data,
  };
};

export const detectCredentialsSchema = (data) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  
  const sensitiveKeys = ['password', 'secret', 'apikey', 'apisecret', 'accesstoken', 'refreshtoken', 'privatekey', 'secretkey'];
  const identifierKeys = ['username', 'user', 'email', 'login', 'account', 'clientid'];
  
  const hasSensitive = hasMatchingKeys(data, sensitiveKeys);
  const hasIdentifier = hasMatchingKeys(data, identifierKeys);
  
  if (!hasSensitive) return null;
  if (!hasIdentifier && Object.keys(data).length > 5) return null;
  
  const sensitiveFields = {};
  const regularFields = {};
  const remainingFields = {};
  
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = normalizeKey(key);
    const isSensitive = sensitiveKeys.some(sk => normalizedKey.includes(normalizeKey(sk)));
    const isIdentifier = identifierKeys.some(ik => normalizedKey.includes(normalizeKey(ik)));
    
    if (isSensitive) {
      sensitiveFields[key] = value;
    } else if (isIdentifier || typeof value !== 'object') {
      regularFields[key] = value;
    } else {
      remainingFields[key] = value;
    }
  }
  
  return {
    type: 'credentials',
    fields: {
      sensitive: sensitiveFields,
      regular: regularFields,
    },
    remainingFields,
    originalData: data,
  };
};

export const detectSchema = (data) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { type: 'primitive', data };
  }
  
  const addressSchema = detectAddressSchema(data);
  if (addressSchema) return addressSchema;
  
  const connectionSchema = detectConnectionSchema(data);
  if (connectionSchema) return connectionSchema;
  
  const credentialsSchema = detectCredentialsSchema(data);
  if (credentialsSchema) return credentialsSchema;
  
  return { type: 'generic', data };
};

export const detectNestedSchemas = (data, parentKey = '') => {
  const results = [];
  
  if (typeof data !== 'object' || data === null) {
    return results;
  }
  
  for (const [key, value] of Object.entries(data)) {
    const fullPath = parentKey ? `${parentKey}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const schema = detectSchema(value);
      if (schema.type !== 'generic') {
        results.push({
          path: fullPath,
          key,
          schema,
        });
      } else {
        results.push(...detectNestedSchemas(value, fullPath));
      }
    }
  }
  
  return results;
};
