#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci0wMDEiLCJ1c2VyX2lkIjoiZGV2LXVzZXItMDAxIiwibmFtZSI6IkRldiBVc2VyIiwiZW1haWwiOiJkZXZAdGlueXRhYmxlLmFwcCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTc4NDI5MiwiZXhwIjoxODAzMzIwMjkyfQ.Y7H8RDYfvzJbPW5yzXIihSVTw4Rl-rWaBfjKQGDc8MA';

let fieldOrderCounter = {};

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname, port: url.port,
      path: url.pathname + url.search, method,
      headers: { 'Content-Type': 'application/json', 'token': TOKEN },
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = http.request(options, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createField(baseId, tableId, viewId, name, type, options, expression) {
  const key = tableId;
  if (!fieldOrderCounter[key]) fieldOrderCounter[key] = 1;
  const order = fieldOrderCounter[key]++;
  const payload = { baseId, tableId, viewId, name, type, order };
  if (options) payload.options = options;
  if (expression) payload.expression = expression;
  const res = await request('POST', '/field/create_field', payload);
  if (res.id) {
    console.log(`  + Field: ${name} (${type}) id=${res.id} dbFieldType=${res.dbFieldType}`);
    return res;
  } else {
    console.log(`  X Field "${name}" (${type}) FAILED:`, JSON.stringify(res).slice(0, 300));
    return null;
  }
}

async function createRecordAndUpdate(baseId, tableId, viewId, fieldMap, values) {
  const recRes = await request('POST', '/record/create_record', { baseId, tableId, viewId });
  const rec = Array.isArray(recRes) ? recRes[0] : recRes;
  const recId = rec?.__id;
  if (!recId) {
    console.log(`  X Record creation failed:`, JSON.stringify(recRes).slice(0, 200));
    return null;
  }

  const fieldsInfo = [];
  for (const [fieldName, value] of Object.entries(values)) {
    const field = fieldMap[fieldName];
    if (!field || !field.id || value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    fieldsInfo.push({ field_id: field.id, data: value });
  }

  if (fieldsInfo.length > 0) {
    const updateRes = await request('POST', '/record/update_record', {
      baseId, tableId, viewId,
      column_values: [{ row_id: recId, fields_info: fieldsInfo }],
    });
    if (updateRes?.statusCode && updateRes.statusCode >= 400) {
      console.log(`  X Update record ${recId} failed:`, JSON.stringify(updateRes).slice(0, 300));
    }
  }

  return recId;
}

async function main() {
  console.log('='.repeat(60));
  console.log('TINYTable - All Field Types Seed Script');
  console.log('='.repeat(60));
  console.log('');

  const seedResult = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seed-result.json'), 'utf8'));
  const baseId = seedResult.baseId;
  console.log(`Using existing base: ${baseId}`);

  console.log('\n1. Creating "All Field Types" table...');
  const tableRes = await request('POST', '/table/create_table', {
    baseId,
    name: `Field Types ${Date.now()}`,
  });

  const sheetData = await request('POST', '/sheet/get_sheet', {
    baseId, include_views: true, include_tables: true,
  });

  const allTables = sheetData.tables || [];
  const newTable = allTables[allTables.length - 1];
  if (!newTable) {
    console.error('Failed to find "All Field Types" table');
    process.exit(1);
  }

  const tableId = newTable.id;
  const viewId = newTable.views?.[0]?.id;
  console.log(`  Table: id=${tableId}, view=${viewId}`);

  const existingFields = await request('GET', `/field/getFields?tableId=${tableId}`);
  const nameField = Array.isArray(existingFields) ? existingFields[0] : null;
  console.log(`  Name field (PRIMARY): id=${nameField?.id} type=${nameField?.type}`);

  console.log('\n2. Creating all field types...');
  const fieldMap = { Name: nameField };

  fieldMap['Long Text'] = await createField(baseId, tableId, viewId,
    'Long Text', 'LONG_TEXT');

  fieldMap['Number'] = await createField(baseId, tableId, viewId,
    'Number', 'NUMBER', { allowNegative: true, allowFraction: true });

  fieldMap['Email'] = await createField(baseId, tableId, viewId,
    'Email', 'EMAIL');

  fieldMap['Phone'] = await createField(baseId, tableId, viewId,
    'Phone', 'PHONE_NUMBER');

  fieldMap['Currency'] = await createField(baseId, tableId, viewId,
    'Currency', 'CURRENCY', { symbol: '$', precision: 2 });

  fieldMap['Checkbox'] = await createField(baseId, tableId, viewId,
    'Checkbox', 'CHECKBOX');

  fieldMap['Single Select'] = await createField(baseId, tableId, viewId,
    'Single Select', 'SCQ', {
      choices: [
        { name: 'Option A', color: '#6366f1' },
        { name: 'Option B', color: '#f59e0b' },
        { name: 'Option C', color: '#22c55e' },
        { name: 'Option D', color: '#ef4444' },
        { name: 'Option E', color: '#3b82f6' },
      ],
    });

  fieldMap['Multi Select'] = await createField(baseId, tableId, viewId,
    'Multi Select', 'MCQ', {
      choices: [
        { name: 'Red', color: '#ef4444' },
        { name: 'Blue', color: '#3b82f6' },
        { name: 'Green', color: '#22c55e' },
        { name: 'Yellow', color: '#f59e0b' },
        { name: 'Purple', color: '#a855f7' },
        { name: 'Orange', color: '#f97316' },
      ],
    });

  fieldMap['Date'] = await createField(baseId, tableId, viewId,
    'Date', 'DATE');

  fieldMap['Time'] = await createField(baseId, tableId, viewId,
    'Time', 'TIME');

  fieldMap['Rating'] = await createField(baseId, tableId, viewId,
    'Rating', 'RATING', { maxRating: 5, icon: 'star', color: '#f59e0b' });

  fieldMap['Slider'] = await createField(baseId, tableId, viewId,
    'Slider', 'SLIDER', { minValue: 0, maxValue: 100 });

  fieldMap['Opinion Scale'] = await createField(baseId, tableId, viewId,
    'Opinion Scale', 'OPINION_SCALE', { maxValue: 10 });

  fieldMap['Yes/No'] = await createField(baseId, tableId, viewId,
    'Yes/No', 'YES_NO');

  fieldMap['Zip Code'] = await createField(baseId, tableId, viewId,
    'Zip Code', 'ZIP_CODE');

  fieldMap['Address'] = await createField(baseId, tableId, viewId,
    'Address', 'ADDRESS');

  fieldMap['Dropdown'] = await createField(baseId, tableId, viewId,
    'Dropdown', 'DROP_DOWN', {
      options: [
        { id: '1', label: 'Small' },
        { id: '2', label: 'Medium' },
        { id: '3', label: 'Large' },
        { id: '4', label: 'Extra Large' },
      ],
    });

  fieldMap['List'] = await createField(baseId, tableId, viewId,
    'List', 'LIST');

  fieldMap['Ranking'] = await createField(baseId, tableId, viewId,
    'Ranking', 'RANKING', {
      options: [
        { label: 'First' },
        { label: 'Second' },
        { label: 'Third' },
      ],
    });

  fieldMap['Signature'] = await createField(baseId, tableId, viewId,
    'Signature', 'SIGNATURE');

  fieldMap['Created Time'] = await createField(baseId, tableId, viewId,
    'Created Time', 'CREATED_TIME', { dateFormat: 'YYYY-MM-DD HH:mm', includeTime: true });

  fieldMap['Created By'] = await createField(baseId, tableId, viewId,
    'Created By', 'CREATED_BY');

  fieldMap['Last Modified Time'] = await createField(baseId, tableId, viewId,
    'Last Modified Time', 'LAST_MODIFIED_TIME', { dateFormat: 'YYYY-MM-DD HH:mm', includeTime: true });

  fieldMap['Last Modified By'] = await createField(baseId, tableId, viewId,
    'Last Modified By', 'LAST_MODIFIED_BY');

  fieldMap['Auto Number'] = await createField(baseId, tableId, viewId,
    'Auto Number', 'AUTO_NUMBER');

  fieldMap['Button'] = await createField(baseId, tableId, viewId,
    'Button', 'BUTTON', { label: 'Click Me', color: '#39A380' });

  const failedFields = Object.entries(fieldMap).filter(([k, v]) => !v);
  if (failedFields.length > 0) {
    console.log(`\n  WARNING: ${failedFields.length} field(s) failed to create: ${failedFields.map(f => f[0]).join(', ')}`);
  }

  const successCount = Object.values(fieldMap).filter(Boolean).length;
  console.log(`\n  Created ${successCount} fields total (including Name)`);

  console.log('\n3. Populating records with sample data...');
  const records = [
    {
      'Name': 'Alice Johnson',
      'Long Text': 'Alice is a senior software engineer with 10 years of experience in full-stack development. She specializes in React, Node.js, and cloud architecture. Currently leading the platform migration project.',
      'Number': 42.5,
      'Email': 'alice.johnson@example.com',
      'Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5551234567' },
      'Currency': { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: 125000.50 },
      'Checkbox': true,
      'Single Select': 'Option A',
      'Multi Select': ['Red', 'Blue', 'Green'],
      'Date': '2026-01-15',
      'Time': { time: '09:30', meridiem: 'AM', ISOValue: '09:30:00' },
      'Rating': 5,
      'Slider': 85,
      'Opinion Scale': 9,
      'Yes/No': 'Yes',
      'Zip Code': { countryCode: 'US', zipCode: '94105' },
      'Address': { fullName: 'Alice Johnson', addressLineOne: '123 Market Street', addressLineTwo: 'Suite 400', city: 'San Francisco', state: 'California', country: 'United States', zipCode: '94105' },
      'Dropdown': [{ id: '2', label: 'Medium' }],
      'List': ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      'Ranking': [{ id: '1', rank: 1, label: 'First' }, { id: '2', rank: 2, label: 'Second' }, { id: '3', rank: 3, label: 'Third' }],
      'Signature': 'https://placehold.co/200x80/39A380/white?text=A.Johnson',
    },
    {
      'Name': 'Bob Chen',
      'Long Text': 'Bob is a product manager focused on data-driven decision making. He has launched 5 major products in the last 3 years and is passionate about user experience and growth metrics.',
      'Number': -17.8,
      'Email': 'bob.chen@example.com',
      'Phone': { countryCode: 'GB', countryNumber: '+44', phoneNumber: '7700900123' },
      'Currency': { countryCode: 'GB', currencyCode: 'GBP', currencySymbol: '£', currencyValue: 95000 },
      'Checkbox': false,
      'Single Select': 'Option B',
      'Multi Select': ['Yellow', 'Purple'],
      'Date': '2025-11-20',
      'Time': { time: '02:15', meridiem: 'PM', ISOValue: '14:15:00' },
      'Rating': 4,
      'Slider': 62,
      'Opinion Scale': 7,
      'Yes/No': 'No',
      'Zip Code': { countryCode: 'GB', zipCode: 'SW1A 1AA' },
      'Address': { fullName: 'Bob Chen', addressLineOne: '10 Downing Street', addressLineTwo: '', city: 'London', state: 'England', country: 'United Kingdom', zipCode: 'SW1A 1AA' },
      'Dropdown': [{ id: '3', label: 'Large' }],
      'List': ['Python', 'SQL', 'Tableau'],
      'Ranking': [{ id: '2', rank: 1, label: 'Second' }, { id: '1', rank: 2, label: 'First' }, { id: '3', rank: 3, label: 'Third' }],
      'Signature': 'https://placehold.co/200x80/3b82f6/white?text=B.Chen',
    },
    {
      'Name': 'Carla Mendez',
      'Long Text': 'Carla is a UX designer who bridges the gap between design and engineering. She runs design sprints, creates prototypes in Figma, and conducts user research studies regularly.',
      'Number': 0,
      'Email': 'carla.mendez@example.com',
      'Phone': { countryCode: 'ES', countryNumber: '+34', phoneNumber: '612345678' },
      'Currency': { countryCode: 'EU', currencyCode: 'EUR', currencySymbol: '€', currencyValue: 78500 },
      'Checkbox': true,
      'Single Select': 'Option C',
      'Multi Select': ['Red', 'Orange'],
      'Date': '2026-03-08',
      'Time': { time: '11:00', meridiem: 'AM', ISOValue: '11:00:00' },
      'Rating': 3,
      'Slider': 45,
      'Opinion Scale': 5,
      'Yes/No': 'Yes',
      'Zip Code': { countryCode: 'ES', zipCode: '28001' },
      'Address': { fullName: 'Carla Mendez', addressLineOne: 'Calle Gran Via 28', addressLineTwo: 'Piso 3', city: 'Madrid', state: 'Madrid', country: 'Spain', zipCode: '28001' },
      'Dropdown': [{ id: '1', label: 'Small' }],
      'List': ['Figma', 'Sketch', 'Adobe XD'],
      'Ranking': [{ id: '3', rank: 1, label: 'Third' }, { id: '2', rank: 2, label: 'Second' }, { id: '1', rank: 3, label: 'First' }],
      'Signature': 'https://placehold.co/200x80/a855f7/white?text=C.Mendez',
    },
    {
      'Name': 'David Park',
      'Long Text': 'David is a DevOps engineer specializing in Kubernetes, CI/CD pipelines, and cloud infrastructure. He manages deployments across AWS and GCP for 50+ microservices.',
      'Number': 1234567.89,
      'Email': 'david.park@example.com',
      'Phone': { countryCode: 'KR', countryNumber: '+82', phoneNumber: '1012345678' },
      'Currency': { countryCode: 'JP', currencyCode: 'JPY', currencySymbol: '¥', currencyValue: 9500000 },
      'Checkbox': true,
      'Single Select': 'Option D',
      'Multi Select': ['Blue', 'Green', 'Purple'],
      'Date': '2026-06-21',
      'Time': { time: '06:45', meridiem: 'PM', ISOValue: '18:45:00' },
      'Rating': 5,
      'Slider': 98,
      'Opinion Scale': 10,
      'Yes/No': 'Yes',
      'Zip Code': { countryCode: 'KR', zipCode: '06164' },
      'Address': { fullName: 'David Park', addressLineOne: '123 Gangnam-daero', addressLineTwo: '', city: 'Seoul', state: 'Seoul', country: 'South Korea', zipCode: '06164' },
      'Dropdown': [{ id: '4', label: 'Extra Large' }],
      'List': ['Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Prometheus'],
      'Ranking': [{ id: '1', rank: 1, label: 'First' }, { id: '3', rank: 2, label: 'Third' }, { id: '2', rank: 3, label: 'Second' }],
      'Signature': 'https://placehold.co/200x80/ef4444/white?text=D.Park',
    },
    {
      'Name': 'Emma Wilson',
      'Long Text': 'Emma is a data scientist with expertise in NLP and computer vision. She has published 3 research papers and leads the ML team that builds recommendation algorithms.',
      'Number': -0.001,
      'Email': 'emma.wilson@example.com',
      'Phone': { countryCode: 'AU', countryNumber: '+61', phoneNumber: '412345678' },
      'Currency': { countryCode: 'AU', currencyCode: 'AUD', currencySymbol: 'A$', currencyValue: 142000.75 },
      'Checkbox': false,
      'Single Select': 'Option E',
      'Multi Select': ['Green', 'Yellow', 'Orange'],
      'Date': '2025-09-01',
      'Time': { time: '12:00', meridiem: 'PM', ISOValue: '12:00:00' },
      'Rating': 4,
      'Slider': 72,
      'Opinion Scale': 8,
      'Yes/No': 'No',
      'Zip Code': { countryCode: 'AU', zipCode: '2000' },
      'Address': { fullName: 'Emma Wilson', addressLineOne: '1 Circular Quay', addressLineTwo: 'Level 20', city: 'Sydney', state: 'New South Wales', country: 'Australia', zipCode: '2000' },
      'Dropdown': [{ id: '2', label: 'Medium' }],
      'List': ['Python', 'TensorFlow', 'PyTorch', 'Pandas'],
      'Ranking': [{ id: '2', rank: 1, label: 'Second' }, { id: '3', rank: 2, label: 'Third' }, { id: '1', rank: 3, label: 'First' }],
      'Signature': 'https://placehold.co/200x80/f59e0b/white?text=E.Wilson',
    },
    {
      'Name': 'Frank Torres',
      'Long Text': 'Frank is a mobile developer who builds cross-platform apps with React Native and Flutter. He focuses on performance optimization and has published 12 apps on both app stores.',
      'Number': 99,
      'Email': 'frank.torres@example.com',
      'Phone': { countryCode: 'MX', countryNumber: '+52', phoneNumber: '5512345678' },
      'Currency': { countryCode: 'MX', currencyCode: 'MXN', currencySymbol: 'MX$', currencyValue: 850000 },
      'Checkbox': true,
      'Single Select': 'Option A',
      'Multi Select': ['Red', 'Purple'],
      'Date': '2026-02-14',
      'Time': { time: '08:00', meridiem: 'AM', ISOValue: '08:00:00' },
      'Rating': 2,
      'Slider': 33,
      'Opinion Scale': 4,
      'Yes/No': 'Other',
      'Zip Code': { countryCode: 'MX', zipCode: '06600' },
      'Address': { fullName: 'Frank Torres', addressLineOne: 'Av. Reforma 222', addressLineTwo: 'Col. Juarez', city: 'Mexico City', state: 'CDMX', country: 'Mexico', zipCode: '06600' },
      'Dropdown': [{ id: '1', label: 'Small' }],
      'List': ['React Native', 'Flutter', 'Swift'],
      'Ranking': [{ id: '3', rank: 1, label: 'Third' }, { id: '1', rank: 2, label: 'First' }, { id: '2', rank: 3, label: 'Second' }],
      'Signature': 'https://placehold.co/200x80/06b6d4/white?text=F.Torres',
    },
    {
      'Name': 'Grace Kim',
      'Long Text': 'Grace is a security engineer who conducts penetration testing, builds threat models, and implements zero-trust architectures. She holds CISSP and CEH certifications.',
      'Number': 3.14159,
      'Email': 'grace.kim@example.com',
      'Phone': { countryCode: 'CA', countryNumber: '+1', phoneNumber: '6041234567' },
      'Currency': { countryCode: 'CA', currencyCode: 'CAD', currencySymbol: 'CA$', currencyValue: 115000 },
      'Checkbox': false,
      'Single Select': 'Option B',
      'Multi Select': ['Blue'],
      'Date': '2026-12-25',
      'Time': { time: '11:59', meridiem: 'PM', ISOValue: '23:59:00' },
      'Rating': 1,
      'Slider': 10,
      'Opinion Scale': 2,
      'Yes/No': 'No',
      'Zip Code': { countryCode: 'CA', zipCode: 'V6B 1A1' },
      'Address': { fullName: 'Grace Kim', addressLineOne: '200 Burrard Street', addressLineTwo: '', city: 'Vancouver', state: 'British Columbia', country: 'Canada', zipCode: 'V6B 1A1' },
      'Dropdown': [{ id: '3', label: 'Large' }],
      'List': ['Burp Suite', 'Wireshark', 'Metasploit'],
      'Ranking': [{ id: '1', rank: 1, label: 'First' }, { id: '2', rank: 2, label: 'Second' }, { id: '3', rank: 3, label: 'Third' }],
      'Signature': 'https://placehold.co/200x80/ec4899/white?text=G.Kim',
    },
    {
      'Name': 'Hiroshi Tanaka',
      'Long Text': '',
      'Number': null,
      'Email': '',
      'Checkbox': false,
      'Single Select': null,
      'Multi Select': [],
      'Date': null,
      'Rating': null,
      'Slider': null,
      'Yes/No': null,
    },
  ];

  const recordIds = [];
  for (let i = 0; i < records.length; i++) {
    const recId = await createRecordAndUpdate(baseId, tableId, viewId, fieldMap, records[i]);
    if (recId) {
      recordIds.push(recId);
      console.log(`  + Record ${i + 1}: "${records[i].Name}" (id=${recId})`);
    }
  }

  console.log('\n4. Adding comments to some records...');
  if (recordIds[0]) {
    await request('POST', '/comment/create', {
      tableId, recordId: String(recordIds[0]), baseId,
      content: 'Alice has been doing great work on the platform migration!',
    });
    console.log('  + Comment on Alice');
  }
  if (recordIds[3]) {
    await request('POST', '/comment/create', {
      tableId, recordId: String(recordIds[3]), baseId,
      content: 'David set up the new K8s cluster ahead of schedule.',
    });
    await request('POST', '/comment/create', {
      tableId, recordId: String(recordIds[3]), baseId,
      content: 'Need to review the Terraform configs before production rollout.',
    });
    console.log('  + 2 Comments on David');
  }

  seedResult.allFieldTypesTableId = tableId;
  seedResult.allFieldTypesViewId = viewId;
  seedResult.allFieldTypesRecordIds = recordIds;
  fs.writeFileSync(
    path.join(__dirname, '..', 'seed-result.json'),
    JSON.stringify(seedResult, null, 2)
  );

  console.log('\n' + '='.repeat(60));
  console.log('SEED COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\nTable: "All Field Types"  id=${tableId}  view=${viewId}`);
  console.log(`Records: ${recordIds.length} created`);
  console.log(`\nField types created:`);

  const fieldTypes = [
    'SHORT_TEXT (Name - primary)', 'LONG_TEXT', 'NUMBER', 'EMAIL',
    'PHONE_NUMBER', 'CURRENCY', 'CHECKBOX', 'SCQ (Single Select)',
    'MCQ (Multi Select)', 'DATE', 'TIME', 'RATING', 'SLIDER',
    'OPINION_SCALE', 'YES_NO', 'ZIP_CODE', 'ADDRESS', 'DROP_DOWN',
    'LIST', 'RANKING', 'SIGNATURE', 'CREATED_TIME', 'CREATED_BY',
    'LAST_MODIFIED_TIME', 'LAST_MODIFIED_BY', 'AUTO_NUMBER', 'BUTTON',
  ];
  fieldTypes.forEach(t => console.log(`  - ${t}`));
  console.log(`\nNote: FORMULA, LINK, LOOKUP, ROLLUP, and ENRICHMENT are not seeded`);
  console.log(`because they require existing fields/tables as dependencies.`);
  console.log('\nConfig updated in seed-result.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
