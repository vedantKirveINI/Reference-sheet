#!/usr/bin/env node
const http = require('http');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci0wMDEiLCJ1c2VyX2lkIjoiZGV2LXVzZXItMDAxIiwibmFtZSI6IkRldiBVc2VyIiwiZW1haWwiOiJkZXZAdGlueXRhYmxlLmFwcCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTc4NDI5MiwiZXhwIjoxODAzMzIwMjkyfQ.Y7H8RDYfvzJbPW5yzXIihSVTw4Rl-rWaBfjKQGDc8MA';

const RECORD_COUNT = 150;
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

async function createField(baseId, tableId, viewId, name, type, options) {
  const key = tableId;
  if (!fieldOrderCounter[key]) fieldOrderCounter[key] = 1;
  const order = fieldOrderCounter[key]++;
  const payload = { baseId, tableId, viewId, name, type, order };
  if (options) payload.options = options;
  const res = await request('POST', '/field/create_field', payload);
  if (res.id) {
    console.log(`  + Field: ${name} (${type}) id=${res.id} db=${res.dbFieldName}`);
    return res;
  } else {
    console.log(`  X Field ${name} FAILED:`, JSON.stringify(res).slice(0, 300));
    return {};
  }
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function repeatStr(s, n) { return s.repeat(n); }

const SCQ_CHOICES = ['Red', 'Green', 'Blue', 'Yellow', 'Purple'];
const MCQ_CHOICES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
const DD_CHOICES = [
  { id: 'opt-1', label: 'Option A' }, { id: 'opt-2', label: 'Option B' },
  { id: 'opt-3', label: 'Option C' }, { id: 'opt-4', label: 'Option D' },
  { id: 'opt-5', label: 'Option E' },
];
const DDS_CHOICES = ['Static One', 'Static Two', 'Static Three', 'Static Four', 'Static Five'];
const RANKING_ITEMS = [
  { id: 'r1', label: 'First', rank: '1' }, { id: 'r2', label: 'Second', rank: '2' },
  { id: 'r3', label: 'Third', rank: '3' }, { id: 'r4', label: 'Fourth', rank: '4' },
  { id: 'r5', label: 'Fifth', rank: '5' },
];
const USERS = [
  { id: 'dev-user-001', title: 'Dev User', email: 'dev@tinytable.app', avatarUrl: '' },
  { id: 'user-alice', title: 'Alice Chen', email: 'alice@tinytable.app', avatarUrl: '' },
  { id: 'user-bob', title: 'Bob Smith', email: 'bob@tinytable.app', avatarUrl: '' },
  { id: 'user-carol', title: 'Carol Lee', email: 'carol@tinytable.app', avatarUrl: '' },
  { id: 'user-dave', title: 'Dave Patel', email: 'dave@tinytable.app', avatarUrl: '' },
];
const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia'];
const LAST_NAMES = ['Smith', 'Chen', 'Patel', 'Kim', 'Garcia', 'Mueller', 'Tanaka', 'OBrien', 'Johansson', 'Santos'];
const DOMAINS = ['example.com', 'test.org', 'debug.io', 'mock.dev', 'tinytable.app'];
const CITIES = ['New York', 'London', 'Tokyo', 'Berlin', 'Sao Paulo', 'Sydney', 'Mumbai', 'Toronto', 'Paris', 'Seoul'];
const STATES = ['NY', 'CA', 'TX', 'FL', 'IL', 'WA', 'MA', 'CO', 'GA', 'OR'];
const COUNTRIES = ['US', 'UK', 'JP', 'DE', 'BR', 'AU', 'IN', 'CA', 'FR', 'KR'];
const COUNTRY_CODES = ['+1', '+44', '+81', '+49', '+55', '+61', '+91', '+1', '+33', '+82'];
const UNICODE_STRINGS = [
  'Nihongo Test', 'Zhongwen Ceshi', 'Hangugeo Test', 'Ellinika', 'Arabiya',
  'Hindi Parikshan', 'Espanol Nono', 'Unicode Test', 'Emoji Test', 'Francais Tres Bien',
];

function getCategory(i) {
  if (i < 30) return 'normal';
  if (i < 55) return 'small';
  if (i < 80) return 'large';
  if (i < 105) return 'edge';
  if (i < 130) return 'sparse';
  return 'invalid';
}

function generateName(i, cat) {
  const idx = i + 1;
  switch (cat) {
    case 'normal': return `Record ${idx} - ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    case 'small': return `R${idx}`;
    case 'large': return `Record ${idx} - ${repeatStr('LongName ', 20).trim()}`;
    case 'edge': return `Rec ${idx} ${pick(UNICODE_STRINGS)}`;
    case 'sparse': return i % 3 === 0 ? `Sparse ${idx}` : `S${idx}`;
    case 'invalid': return `Invalid ${idx}`;
  }
}

function generateShortText(i, cat) {
  switch (cat) {
    case 'normal': return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} - Item ${i + 1}`;
    case 'small': return 'A';
    case 'large': return repeatStr('abcdefghij', 25);
    case 'edge': return pick(UNICODE_STRINGS);
    case 'sparse': return i % 2 === 0 ? null : 'sparse text';
    case 'invalid': return 'text with special chars: <>&"\'';
  }
}

function generateLongText(i, cat) {
  switch (cat) {
    case 'normal': return `This is a normal description for record ${i + 1}. It contains typical paragraph-length text that a user might enter in a long text field.`;
    case 'small': return 'Hi';
    case 'large': return repeatStr('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor. ', 40);
    case 'edge': return `Multiline\ncontent\twith\ttabs\nand ${pick(UNICODE_STRINGS)}\n\n---\n\n# Heading\n- List item`;
    case 'sparse': return i % 3 === 0 ? null : 'brief';
    case 'invalid': return 'Text with angle brackets <div> and ampersand & and quotes';
  }
}

function generateSCQ(i, cat) {
  switch (cat) {
    case 'normal': return pick(SCQ_CHOICES);
    case 'small': return SCQ_CHOICES[0];
    case 'large': return SCQ_CHOICES[4];
    case 'edge': return SCQ_CHOICES[i % SCQ_CHOICES.length];
    case 'sparse': return i % 2 === 0 ? null : pick(SCQ_CHOICES);
    case 'invalid': return i % 3 === 0 ? 'NonExistentChoice' : pick(SCQ_CHOICES);
  }
}

function generateMCQ(i, cat) {
  switch (cat) {
    case 'normal': { const count = rand(1, 3); const shuffled = [...MCQ_CHOICES].sort(() => Math.random() - 0.5); return shuffled.slice(0, count); }
    case 'small': return [MCQ_CHOICES[0]];
    case 'large': return [...MCQ_CHOICES];
    case 'edge': return [MCQ_CHOICES[i % MCQ_CHOICES.length]];
    case 'sparse': return i % 2 === 0 ? null : [pick(MCQ_CHOICES)];
    case 'invalid': return i % 3 === 0 ? ['FakeTag1', 'FakeTag2'] : [pick(MCQ_CHOICES)];
  }
}

function generateNumber(i, cat) {
  switch (cat) {
    case 'normal': return rand(1, 10000);
    case 'small': return i % 5 === 0 ? 0 : rand(1, 10);
    case 'large': return rand(1000000, 999999999);
    case 'edge': {
      const edges = [0, -1, -999999, 0.001, 3.14159265358979, 2147483647, -2147483648, 10000000000, 0.0000001, 99.99];
      return edges[i % edges.length];
    }
    case 'sparse': return i % 2 === 0 ? null : rand(1, 100);
    case 'invalid': return i % 3 === 0 ? null : rand(-99999, 99999);
  }
}

function generateCurrency(i, cat) {
  switch (cat) {
    case 'normal': return { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: rand(100, 50000) };
    case 'small': return { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: rand(1, 10) };
    case 'large': return { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: rand(1000000, 99999999) };
    case 'edge': {
      const currencies = [
        { countryCode: 'JP', currencyCode: 'JPY', currencySymbol: 'Y', currencyValue: rand(100, 99999) },
        { countryCode: 'GB', currencyCode: 'GBP', currencySymbol: 'L', currencyValue: rand(1, 999) },
        { countryCode: 'EU', currencyCode: 'EUR', currencySymbol: 'E', currencyValue: 0 },
        { countryCode: 'IN', currencyCode: 'INR', currencySymbol: 'R', currencyValue: rand(1, 9999999) },
        { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: -500 },
      ];
      return currencies[i % currencies.length];
    }
    case 'sparse': return i % 2 === 0 ? null : { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: 42 };
    case 'invalid': return i % 3 === 0 ? null : { countryCode: '', currencyCode: '', currencySymbol: '', currencyValue: 0 };
  }
}

function generateRating(i, cat) {
  switch (cat) {
    case 'normal': return rand(1, 5);
    case 'small': return 1;
    case 'large': return 5;
    case 'edge': { const e = [0, 1, 5, 3, 2, 4, 0, 5, 1, 3]; return e[i % e.length]; }
    case 'sparse': return i % 2 === 0 ? null : rand(1, 5);
    case 'invalid': return i % 3 === 0 ? 0 : rand(1, 5);
  }
}

function generateSlider(i, cat) {
  switch (cat) {
    case 'normal': return rand(0, 100);
    case 'small': return rand(0, 5);
    case 'large': return rand(90, 100);
    case 'edge': { const e = [0, 100, 50, 1, 99, 25, 75, 0, 1, 99]; return e[i % e.length]; }
    case 'sparse': return i % 2 === 0 ? null : rand(0, 100);
    case 'invalid': return i % 3 === 0 ? 0 : rand(0, 100);
  }
}

function generateOpinionScale(i, cat) {
  switch (cat) {
    case 'normal': return rand(1, 10);
    case 'small': return 1;
    case 'large': return 10;
    case 'edge': { const e = [0, 1, 10, 5, 1, 10, 5, 0, 3, 7]; return e[i % e.length]; }
    case 'sparse': return i % 2 === 0 ? null : rand(1, 10);
    case 'invalid': return i % 3 === 0 ? 0 : rand(1, 10);
  }
}

function generateCheckbox(i, cat) {
  switch (cat) {
    case 'normal': return i % 2 === 0;
    case 'small': return false;
    case 'large': return true;
    case 'edge': return i % 3 === 0;
    case 'sparse': return i % 2 === 0 ? null : true;
    case 'invalid': return i % 4 === 0 ? null : i % 2 === 0;
  }
}

function generateDate(i, cat) {
  switch (cat) {
    case 'normal': {
      const year = rand(2020, 2027);
      const month = String(rand(1, 12)).padStart(2, '0');
      const day = String(rand(1, 28)).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    case 'small': return '2020-01-01';
    case 'large': return '2099-12-31';
    case 'edge': {
      const dates = ['2000-01-01', '1999-12-31', '2024-02-29', '2023-02-28', '1970-01-01', '2038-01-19', '2000-02-29', '1900-01-01', '2100-03-15', '2024-12-31'];
      return dates[i % dates.length];
    }
    case 'sparse': return i % 2 === 0 ? null : '2025-06-15';
    case 'invalid': return i % 3 === 0 ? '2025-01-01' : '2025-03-15';
  }
}

function generateTime(i, cat) {
  switch (cat) {
    case 'normal': {
      const h = rand(1, 12);
      const m = String(rand(0, 59)).padStart(2, '0');
      const mer = rand(0, 1) ? 'AM' : 'PM';
      return { time: `${h}:${m}`, meridiem: mer, ISOValue: `${String(mer === 'PM' ? h + 12 : h).padStart(2, '0')}:${m}:00` };
    }
    case 'small': return { time: '12:00', meridiem: 'AM', ISOValue: '00:00:00' };
    case 'large': return { time: '11:59', meridiem: 'PM', ISOValue: '23:59:00' };
    case 'edge': return { time: '12:00', meridiem: 'PM', ISOValue: '12:00:00' };
    case 'sparse': return i % 2 === 0 ? null : { time: '9:30', meridiem: 'AM', ISOValue: '09:30:00' };
    case 'invalid': return i % 3 === 0 ? { time: '', meridiem: '', ISOValue: '' } : { time: '3:15', meridiem: 'PM', ISOValue: '15:15:00' };
  }
}

function generateEmail(i, cat) {
  switch (cat) {
    case 'normal': return `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES).toLowerCase()}${rand(1, 999)}@${pick(DOMAINS)}`;
    case 'small': return 'a@b.c';
    case 'large': return `${'a'.repeat(50)}@${'b'.repeat(50)}.com`;
    case 'edge': {
      const emails = ['user+tag@example.com', 'name@subdomain.example.co.uk', 'CaseSensitive@EXAMPLE.COM', 'user.name@example.com', 'test123@test.io'];
      return emails[i % emails.length];
    }
    case 'sparse': return i % 2 === 0 ? null : `sparse${i}@test.com`;
    case 'invalid': {
      const bad = ['not-an-email', 'missing-at.com', 'user@', 'a@b', 'spaces in@email.com', '', 'user@@double.com', 'user@.com', 'just-text', 'no-domain@'];
      return i % 3 === 0 ? bad[i % bad.length] : `valid${i}@test.com`;
    }
  }
}

function generatePhone(i, cat) {
  switch (cat) {
    case 'normal': return { countryCode: 'US', countryNumber: '+1', phoneNumber: `555${String(rand(1000000, 9999999))}` };
    case 'small': return { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550001' };
    case 'large': return { countryCode: pick(COUNTRIES), countryNumber: pick(COUNTRY_CODES), phoneNumber: String(rand(10000000000, 99999999999)) };
    case 'edge': return { countryCode: pick(COUNTRIES), countryNumber: pick(COUNTRY_CODES), phoneNumber: `${rand(100, 999)}${rand(100, 999)}${rand(1000, 9999)}` };
    case 'sparse': return i % 2 === 0 ? null : { countryCode: 'US', countryNumber: '+1', phoneNumber: '5551234' };
    case 'invalid': return i % 3 === 0 ? { countryCode: '', countryNumber: '', phoneNumber: '' } : { countryCode: 'US', countryNumber: '+1', phoneNumber: '5559999' };
  }
}

function generateAddress(i, cat) {
  switch (cat) {
    case 'normal': return {
      fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      addressLineOne: `${rand(1, 9999)} ${pick(['Main', 'Oak', 'Elm', 'Maple', 'Cedar'])} ${pick(['St', 'Ave', 'Blvd', 'Dr', 'Ln'])}`,
      addressLineTwo: i % 3 === 0 ? `Apt ${rand(1, 500)}` : '',
      city: pick(CITIES), state: pick(STATES), country: pick(COUNTRIES), zipCode: String(rand(10000, 99999)),
    };
    case 'small': return { fullName: 'A', addressLineOne: '1 St', addressLineTwo: '', city: 'LA', state: 'CA', country: 'US', zipCode: '90001' };
    case 'large': return {
      fullName: `${repeatStr('LongName ', 10).trim()}`,
      addressLineOne: `${rand(1, 99999)} ${repeatStr('VeryLongStreet ', 5).trim()}`,
      addressLineTwo: `Suite ${rand(1, 9999)}, Floor ${rand(1, 100)}`,
      city: repeatStr('CityName', 5), state: 'California', country: 'United States of America', zipCode: '90210-1234',
    };
    case 'edge': return {
      fullName: pick(UNICODE_STRINGS), addressLineOne: `${rand(1, 9)} ${pick(UNICODE_STRINGS)}`,
      addressLineTwo: '', city: pick(UNICODE_STRINGS), state: '', country: '', zipCode: 'ABC-123',
    };
    case 'sparse': return i % 2 === 0 ? null : { fullName: '', addressLineOne: '', addressLineTwo: '', city: '', state: '', country: '', zipCode: '' };
    case 'invalid': return i % 3 === 0 ? null : { fullName: 'Test', addressLineOne: '123 Main', addressLineTwo: '', city: 'City', state: 'ST', country: 'US', zipCode: '00000' };
  }
}

function generateZipCode(i, cat) {
  switch (cat) {
    case 'normal': return { countryCode: 'US', zipCode: String(rand(10000, 99999)) };
    case 'small': return { countryCode: 'US', zipCode: '00001' };
    case 'large': return { countryCode: 'UK', zipCode: 'SW1A 1AA' };
    case 'edge': return { countryCode: pick(COUNTRIES), zipCode: `${rand(10000, 99999)}-${rand(1000, 9999)}` };
    case 'sparse': return i % 2 === 0 ? null : { countryCode: 'US', zipCode: '12345' };
    case 'invalid': return i % 3 === 0 ? { countryCode: '', zipCode: '' } : { countryCode: 'US', zipCode: 'XXXXX' };
  }
}

function generateYesNo(i, cat) {
  switch (cat) {
    case 'normal': return i % 2 === 0 ? 'Yes' : 'No';
    case 'small': return 'No';
    case 'large': return 'Yes';
    case 'edge': return i % 3 === 0 ? 'Yes' : 'No';
    case 'sparse': return i % 2 === 0 ? null : 'Yes';
    case 'invalid': {
      const bad = ['Maybe', 'yes', 'no', 'TRUE', 'FALSE', '1', '0', 'Y', 'N', 'yep'];
      return i % 3 === 0 ? bad[i % bad.length] : 'Yes';
    }
  }
}

function generateList(i, cat) {
  switch (cat) {
    case 'normal': { const items = ['Item A', 'Item B', 'Item C', 'Item D', 'Item E']; return items.slice(0, rand(1, 4)); }
    case 'small': return ['Single'];
    case 'large': return Array.from({ length: 20 }, (_, j) => `List Item ${j + 1}`);
    case 'edge': return [pick(UNICODE_STRINGS)];
    case 'sparse': return i % 2 === 0 ? null : ['lone item'];
    case 'invalid': return i % 3 === 0 ? [''] : ['normal item'];
  }
}

function generateRanking(i, cat) {
  switch (cat) {
    case 'normal': { const count = rand(2, 4); const shuffled = [...RANKING_ITEMS].sort(() => Math.random() - 0.5); return shuffled.slice(0, count); }
    case 'small': return [RANKING_ITEMS[0]];
    case 'large': return [...RANKING_ITEMS];
    case 'edge': return [{ id: 'edge-1', label: pick(UNICODE_STRINGS), rank: '1' }];
    case 'sparse': return i % 2 === 0 ? null : [RANKING_ITEMS[0]];
    case 'invalid': return i % 3 === 0 ? [{ id: '', label: '', rank: '' }] : [RANKING_ITEMS[0]];
  }
}

function generateDropDown(i, cat) {
  switch (cat) {
    case 'normal': return DD_CHOICES.slice(0, rand(1, 3));
    case 'small': return [DD_CHOICES[0]];
    case 'large': return [...DD_CHOICES];
    case 'edge': return [{ id: `edge-${i}`, label: pick(UNICODE_STRINGS) }];
    case 'sparse': return i % 2 === 0 ? null : [DD_CHOICES[0]];
    case 'invalid': return i % 3 === 0 ? [{ id: '', label: '' }] : [DD_CHOICES[0]];
  }
}

function generateDropDownStatic(i, cat) {
  switch (cat) {
    case 'normal': { const count = rand(1, 3); const shuffled = [...DDS_CHOICES].sort(() => Math.random() - 0.5); return shuffled.slice(0, count); }
    case 'small': return [DDS_CHOICES[0]];
    case 'large': return [...DDS_CHOICES];
    case 'edge': return [pick(UNICODE_STRINGS)];
    case 'sparse': return i % 2 === 0 ? null : [pick(DDS_CHOICES)];
    case 'invalid': return i % 3 === 0 ? ['NonExistentStaticChoice'] : [pick(DDS_CHOICES)];
  }
}

function generateSignature(i, cat) {
  switch (cat) {
    case 'normal': return `data:image/png;base64,iVBOR${repeatStr('A', rand(20, 60))}==`;
    case 'small': return 'data:image/png;base64,AA==';
    case 'large': return `data:image/png;base64,${repeatStr('ABCDEF', 50)}==`;
    case 'edge': return `data:image/svg+xml;base64,${repeatStr('A', 30)}==`;
    case 'sparse': return i % 2 === 0 ? null : 'data:image/png;base64,TEST==';
    case 'invalid': return i % 3 === 0 ? 'not-a-valid-signature' : `data:image/png;base64,VALID${i}==`;
  }
}

function generateFilePicker(i, cat) {
  switch (cat) {
    case 'normal': return [{ url: `https://files.example.com/doc_${i + 1}.pdf`, size: rand(1024, 10485760), mimeType: 'application/pdf' }];
    case 'small': return [{ url: 'https://f.co/a.txt', size: 1, mimeType: 'text/plain' }];
    case 'large': return Array.from({ length: 5 }, (_, j) => ({
      url: `https://storage.example.com/file_${i}_${j}.zip`,
      size: rand(10000000, 999999999),
      mimeType: pick(['application/zip', 'image/png', 'video/mp4', 'application/pdf', 'text/csv']),
    }));
    case 'edge': return [{ url: 'https://example.com/files/testfile.dat', size: 0, mimeType: 'application/octet-stream' }];
    case 'sparse': return i % 2 === 0 ? null : [{ url: 'https://example.com/sparse.txt', size: 100, mimeType: 'text/plain' }];
    case 'invalid': return i % 3 === 0 ? [{ url: '', size: 0, mimeType: '' }] : [{ url: 'https://example.com/ok.txt', size: 100, mimeType: 'text/plain' }];
  }
}

function generateRecord(i) {
  const cat = getCategory(i);
  return {
    name: generateName(i, cat),
    short_text: generateShortText(i, cat),
    long_text: generateLongText(i, cat),
    scq: generateSCQ(i, cat),
    mcq: generateMCQ(i, cat),
    number_val: generateNumber(i, cat),
    currency: generateCurrency(i, cat),
    rating: generateRating(i, cat),
    slider: generateSlider(i, cat),
    opinion_scale: generateOpinionScale(i, cat),
    checkbox: generateCheckbox(i, cat),
    date_val: generateDate(i, cat),
    time_val: generateTime(i, cat),
    email: generateEmail(i, cat),
    phone: generatePhone(i, cat),
    address: generateAddress(i, cat),
    zip_code: generateZipCode(i, cat),
    yes_no: generateYesNo(i, cat),
    list_val: generateList(i, cat),
    ranking: generateRanking(i, cat),
    drop_down: generateDropDown(i, cat),
    drop_down_static: generateDropDownStatic(i, cat),
    signature: generateSignature(i, cat),
    file_picker: generateFilePicker(i, cat),
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('FIELD TYPE DEBUG TABLE SEEDER');
  console.log('='.repeat(60));
  console.log(`\nGenerating ${RECORD_COUNT} records across all field types...\n`);

  console.log('PHASE 1: Creating sheet and fields via API\n');

  console.log('1. Creating sheet...');
  const sheetRes = await request('POST', '/sheet/create_sheet', {
    workspace_id: 'debug-seed',
    parent_id: '',
  });

  const baseId = sheetRes.base?.id;
  const tableId = sheetRes.table?.id;
  const viewId = sheetRes.view?.id;

  if (!baseId || !tableId) {
    console.error('Failed to create sheet:', JSON.stringify(sheetRes).slice(0, 500));
    process.exit(1);
  }
  console.log(`  Sheet: baseId=${baseId}, tableId=${tableId}, viewId=${viewId}`);

  await request('PUT', '/base/update_base_sheet_name', { baseId, name: 'Field Type Debug' });

  const fields = await request('GET', `/field/getFields?tableId=${tableId}`);
  const nameField = Array.isArray(fields) ? fields[0] : null;
  console.log(`  Name field: id=${nameField?.id} db=${nameField?.dbFieldName}\n`);

  console.log('2. Creating fields...');
  const shortTextField = await createField(baseId, tableId, viewId, 'Short Text', 'SHORT_TEXT');
  const longTextField = await createField(baseId, tableId, viewId, 'Long Text', 'LONG_TEXT');
  const scqField = await createField(baseId, tableId, viewId, 'Single Select', 'SCQ', {
    choices: SCQ_CHOICES.map((name, idx) => ({ name, color: ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'][idx] })),
  });
  const mcqField = await createField(baseId, tableId, viewId, 'Multi Select', 'MCQ', {
    choices: MCQ_CHOICES.map((name, idx) => ({ name, color: ['#06b6d4', '#f97316', '#84cc16', '#e879f9', '#fbbf24'][idx] })),
  });
  const numberField = await createField(baseId, tableId, viewId, 'Number Val', 'NUMBER', {
    allowNegative: true, allowFraction: true,
  });
  const currencyField = await createField(baseId, tableId, viewId, 'Currency Val', 'CURRENCY', {
    symbol: '$', precision: 2,
  });
  const ratingField = await createField(baseId, tableId, viewId, 'Rating Val', 'RATING');
  const sliderField = await createField(baseId, tableId, viewId, 'Slider Val', 'SLIDER');
  const opinionField = await createField(baseId, tableId, viewId, 'Opinion Scale Val', 'OPINION_SCALE');
  const checkboxField = await createField(baseId, tableId, viewId, 'Checkbox Val', 'CHECKBOX');
  const dateField = await createField(baseId, tableId, viewId, 'Date Val', 'DATE');
  const timeField = await createField(baseId, tableId, viewId, 'Time Val', 'TIME');
  const emailField = await createField(baseId, tableId, viewId, 'Email Val', 'EMAIL');
  const phoneField = await createField(baseId, tableId, viewId, 'Phone Val', 'PHONE_NUMBER');
  const addressField = await createField(baseId, tableId, viewId, 'Address Val', 'ADDRESS');
  const zipCodeField = await createField(baseId, tableId, viewId, 'Zip Code Val', 'ZIP_CODE');
  const yesNoField = await createField(baseId, tableId, viewId, 'Yes No Val', 'YES_NO');
  const listField = await createField(baseId, tableId, viewId, 'List Val', 'LIST');
  const rankingField = await createField(baseId, tableId, viewId, 'Ranking Val', 'RANKING');
  const dropDownField = await createField(baseId, tableId, viewId, 'Drop Down Val', 'DROP_DOWN');
  const dropDownStaticField = await createField(baseId, tableId, viewId, 'Drop Down Static Val', 'DROP_DOWN_STATIC');
  const signatureField = await createField(baseId, tableId, viewId, 'Signature Val', 'SIGNATURE');
  const filePickerField = await createField(baseId, tableId, viewId, 'File Picker Val', 'FILE_PICKER');

  const dbCols = {
    name: nameField?.dbFieldName,
    short_text: shortTextField?.dbFieldName,
    long_text: longTextField?.dbFieldName,
    scq: scqField?.dbFieldName,
    mcq: mcqField?.dbFieldName,
    number_val: numberField?.dbFieldName,
    currency: currencyField?.dbFieldName,
    rating: ratingField?.dbFieldName,
    slider: sliderField?.dbFieldName,
    opinion_scale: opinionField?.dbFieldName,
    checkbox: checkboxField?.dbFieldName,
    date_val: dateField?.dbFieldName,
    time_val: timeField?.dbFieldName,
    email: emailField?.dbFieldName,
    phone: phoneField?.dbFieldName,
    address: addressField?.dbFieldName,
    zip_code: zipCodeField?.dbFieldName,
    yes_no: yesNoField?.dbFieldName,
    list_val: listField?.dbFieldName,
    ranking: rankingField?.dbFieldName,
    drop_down: dropDownField?.dbFieldName,
    drop_down_static: dropDownStaticField?.dbFieldName,
    signature: signatureField?.dbFieldName,
    file_picker: filePickerField?.dbFieldName,
  };

  const missingCols = Object.entries(dbCols).filter(([, v]) => !v);
  if (missingCols.length > 0) {
    console.error('Missing dbFieldName for:', missingCols.map(([k]) => k).join(', '));
    process.exit(1);
  }

  console.log(`\n3. Creating ${RECORD_COUNT} empty records via API...`);
  const recordIds = [];
  for (let i = 0; i < RECORD_COUNT; i++) {
    const recRes = await request('POST', '/record/create_record', { baseId, tableId, viewId });
    const rec = Array.isArray(recRes) ? recRes[0] : recRes;
    const recId = rec?.__id;
    if (recId) {
      recordIds.push(recId);
    } else {
      console.log(`  X Record ${i + 1} creation failed:`, JSON.stringify(recRes).slice(0, 200));
    }
    if ((i + 1) % 50 === 0) console.log(`  Created ${i + 1}/${RECORD_COUNT} empty records...`);
  }
  console.log(`  Created ${recordIds.length}/${RECORD_COUNT} empty records.`);

  console.log('\nPHASE 2: Populating all data via direct SQL\n');

  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();
  console.log('  Connected to PostgreSQL');

  const schema = baseId;
  const table = tableId;

  try {
    console.log('\n4. Populating record data...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < recordIds.length; i++) {
      const recId = recordIds[i];
      const data = generateRecord(i);

      const setClauses = [];
      const params = [];
      let paramIdx = 1;

      function addText(colKey, value) {
        if (value === null || value === undefined) return;
        setClauses.push(`"${dbCols[colKey]}" = $${paramIdx}`);
        params.push(value);
        paramIdx++;
      }

      function addJsonb(colKey, value) {
        if (value === null || value === undefined) return;
        setClauses.push(`"${dbCols[colKey]}" = $${paramIdx}::jsonb`);
        params.push(JSON.stringify(value));
        paramIdx++;
      }

      function addNumeric(colKey, value) {
        if (value === null || value === undefined) return;
        setClauses.push(`"${dbCols[colKey]}" = $${paramIdx}`);
        params.push(value);
        paramIdx++;
      }

      function addBool(colKey, value) {
        if (value === null || value === undefined) return;
        setClauses.push(`"${dbCols[colKey]}" = $${paramIdx}`);
        params.push(value);
        paramIdx++;
      }

      function addTimestamp(colKey, value) {
        if (value === null || value === undefined) return;
        setClauses.push(`"${dbCols[colKey]}" = $${paramIdx}::timestamptz`);
        params.push(value);
        paramIdx++;
      }

      addText('name', data.name);
      addText('short_text', data.short_text);
      addText('long_text', data.long_text);
      addText('scq', data.scq);
      addJsonb('mcq', data.mcq);
      addNumeric('number_val', data.number_val);
      addJsonb('currency', data.currency);
      addNumeric('rating', data.rating);
      addNumeric('slider', data.slider);
      addNumeric('opinion_scale', data.opinion_scale);
      addBool('checkbox', data.checkbox);
      addTimestamp('date_val', data.date_val);
      addJsonb('time_val', data.time_val);
      addText('email', data.email);
      addJsonb('phone', data.phone);
      addJsonb('address', data.address);
      addJsonb('zip_code', data.zip_code);
      addText('yes_no', data.yes_no);
      addJsonb('list_val', data.list_val);
      addJsonb('ranking', data.ranking);
      addJsonb('drop_down', data.drop_down);
      addJsonb('drop_down_static', data.drop_down_static);
      addText('signature', data.signature);
      addJsonb('file_picker', data.file_picker);

      if (setClauses.length === 0) continue;

      params.push(recId);
      const sql = `UPDATE "${schema}".${table} SET ${setClauses.join(', ')} WHERE __id = $${paramIdx}`;

      try {
        await pgClient.query(sql, params);
        successCount++;
      } catch (err) {
        errorCount++;
        if (errorCount <= 5) {
          console.log(`  X Record ${i + 1} (id=${recId}) SQL error: ${err.message.slice(0, 200)}`);
        }
      }

      if ((i + 1) % 25 === 0) {
        console.log(`  Updated ${i + 1}/${recordIds.length} records [${getCategory(i)}]`);
      }
    }
    console.log(`\n  Data population: ${successCount} success, ${errorCount} errors`);

    console.log('\n5. Creating system fields via API...');
    await createField(baseId, tableId, viewId, 'Auto #', 'AUTO_NUMBER', null);
    await createField(baseId, tableId, viewId, 'Created By', 'CREATED_BY', null);
    await createField(baseId, tableId, viewId, 'Last Modified By', 'LAST_MODIFIED_BY', null);
    await createField(baseId, tableId, viewId, 'Last Modified', 'LAST_MODIFIED_TIME', null);

    console.log('\n6. Creating User and Button fields...');
    const userField = await createField(baseId, tableId, viewId, 'User Field', 'USER', null);
    const buttonField = await createField(baseId, tableId, viewId, 'Action Button', 'BUTTON', null);

    console.log('\n7. Populating system/special fields via SQL...');

    console.log('  7a. Setting __auto_number...');
    for (let i = 0; i < recordIds.length; i++) {
      await pgClient.query(`UPDATE "${schema}".${table} SET "__auto_number" = $1 WHERE __id = $2`, [i + 1, recordIds[i]]);
    }
    console.log(`    Set auto numbers 1-${recordIds.length}`);

    console.log('  7b. Setting __created_by...');
    for (let i = 0; i < recordIds.length; i++) {
      const cat = getCategory(i);
      if (cat === 'sparse' && i % 2 === 0) continue;
      const user = USERS[i % USERS.length];
      await pgClient.query(`UPDATE "${schema}".${table} SET "__created_by" = $1::jsonb WHERE __id = $2`, [JSON.stringify(user), recordIds[i]]);
    }

    console.log('  7c. Setting __last_updated_by...');
    for (let i = 0; i < recordIds.length; i++) {
      const cat = getCategory(i);
      if (cat === 'sparse' && i % 3 === 0) continue;
      const user = USERS[(i + 2) % USERS.length];
      await pgClient.query(`UPDATE "${schema}".${table} SET "__last_updated_by" = $1::jsonb WHERE __id = $2`, [JSON.stringify(user), recordIds[i]]);
    }

    console.log('  7d. Setting __last_modified_time...');
    for (let i = 0; i < recordIds.length; i++) {
      const cat = getCategory(i);
      let interval;
      switch (cat) {
        case 'normal': interval = `${rand(1, 30)} days`; break;
        case 'small': interval = `${rand(1, 5)} minutes`; break;
        case 'large': interval = `${rand(180, 365)} days`; break;
        case 'edge': interval = `${rand(0, 1)} seconds`; break;
        case 'sparse': if (i % 2 === 0) continue; interval = `${rand(1, 60)} hours`; break;
        case 'invalid': interval = `${rand(1, 10)} days`; break;
      }
      await pgClient.query(`UPDATE "${schema}".${table} SET "__last_modified_time" = NOW() - INTERVAL '${interval}' WHERE __id = $1`, [recordIds[i]]);
    }

    if (userField.id && userField.dbFieldName) {
      console.log('  7e. Setting User field...');
      const userDbCol = userField.dbFieldName;
      for (let i = 0; i < recordIds.length; i++) {
        const cat = getCategory(i);
        if (cat === 'sparse' && i % 2 === 0) continue;
        if (cat === 'invalid' && i % 3 === 0) continue;
        const user = USERS[i % USERS.length];
        await pgClient.query(`UPDATE "${schema}".${table} SET "${userDbCol}" = $1::jsonb WHERE __id = $2`, [JSON.stringify(user), recordIds[i]]);
      }
    }

    if (buttonField.id && buttonField.dbFieldName) {
      console.log('  7f. Setting Button field...');
      const btnDbCol = buttonField.dbFieldName;
      const buttonConfigs = [
        { label: 'Open', color: '#39A380', clickCount: 0 },
        { label: 'Edit', color: '#3b82f6', clickCount: 0 },
        { label: 'Delete', color: '#ef4444', clickCount: 0 },
        { label: 'View', color: '#f59e0b', clickCount: 0 },
        { label: 'Submit', color: '#a855f7', clickCount: 0 },
      ];
      for (let i = 0; i < recordIds.length; i++) {
        const cat = getCategory(i);
        if (cat === 'sparse' && i % 2 === 0) continue;
        const config = { ...buttonConfigs[i % buttonConfigs.length] };
        if (cat === 'edge') config.clickCount = rand(0, 9999);
        if (cat === 'large') config.label = 'SuperLongButtonLabel';
        await pgClient.query(`UPDATE "${schema}".${table} SET "${btnDbCol}" = $1::jsonb WHERE __id = $2`, [JSON.stringify(config), recordIds[i]]);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('FIELD TYPE DEBUG TABLE SEED COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\nSheet: "Field Type Debug"  baseId=${baseId}`);
    console.log(`Table: ${tableId}, View: ${viewId}`);
    console.log(`Records: ${recordIds.length} created`);
    console.log(`\nField Types Covered:`);
    console.log(`  API-based: SHORT_TEXT, LONG_TEXT, SCQ, MCQ, NUMBER, CURRENCY,`);
    console.log(`    RATING, SLIDER, OPINION_SCALE, CHECKBOX, DATE, TIME,`);
    console.log(`    EMAIL, PHONE_NUMBER, ADDRESS, ZIP_CODE, YES_NO, LIST,`);
    console.log(`    RANKING, DROP_DOWN, DROP_DOWN_STATIC, SIGNATURE, FILE_PICKER`);
    console.log(`  System/SQL: AUTO_NUMBER, CREATED_BY, LAST_MODIFIED_BY,`);
    console.log(`    LAST_MODIFIED_TIME, USER, BUTTON`);
    console.log(`\nData Categories (${RECORD_COUNT} records):`);
    console.log(`  Records   1-30:  Normal/valid data`);
    console.log(`  Records  31-55:  Small/minimal data`);
    console.log(`  Records  56-80:  Large/max data`);
    console.log(`  Records  81-105: Edge cases (unicode, boundary values)`);
    console.log(`  Records 106-130: Sparse (random nulls)`);
    console.log(`  Records 131-150: Invalid/malformed data`);

    const config = { baseId, tableId, viewId, recordIds, recordCount: recordIds.length };
    fs.writeFileSync(
      path.join(__dirname, '..', 'seed-debug-result.json'),
      JSON.stringify(config, null, 2)
    );
    console.log('\nConfig written to seed-debug-result.json');

  } finally {
    await pgClient.end();
    console.log('\nPostgreSQL connection closed.');
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
