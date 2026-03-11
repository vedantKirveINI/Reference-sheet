#!/usr/bin/env node
const http = require('http');
const { Client } = require('pg');
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

async function createField(baseId, tableId, viewId, name, type, options) {
  const key = tableId;
  if (!fieldOrderCounter[key]) fieldOrderCounter[key] = 1;
  const order = fieldOrderCounter[key]++;
  const payload = { baseId, tableId, viewId, name, type, order };
  if (options) payload.options = options;
  const res = await request('POST', '/field/create_field', payload);
  if (res.id) {
    console.log(`    + Field: ${name} (${type}) id=${res.id} db=${res.dbFieldName}`);
    return res;
  } else {
    console.log(`    X Field ${name} FAILED:`, JSON.stringify(res).slice(0, 300));
    return {};
  }
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

const COMPANY_DATA = [
  { domain: 'google.com', name: 'Google LLC', website: 'https://google.com', employeeCount: ['100,000+'], industry: 'Technology / Internet', foundedYear: '1998', funding: 'IPO - Public', techStack: ['Go', 'Python', 'Java', 'Kubernetes', 'TensorFlow', 'Angular'], location: 'Mountain View, CA, USA', socialLinks: ['https://linkedin.com/company/google', 'https://twitter.com/google'], description: 'A multinational technology company specializing in search, cloud computing, and AI.', keyPeople: [{ name: 'Sundar Pichai', title: 'CEO' }, { name: 'Ruth Porat', title: 'CFO' }] },
  { domain: 'apple.com', name: 'Apple Inc.', website: 'https://apple.com', employeeCount: ['150,000+'], industry: 'Technology / Consumer Electronics', foundedYear: '1976', funding: 'IPO - Public', techStack: ['Swift', 'Objective-C', 'Metal', 'CoreML'], location: 'Cupertino, CA, USA', socialLinks: ['https://linkedin.com/company/apple', 'https://twitter.com/apple'], description: 'Designs and manufactures consumer electronics, software, and online services.', keyPeople: [{ name: 'Tim Cook', title: 'CEO' }, { name: 'Craig Federighi', title: 'SVP Software Engineering' }] },
  { domain: 'stripe.com', name: 'Stripe Inc.', website: 'https://stripe.com', employeeCount: ['8,000-10,000'], industry: 'Financial Technology', foundedYear: '2010', funding: 'Series I - $6.5B', techStack: ['Ruby', 'Scala', 'Go', 'React', 'GraphQL'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/stripe', 'https://twitter.com/stripe'], description: 'Payment processing platform for internet businesses.', keyPeople: [{ name: 'Patrick Collison', title: 'CEO' }, { name: 'John Collison', title: 'President' }] },
  { domain: 'openai.com', name: 'OpenAI', website: 'https://openai.com', employeeCount: ['1,500-2,000'], industry: 'Artificial Intelligence', foundedYear: '2015', funding: 'Series E - $13B', techStack: ['Python', 'PyTorch', 'CUDA', 'Kubernetes', 'Azure'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/openai', 'https://twitter.com/openai'], description: 'AI research lab building safe and beneficial artificial general intelligence.', keyPeople: [{ name: 'Sam Altman', title: 'CEO' }, { name: 'Mira Murati', title: 'CTO' }] },
  { domain: 'shopify.com', name: 'Shopify Inc.', website: 'https://shopify.com', employeeCount: ['10,000+'], industry: 'E-commerce / SaaS', foundedYear: '2006', funding: 'IPO - Public', techStack: ['Ruby on Rails', 'React', 'GraphQL', 'Rust', 'Go'], location: 'Ottawa, ON, Canada', socialLinks: ['https://linkedin.com/company/shopify', 'https://twitter.com/shopify'], description: 'E-commerce platform for online stores and retail point-of-sale systems.', keyPeople: [{ name: 'Tobi Lutke', title: 'CEO' }, { name: 'Harley Finkelstein', title: 'President' }] },
  { domain: 'figma.com', name: 'Figma Inc.', website: 'https://figma.com', employeeCount: ['1,000-1,500'], industry: 'Design Software', foundedYear: '2012', funding: 'Acquired by Adobe ($20B)', techStack: ['TypeScript', 'WebAssembly', 'C++', 'React'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/figma', 'https://twitter.com/figma'], description: 'Collaborative interface design tool for teams.', keyPeople: [{ name: 'Dylan Field', title: 'CEO' }] },
  { domain: 'notion.so', name: 'Notion Labs Inc.', website: 'https://notion.so', employeeCount: ['500-800'], industry: 'Productivity Software', foundedYear: '2013', funding: 'Series C - $275M', techStack: ['TypeScript', 'React', 'Kotlin', 'PostgreSQL'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/notionhq', 'https://twitter.com/notionhq'], description: 'All-in-one workspace for notes, docs, wikis, and project management.', keyPeople: [{ name: 'Ivan Zhao', title: 'CEO' }] },
  { domain: 'vercel.com', name: 'Vercel Inc.', website: 'https://vercel.com', employeeCount: ['400-600'], industry: 'Cloud Infrastructure / DevTools', foundedYear: '2015', funding: 'Series D - $150M', techStack: ['Next.js', 'TypeScript', 'Go', 'Rust', 'Edge Functions'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/vercel', 'https://twitter.com/vercel'], description: 'Frontend cloud platform for deploying web applications.', keyPeople: [{ name: 'Guillermo Rauch', title: 'CEO' }] },
  { domain: 'linear.app', name: 'Linear', website: 'https://linear.app', employeeCount: ['50-100'], industry: 'Project Management / DevTools', foundedYear: '2019', funding: 'Series B - $35M', techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/linear-app', 'https://twitter.com/linear'], description: 'Issue tracking and project management for software teams.', keyPeople: [{ name: 'Karri Saarinen', title: 'CEO' }] },
  { domain: 'supabase.com', name: 'Supabase Inc.', website: 'https://supabase.com', employeeCount: ['100-200'], industry: 'Database / Backend-as-a-Service', foundedYear: '2020', funding: 'Series B - $80M', techStack: ['PostgreSQL', 'TypeScript', 'Elixir', 'Go', 'Deno'], location: 'Singapore (Remote-first)', socialLinks: ['https://linkedin.com/company/supabase', 'https://twitter.com/supabase'], description: 'Open-source Firebase alternative with Postgres at its core.', keyPeople: [{ name: 'Paul Copplestone', title: 'CEO' }] },
  { domain: 'databricks.com', name: 'Databricks', website: 'https://databricks.com', employeeCount: ['5,000-7,000'], industry: 'Data & AI Platform', foundedYear: '2013', funding: 'Series I - $500M', techStack: ['Apache Spark', 'Python', 'Scala', 'Delta Lake', 'MLflow'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/databricks'], description: 'Unified analytics platform for data engineering and machine learning.', keyPeople: [{ name: 'Ali Ghodsi', title: 'CEO' }] },
  { domain: 'hashicorp.com', name: 'HashiCorp', website: 'https://hashicorp.com', employeeCount: ['2,000-3,000'], industry: 'Cloud Infrastructure', foundedYear: '2012', funding: 'IPO - Public', techStack: ['Go', 'Terraform', 'Vault', 'Consul', 'Nomad'], location: 'San Francisco, CA, USA', socialLinks: ['https://linkedin.com/company/hashicorp'], description: 'Multi-cloud infrastructure automation software company.', keyPeople: [{ name: 'Dave McJannet', title: 'CEO' }] },
  { domain: 'acme-startup.io', name: 'Acme Startup', website: 'https://acme-startup.io', employeeCount: ['10-20'], industry: 'SaaS', foundedYear: '2023', funding: 'Seed - $2M', techStack: ['Next.js', 'PostgreSQL'], location: 'Austin, TX, USA', socialLinks: [], description: 'Early-stage SaaS startup.', keyPeople: [{ name: 'Jane Doe', title: 'Founder' }] },
  { domain: 'mega-corp.example', name: 'MegaCorp International', website: 'https://mega-corp.example', employeeCount: ['50,000+'], industry: 'Conglomerate', foundedYear: '1955', funding: 'IPO - Public', techStack: ['Java', 'SAP', 'Oracle'], location: 'New York, NY, USA', socialLinks: ['https://linkedin.com/company/megacorp'], description: 'Multinational conglomerate with diverse business operations.', keyPeople: [{ name: 'Robert Titan', title: 'CEO' }, { name: 'Sarah Magnus', title: 'COO' }] },
  { domain: 'stealth-ai.dev', name: null, website: null, employeeCount: null, industry: null, foundedYear: null, funding: null, techStack: null, location: null, socialLinks: null, description: null, keyPeople: null },
];

const PERSON_DATA = [
  { fullName: 'Sarah Chen', domain: 'google.com', linkedinUrl: 'https://linkedin.com/in/sarachen', title: 'Senior Software Engineer', company: 'Google', personLocation: 'Mountain View, CA', bio: 'Full-stack engineer with 8 years of experience in distributed systems and cloud infrastructure.', education: [{ institution: 'Stanford University', degree: 'MS Computer Science' }, { institution: 'UC Berkeley', degree: 'BS EECS' }] },
  { fullName: 'James Rodriguez', domain: 'stripe.com', linkedinUrl: 'https://linkedin.com/in/jamesrodriguez', title: 'Engineering Manager', company: 'Stripe', personLocation: 'San Francisco, CA', bio: 'Leading payments infrastructure team. Previously at Square and PayPal.', education: [{ institution: 'MIT', degree: 'MS Software Engineering' }] },
  { fullName: 'Emily Watson', domain: 'openai.com', linkedinUrl: 'https://linkedin.com/in/emilywatson', title: 'Research Scientist', company: 'OpenAI', personLocation: 'San Francisco, CA', bio: 'Specializing in large language models and reinforcement learning from human feedback.', education: [{ institution: 'Carnegie Mellon University', degree: 'PhD Machine Learning' }, { institution: 'University of Toronto', degree: 'BS Mathematics' }] },
  { fullName: 'Michael Park', domain: 'figma.com', linkedinUrl: 'https://linkedin.com/in/michaelpark', title: 'Staff Product Designer', company: 'Figma', personLocation: 'New York, NY', bio: 'Design systems expert. Building collaborative design tools for 6+ years.', education: [{ institution: 'Rhode Island School of Design', degree: 'BFA Graphic Design' }] },
  { fullName: 'Priya Sharma', domain: 'shopify.com', linkedinUrl: 'https://linkedin.com/in/priyasharma', title: 'VP of Engineering', company: 'Shopify', personLocation: 'Ottawa, ON, Canada', bio: 'Building scalable e-commerce platforms. 15 years in tech leadership roles.', education: [{ institution: 'IIT Delhi', degree: 'BTech Computer Science' }, { institution: 'Wharton', degree: 'MBA' }] },
  { fullName: 'Alex Kim', domain: 'vercel.com', linkedinUrl: 'https://linkedin.com/in/alexkim', title: 'Developer Advocate', company: 'Vercel', personLocation: 'Seattle, WA', bio: 'Helping developers ship faster with Next.js and Edge Functions.', education: [{ institution: 'University of Washington', degree: 'BS Computer Science' }] },
  { fullName: 'Maria Gonzalez', domain: 'notion.so', linkedinUrl: 'https://linkedin.com/in/mariagonzalez', title: 'Head of Product', company: 'Notion', personLocation: 'San Francisco, CA', bio: 'Product leader focused on collaborative knowledge tools and user experience.', education: [{ institution: 'Harvard Business School', degree: 'MBA' }, { institution: 'Universidad de Buenos Aires', degree: 'BSc Engineering' }] },
  { fullName: 'David Liu', domain: 'databricks.com', linkedinUrl: 'https://linkedin.com/in/davidliu', title: 'Principal Data Engineer', company: 'Databricks', personLocation: 'Portland, OR', bio: 'Apache Spark committer. Building next-generation data lakehouse architecture.', education: [{ institution: 'UC San Diego', degree: 'MS Data Science' }] },
  { fullName: 'Sophie Martin', domain: 'linear.app', linkedinUrl: 'https://linkedin.com/in/sophiemartin', title: 'Founding Engineer', company: 'Linear', personLocation: 'Berlin, Germany', bio: 'Building fast, beautiful project management tools. Previously at Uber.', education: [{ institution: 'Technical University of Munich', degree: 'MS Informatics' }] },
  { fullName: 'Tom Anderson', domain: 'hashicorp.com', linkedinUrl: 'https://linkedin.com/in/tomanderson', title: 'Solutions Architect', company: 'HashiCorp', personLocation: 'Denver, CO', bio: 'Multi-cloud infrastructure specialist. Terraform expert with 200+ deployments.', education: [{ institution: 'Colorado School of Mines', degree: 'BS Computer Science' }] },
  { fullName: 'Yuki Tanaka', domain: 'supabase.com', linkedinUrl: '', title: 'Backend Engineer', company: 'Supabase', personLocation: 'Tokyo, Japan', bio: 'PostgreSQL enthusiast. Contributing to open-source database tooling.', education: [{ institution: 'University of Tokyo', degree: 'MS Information Science' }] },
  { fullName: 'Carlos Reyes', domain: 'apple.com', linkedinUrl: 'https://linkedin.com/in/carlosreyes', title: 'iOS Framework Engineer', company: 'Apple', personLocation: 'Cupertino, CA', bio: 'Working on SwiftUI and accessibility frameworks for Apple platforms.', education: [{ institution: 'Georgia Tech', degree: 'BS Computer Science' }] },
  { fullName: 'Unknown Person', domain: 'stealth-ai.dev', linkedinUrl: '', title: null, company: null, personLocation: null, bio: null, education: null },
  { fullName: 'Test Benutzer', domain: 'acme-startup.io', linkedinUrl: '', title: 'Intern', company: 'Acme Startup', personLocation: 'Austin, TX', bio: 'Summer intern exploring startup life.', education: [{ institution: 'University of Texas', degree: 'BS (In Progress)' }] },
  { fullName: 'Ayumi Nakamura', domain: 'figma.com', linkedinUrl: 'https://linkedin.com/in/ayuminakamura', title: 'UX Researcher', company: 'Figma', personLocation: 'San Francisco, CA', bio: 'User research and design thinking for collaborative tools.', education: [{ institution: 'Keio University', degree: 'MA Human-Computer Interaction' }] },
];

const EMAIL_DATA = [
  { fullName: 'Sarah Chen', domain: 'google.com', validEmail: 'sarah.chen@google.com' },
  { fullName: 'James Rodriguez', domain: 'stripe.com', validEmail: 'james.rodriguez@stripe.com' },
  { fullName: 'Emily Watson', domain: 'openai.com', validEmail: 'emily.watson@openai.com' },
  { fullName: 'Michael Park', domain: 'figma.com', validEmail: 'michael.park@figma.com' },
  { fullName: 'Priya Sharma', domain: 'shopify.com', validEmail: 'priya.sharma@shopify.com' },
  { fullName: 'Alex Kim', domain: 'vercel.com', validEmail: 'alex.kim@vercel.com' },
  { fullName: 'Maria Gonzalez', domain: 'notion.so', validEmail: 'maria.gonzalez@notion.so' },
  { fullName: 'David Liu', domain: 'databricks.com', validEmail: 'david.liu@databricks.com' },
  { fullName: 'Sophie Martin', domain: 'linear.app', validEmail: 'sophie.martin@linear.app' },
  { fullName: 'Tom Anderson', domain: 'hashicorp.com', validEmail: 'tom.anderson@hashicorp.com' },
  { fullName: 'Yuki Tanaka', domain: 'supabase.com', validEmail: 'yuki.tanaka@supabase.com' },
  { fullName: 'Carlos Reyes', domain: 'apple.com', validEmail: 'carlos.reyes@apple.com' },
  { fullName: 'Tim Cook', domain: 'apple.com', validEmail: 'tim.cook@apple.com' },
  { fullName: 'Sundar Pichai', domain: 'google.com', validEmail: 'sundar.pichai@google.com' },
  { fullName: 'Patrick Collison', domain: 'stripe.com', validEmail: 'patrick.collison@stripe.com' },
  { fullName: 'Sam Altman', domain: 'openai.com', validEmail: 'sam.altman@openai.com' },
  { fullName: 'Tobi Lutke', domain: 'shopify.com', validEmail: 'tobi.lutke@shopify.com' },
  { fullName: 'Dylan Field', domain: 'figma.com', validEmail: 'dylan.field@figma.com' },
  { fullName: 'Ivan Zhao', domain: 'notion.so', validEmail: 'ivan.zhao@notion.so' },
  { fullName: 'Guillermo Rauch', domain: 'vercel.com', validEmail: 'guillermo.rauch@vercel.com' },
  { fullName: 'Unknown Person', domain: 'stealth-ai.dev', validEmail: null },
  { fullName: 'Test Benutzer', domain: 'acme-startup.io', validEmail: 'test.benutzer@acme-startup.io' },
  { fullName: 'Ayumi Nakamura', domain: 'figma.com', validEmail: 'ayumi.nakamura@figma.com' },
  { fullName: 'Jane Doe', domain: 'acme-startup.io', validEmail: 'jane.doe@acme-startup.io' },
  { fullName: 'Robert Titan', domain: 'mega-corp.example', validEmail: 'robert.titan@mega-corp.example' },
  { fullName: '', domain: '', validEmail: null },
  { fullName: 'NoEmail Person', domain: 'nonexistent-domain.xyz', validEmail: null },
  { fullName: 'Ali Ghodsi', domain: 'databricks.com', validEmail: 'ali.ghodsi@databricks.com' },
  { fullName: 'Karri Saarinen', domain: 'linear.app', validEmail: 'karri.saarinen@linear.app' },
  { fullName: 'Paul Copplestone', domain: 'supabase.com', validEmail: 'paul.copplestone@supabase.com' },
];

async function createTableInBase(baseId, tableName) {
  console.log(`  Creating table "${tableName}"...`);
  await request('POST', '/table/create_table', { baseId, name: tableName });

  const sheetData = await request('POST', '/sheet/get_sheet', {
    baseId, include_views: true, include_tables: true,
  });
  const allTables = sheetData.tables || [];
  const table = allTables.find(t => t.name === tableName);
  if (!table) {
    console.error(`  Failed to find "${tableName}". Tables:`, allTables.map(t => t.name));
    process.exit(1);
  }
  const tableId = table.id;
  const viewId = table.views?.[0]?.id;
  console.log(`  Table: id=${tableId}, view=${viewId}`);

  const fields = await request('GET', `/field/getFields?tableId=${tableId}`);
  const nameField = Array.isArray(fields) ? fields[0] : null;
  console.log(`  Name field: id=${nameField?.id} db=${nameField?.dbFieldName}`);
  return { tableId, viewId, nameField };
}

async function getExistingRecordIds(pgClient, baseId, tableId) {
  const r = await pgClient.query(`SELECT __id FROM "${baseId}".${tableId} ORDER BY __id`);
  return r.rows.map(r => r.__id);
}

async function createEmptyRecords(baseId, tableId, viewId, count, pgClient) {
  const existingIds = await getExistingRecordIds(pgClient, baseId, tableId);
  const needed = Math.max(0, count - existingIds.length);
  for (let i = 0; i < needed; i++) {
    await request('POST', '/record/create_record', { baseId, tableId, viewId });
  }
  const allIds = await getExistingRecordIds(pgClient, baseId, tableId);
  console.log(`  Records: ${existingIds.length} existing + ${needed} new = ${allIds.length} total`);
  return allIds;
}

async function seedCompanyTable(baseId, pgClient) {
  console.log('\n' + '='.repeat(50));
  console.log('TABLE 1: Enrichment - Company');
  console.log('='.repeat(50));

  const { tableId, viewId, nameField } = await createTableInBase(baseId, 'Enrichment: Company');

  console.log('\n  Creating input fields...');
  const domainField = await createField(baseId, tableId, viewId, 'Domain', 'SHORT_TEXT');
  const notesField = await createField(baseId, tableId, viewId, 'Notes', 'LONG_TEXT');

  console.log('\n  Creating enrichment field...');
  const enrichRes = await request('POST', '/field/create_enrichment_field', {
    tableId, baseId, viewId,
    name: 'Company Enrichment',
    type: 'ENRICHMENT',
    entityType: 'company',
    identifier: [{ key: 'domain', field_id: domainField.id }],
    fieldsToEnrich: [
      { key: 'name', name: 'Company Name', type: 'SHORT_TEXT' },
      { key: 'website', name: 'Company Website', type: 'SHORT_TEXT' },
      { key: 'employeeCount', name: 'Employee Count', type: 'LIST' },
      { key: 'industry', name: 'Industry', type: 'SHORT_TEXT' },
      { key: 'foundedYear', name: 'Founded Year', type: 'SHORT_TEXT' },
      { key: 'funding', name: 'Funding', type: 'SHORT_TEXT' },
      { key: 'keyPeople', name: 'Key People', type: 'LIST' },
      { key: 'techStack', name: 'Tech Stack', type: 'LIST' },
      { key: 'location', name: 'Location', type: 'SHORT_TEXT' },
      { key: 'socialLinks', name: 'Social Links', type: 'LIST' },
      { key: 'description', name: 'Description', type: 'SHORT_TEXT' },
    ],
  });
  console.log(`    Enrichment field created: id=${enrichRes.id}`);

  const allFields = await request('GET', `/field/getFields?tableId=${tableId}`);
  const fieldsByName = {};
  if (Array.isArray(allFields)) {
    allFields.forEach(f => { fieldsByName[f.name] = f; });
  }
  console.log(`    Total fields: ${Object.keys(fieldsByName).length}`);

  const count = COMPANY_DATA.length;
  console.log(`\n  Creating ${count} records...`);
  const recordIds = await createEmptyRecords(baseId, tableId, viewId, count, pgClient);

  console.log('  Populating data via SQL...');
  const schema = baseId;
  const table = tableId;
  let success = 0;

  for (let i = 0; i < recordIds.length && i < COMPANY_DATA.length; i++) {
    const d = COMPANY_DATA[i];
    const recId = recordIds[i];
    const setClauses = [];
    const params = [];
    let p = 1;

    function addText(fieldName, value) {
      const f = fieldsByName[fieldName];
      if (!f?.dbFieldName || value === null || value === undefined) return;
      setClauses.push(`"${f.dbFieldName}" = $${p}`);
      params.push(value);
      p++;
    }
    function addJsonb(fieldName, value) {
      const f = fieldsByName[fieldName];
      if (!f?.dbFieldName || value === null || value === undefined) return;
      setClauses.push(`"${f.dbFieldName}" = $${p}::jsonb`);
      params.push(JSON.stringify(value));
      p++;
    }

    addText('Name', `Company ${i + 1} - ${d.domain}`);
    addText('Domain', d.domain);

    if (i < 10) {
      addText('Notes', `Fully enriched company record for ${d.domain}`);
    } else if (i < 13) {
      addText('Notes', `Partially enriched - some data missing`);
    } else if (i < 15) {
      addText('Notes', `Pending enrichment - input only`);
    } else if (i < 18) {
      addText('Notes', `Edge case data`);
    }

    if (i < 10) {
      addText('Company Name', d.name);
      addText('Company Website', d.website);
      addJsonb('Employee Count', d.employeeCount);
      addText('Industry', d.industry);
      addText('Founded Year', d.foundedYear);
      addText('Funding', d.funding);
      addJsonb('Key People', d.keyPeople);
      addJsonb('Tech Stack', d.techStack);
      addText('Location', d.location);
      addJsonb('Social Links', d.socialLinks);
      addText('Description', d.description);
    } else if (i < 13) {
      addText('Company Name', d.name);
      addText('Industry', d.industry);
      addText('Location', d.location);
    }

    if (setClauses.length === 0) continue;
    params.push(recId);
    const sql = `UPDATE "${schema}".${table} SET ${setClauses.join(', ')} WHERE __id = $${p}`;
    try {
      const res = await pgClient.query(sql, params);
      if (res.rowCount > 0) success++;
    } catch (e) { console.log(`    X Record ${i + 1} error: ${e.message.slice(0, 200)}`); }
  }

  console.log(`  Populated ${success}/${recordIds.length} records`);
  return { tableId, viewId, recordCount: recordIds.length };
}

async function seedPersonTable(baseId, pgClient) {
  console.log('\n' + '='.repeat(50));
  console.log('TABLE 2: Enrichment - Person');
  console.log('='.repeat(50));

  const { tableId, viewId, nameField } = await createTableInBase(baseId, 'Enrichment: Person');

  console.log('\n  Creating input fields...');
  const fullNameField = await createField(baseId, tableId, viewId, 'Full Name', 'SHORT_TEXT');
  const domainField = await createField(baseId, tableId, viewId, 'Company Domain', 'SHORT_TEXT');
  const linkedinField = await createField(baseId, tableId, viewId, 'LinkedIn URL', 'SHORT_TEXT');

  console.log('\n  Creating enrichment field...');
  const enrichRes = await request('POST', '/field/create_enrichment_field', {
    tableId, baseId, viewId,
    name: 'Person Enrichment',
    type: 'ENRICHMENT',
    entityType: 'person',
    identifier: [
      { key: 'name', field_id: fullNameField.id },
      { key: 'domain', field_id: domainField.id },
      { key: 'linkedinUrl', field_id: linkedinField.id },
    ],
    fieldsToEnrich: [
      { key: 'fullName', name: 'Enriched Name', type: 'SHORT_TEXT' },
      { key: 'title', name: 'Job Title', type: 'SHORT_TEXT' },
      { key: 'company', name: 'Company', type: 'SHORT_TEXT' },
      { key: 'location', name: 'Person Location', type: 'SHORT_TEXT' },
      { key: 'bio', name: 'Bio', type: 'SHORT_TEXT' },
      { key: 'education', name: 'Education', type: 'LIST' },
    ],
  });
  console.log(`    Enrichment field created: id=${enrichRes.id}`);

  const allFields = await request('GET', `/field/getFields?tableId=${tableId}`);
  const fieldsByName = {};
  if (Array.isArray(allFields)) {
    allFields.forEach(f => { fieldsByName[f.name] = f; });
  }
  console.log(`    Total fields: ${Object.keys(fieldsByName).length}`);

  const count = PERSON_DATA.length;
  console.log(`\n  Creating ${count} records...`);
  const recordIds = await createEmptyRecords(baseId, tableId, viewId, count, pgClient);

  console.log('  Populating data via SQL...');
  const schema = baseId;
  const table = tableId;
  let success = 0;

  for (let i = 0; i < recordIds.length && i < PERSON_DATA.length; i++) {
    const d = PERSON_DATA[i];
    const recId = recordIds[i];
    const setClauses = [];
    const params = [];
    let p = 1;

    function addText(fieldName, value) {
      const f = fieldsByName[fieldName];
      if (!f?.dbFieldName || value === null || value === undefined) return;
      setClauses.push(`"${f.dbFieldName}" = $${p}`);
      params.push(value);
      p++;
    }
    function addJsonb(fieldName, value) {
      const f = fieldsByName[fieldName];
      if (!f?.dbFieldName || value === null || value === undefined) return;
      setClauses.push(`"${f.dbFieldName}" = $${p}::jsonb`);
      params.push(JSON.stringify(value));
      p++;
    }

    addText('Name', `Person ${i + 1} - ${d.fullName}`);
    addText('Full Name', d.fullName);
    addText('Company Domain', d.domain);
    if (d.linkedinUrl) addText('LinkedIn URL', d.linkedinUrl);

    if (i < 10) {
      addText('Enriched Name', d.fullName);
      addText('Job Title', d.title);
      addText('Company', d.company);
      addText('Person Location', d.personLocation);
      addText('Bio', d.bio);
      addJsonb('Education', d.education);
    } else if (i < 13) {
      addText('Enriched Name', d.fullName);
      addText('Job Title', d.title);
      addText('Company', d.company);
    }

    if (setClauses.length === 0) continue;
    params.push(recId);
    const sql = `UPDATE "${schema}".${table} SET ${setClauses.join(', ')} WHERE __id = $${p}`;
    try { await pgClient.query(sql, params); success++; } catch (e) { console.log(`    X Record ${i + 1} error: ${e.message.slice(0, 150)}`); }
  }

  console.log(`  Populated ${success}/${recordIds.length} records`);
  return { tableId, viewId, recordCount: recordIds.length };
}

async function seedEmailTable(baseId, pgClient) {
  console.log('\n' + '='.repeat(50));
  console.log('TABLE 3: Enrichment - Email');
  console.log('='.repeat(50));

  const { tableId, viewId, nameField } = await createTableInBase(baseId, 'Enrichment: Email');

  console.log('\n  Creating input fields...');
  const fullNameField = await createField(baseId, tableId, viewId, 'Full Name', 'SHORT_TEXT');
  const domainField = await createField(baseId, tableId, viewId, 'Company Domain', 'SHORT_TEXT');

  console.log('\n  Creating enrichment field...');
  const enrichRes = await request('POST', '/field/create_enrichment_field', {
    tableId, baseId, viewId,
    name: 'Email Enrichment',
    type: 'ENRICHMENT',
    entityType: 'email',
    identifier: [
      { key: 'full_name', field_id: fullNameField.id },
      { key: 'domain', field_id: domainField.id },
    ],
    fieldsToEnrich: [
      { key: 'validEmail', name: 'Email Address', type: 'SHORT_TEXT' },
    ],
  });
  console.log(`    Enrichment field created: id=${enrichRes.id}`);

  const allFields = await request('GET', `/field/getFields?tableId=${tableId}`);
  const fieldsByName = {};
  if (Array.isArray(allFields)) {
    allFields.forEach(f => { fieldsByName[f.name] = f; });
  }
  console.log(`    Total fields: ${Object.keys(fieldsByName).length}`);

  const count = EMAIL_DATA.length;
  console.log(`\n  Creating ${count} records...`);
  const recordIds = await createEmptyRecords(baseId, tableId, viewId, count, pgClient);

  console.log('  Populating data via SQL...');
  const schema = baseId;
  const table = tableId;
  let success = 0;

  for (let i = 0; i < recordIds.length && i < EMAIL_DATA.length; i++) {
    const d = EMAIL_DATA[i];
    const recId = recordIds[i];
    const setClauses = [];
    const params = [];
    let p = 1;

    function addText(fieldName, value) {
      const f = fieldsByName[fieldName];
      if (!f?.dbFieldName || value === null || value === undefined || value === '') return;
      setClauses.push(`"${f.dbFieldName}" = $${p}`);
      params.push(value);
      p++;
    }

    addText('Name', `Email ${i + 1} - ${d.fullName || '(empty)'}`);
    addText('Full Name', d.fullName);
    addText('Company Domain', d.domain);

    if (i < 15) {
      addText('Email Address', d.validEmail);
    } else if (i < 20) {
      addText('Email Address', d.validEmail);
    }

    if (setClauses.length === 0) continue;
    params.push(recId);
    const sql = `UPDATE "${schema}".${table} SET ${setClauses.join(', ')} WHERE __id = $${p}`;
    try { await pgClient.query(sql, params); success++; } catch (e) { console.log(`    X Record ${i + 1} error: ${e.message.slice(0, 150)}`); }
  }

  console.log(`  Populated ${success}/${recordIds.length} records`);
  return { tableId, viewId, recordCount: recordIds.length };
}

async function main() {
  console.log('='.repeat(60));
  console.log('ENRICHMENT TABLES SEEDER');
  console.log('='.repeat(60));

  const seedResult = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seed-result.json'), 'utf8'));
  const baseId = seedResult.baseId;
  if (!baseId) {
    console.error('No baseId found in seed-result.json. Run seed-test-data.cjs first.');
    process.exit(1);
  }
  console.log(`\nUsing existing base: ${baseId}`);

  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();
  console.log('Connected to PostgreSQL');

  try {
    const companyResult = await seedCompanyTable(baseId, pgClient);
    const personResult = await seedPersonTable(baseId, pgClient);
    const emailResult = await seedEmailTable(baseId, pgClient);

    console.log('\n' + '='.repeat(60));
    console.log('ENRICHMENT TABLES SEED COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\nBase: "TINYTable Demo"  baseId=${baseId}`);
    console.log(`\nTables Created:`);
    console.log(`  1. Enrichment: Company - ${companyResult.recordCount} records (table=${companyResult.tableId})`);
    console.log(`  2. Enrichment: Person  - ${personResult.recordCount} records (table=${personResult.tableId})`);
    console.log(`  3. Enrichment: Email   - ${emailResult.recordCount} records (table=${emailResult.tableId})`);
    console.log(`\nData Distribution per table:`);
    console.log(`  Records 1-10:  Fully enriched (all output fields populated)`);
    console.log(`  Records 11-13: Partially enriched (some output fields)`);
    console.log(`  Records 14-15: Input only (pending enrichment)`);
    console.log(`  Records 16+:   Edge cases & sparse data`);

    const config = {
      baseId,
      company: companyResult,
      person: personResult,
      email: emailResult,
    };
    fs.writeFileSync(
      path.join(__dirname, '..', 'seed-enrichment-result.json'),
      JSON.stringify(config, null, 2)
    );
    console.log('\nConfig written to seed-enrichment-result.json');

  } finally {
    await pgClient.end();
    console.log('\nPostgreSQL connection closed.');
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
