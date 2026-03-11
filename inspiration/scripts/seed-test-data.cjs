#!/usr/bin/env node
const http = require('http');

const BASE_URL = 'http://127.0.0.1:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci0wMDEiLCJ1c2VyX2lkIjoiZGV2LXVzZXItMDAxIiwibmFtZSI6IkRldiBVc2VyIiwiZW1haWwiOiJkZXZAdGlueXRhYmxlLmFwcCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTc4NDI5MiwiZXhwIjoxODAzMzIwMjkyfQ.Y7H8RDYfvzJbPW5yzXIihSVTw4Rl-rWaBfjKQGDc8MA';

let fieldOrderCounter = {};

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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
    fieldsInfo.push({ field_id: field.id, data: value });
  }

  if (fieldsInfo.length > 0) {
    const updateRes = await request('POST', '/record/update_record', {
      baseId, tableId, viewId,
      column_values: [{ row_id: recId, fields_info: fieldsInfo }],
    });
    if (updateRes?.statusCode) {
      console.log(`  X Update record ${recId} failed:`, JSON.stringify(updateRes).slice(0, 200));
    }
  }

  return recId;
}

async function main() {
  console.log('Starting TINYTable test data seeding...\n');

  // Step 1: Create a new sheet
  console.log('1. Creating sheet...');
  const sheetRes = await request('POST', '/sheet/create_sheet', {
    workspace_id: 'demo-seed',
    parent_id: '',
  });

  const baseId = sheetRes.base?.id;
  const table1Id = sheetRes.table?.id;
  const view1Id = sheetRes.view?.id;

  if (!baseId || !table1Id) {
    console.error('Failed to create sheet:', JSON.stringify(sheetRes).slice(0, 500));
    process.exit(1);
  }
  console.log(`  Sheet: baseId=${baseId}`);
  console.log(`  Table 1: id=${table1Id}, view=${view1Id}`);

  await request('PUT', '/base/update_base_sheet_name', { baseId, name: 'TINYTable Demo' });

  // Get name field info from the field table
  const fields1 = await request('GET', `/field/getFields?tableId=${table1Id}`);
  const nameField = Array.isArray(fields1) ? fields1[0] : null;
  console.log(`  Name field: id=${nameField?.id} db=${nameField?.dbFieldName}`);

  // Step 2: Create fields for Projects table
  console.log('\n2. Creating fields for Projects table...');
  const descField = await createField(baseId, table1Id, view1Id, 'Description', 'LONG_TEXT');
  const statusField = await createField(baseId, table1Id, view1Id, 'Status', 'SINGLE_SELECT', {
    choices: [
      { name: 'Planning', color: '#6366f1' },
      { name: 'In Progress', color: '#f59e0b' },
      { name: 'Review', color: '#3b82f6' },
      { name: 'Completed', color: '#22c55e' },
      { name: 'On Hold', color: '#ef4444' },
    ],
  });
  const priorityField = await createField(baseId, table1Id, view1Id, 'Priority', 'SINGLE_SELECT', {
    choices: [
      { name: 'Low', color: '#94a3b8' },
      { name: 'Medium', color: '#f59e0b' },
      { name: 'High', color: '#ef4444' },
      { name: 'Critical', color: '#dc2626' },
    ],
  });
  const budgetField = await createField(baseId, table1Id, view1Id, 'Budget', 'CURRENCY', {
    symbol: '$', precision: 0,
  });
  const startDateField = await createField(baseId, table1Id, view1Id, 'Start Date', 'DATE_TIME');
  const endDateField = await createField(baseId, table1Id, view1Id, 'End Date', 'DATE_TIME');
  const ownerEmailField = await createField(baseId, table1Id, view1Id, 'Owner Email', 'EMAIL');
  const websiteField = await createField(baseId, table1Id, view1Id, 'Website', 'URL');
  const activeField = await createField(baseId, table1Id, view1Id, 'Active', 'CHECKBOX');
  const tagsField = await createField(baseId, table1Id, view1Id, 'Tags', 'MULTI_SELECT', {
    choices: [
      { name: 'Frontend', color: '#3b82f6' },
      { name: 'Backend', color: '#22c55e' },
      { name: 'Design', color: '#a855f7' },
      { name: 'DevOps', color: '#f97316' },
      { name: 'Mobile', color: '#ec4899' },
      { name: 'AI/ML', color: '#06b6d4' },
    ],
  });
  const progressField = await createField(baseId, table1Id, view1Id, 'Progress', 'NUMBER', {
    allowNegative: false, allowFraction: false,
  });
  const phoneField = await createField(baseId, table1Id, view1Id, 'Contact Phone', 'PHONE_NUMBER');

  const projFieldMap = {
    Name: nameField,
    Description: descField,
    Status: statusField,
    Priority: priorityField,
    Budget: budgetField,
    'Start Date': startDateField,
    'End Date': endDateField,
    'Owner Email': ownerEmailField,
    Website: websiteField,
    Active: activeField,
    Tags: tagsField,
    Progress: progressField,
    'Contact Phone': phoneField,
  };

  // Step 3: Create Tasks table
  console.log('\n3. Creating Tasks table...');
  const table2Res = await request('POST', '/table/create_table', {
    baseId,
    name: 'Tasks',
  });

  // Table creation may return different formats; get the data from get_sheet
  let table2Id, view2Id;
  const sheetData = await request('POST', '/sheet/get_sheet', {
    baseId, include_views: true, include_tables: true,
  });
  const allTables = sheetData.tables || [];
  const tasksTable = allTables.find(t => t.name === 'Tasks');
  if (tasksTable) {
    table2Id = tasksTable.id;
    view2Id = tasksTable.views?.[0]?.id;
  }
  console.log(`  Tasks table: id=${table2Id}, view=${view2Id}`);

  if (!table2Id || !view2Id) {
    console.error('Failed to find Tasks table');
    process.exit(1);
  }

  // Get name field for tasks table
  const fields2 = await request('GET', `/field/getFields?tableId=${table2Id}`);
  const taskNameField = Array.isArray(fields2) ? fields2[0] : null;
  console.log(`  Task name field: id=${taskNameField?.id} db=${taskNameField?.dbFieldName}`);

  // Step 4: Create fields for Tasks table
  console.log('\n4. Creating fields for Tasks table...');
  const taskDescField = await createField(baseId, table2Id, view2Id, 'Description', 'LONG_TEXT');
  const taskStatusField = await createField(baseId, table2Id, view2Id, 'Status', 'SINGLE_SELECT', {
    choices: [
      { name: 'To Do', color: '#94a3b8' },
      { name: 'In Progress', color: '#f59e0b' },
      { name: 'Done', color: '#22c55e' },
      { name: 'Blocked', color: '#ef4444' },
    ],
  });
  const taskPriorityField = await createField(baseId, table2Id, view2Id, 'Priority', 'SINGLE_SELECT', {
    choices: [
      { name: 'Low', color: '#94a3b8' },
      { name: 'Medium', color: '#f59e0b' },
      { name: 'High', color: '#ef4444' },
    ],
  });
  const assigneeField = await createField(baseId, table2Id, view2Id, 'Assignee', 'STRING');
  const dueDateField = await createField(baseId, table2Id, view2Id, 'Due Date', 'DATE_TIME');
  const hoursField = await createField(baseId, table2Id, view2Id, 'Hours Estimated', 'NUMBER', {
    allowNegative: false, allowFraction: true,
  });
  const completedField = await createField(baseId, table2Id, view2Id, 'Completed', 'CHECKBOX');
  const taskTagsField = await createField(baseId, table2Id, view2Id, 'Labels', 'MULTI_SELECT', {
    choices: [
      { name: 'Bug', color: '#ef4444' },
      { name: 'Feature', color: '#3b82f6' },
      { name: 'Enhancement', color: '#22c55e' },
      { name: 'Documentation', color: '#94a3b8' },
      { name: 'Testing', color: '#a855f7' },
    ],
  });

  const taskFieldMap = {
    Name: taskNameField,
    Description: taskDescField,
    Status: taskStatusField,
    Priority: taskPriorityField,
    Assignee: assigneeField,
    'Due Date': dueDateField,
    'Hours Estimated': hoursField,
    Completed: completedField,
    Labels: taskTagsField,
  };

  // Step 5: Populate Projects
  console.log('\n5. Populating Projects table...');
  const projects = [
    { Name: 'Website Redesign', Description: 'Complete overhaul of the company website with modern design patterns and responsive layout', Status: 'In Progress', Priority: 'High', Budget: 45000, 'Start Date': '2026-01-15', 'End Date': '2026-04-30', 'Owner Email': 'sarah@company.com', Website: 'https://redesign.company.com', Active: true, Tags: 'Frontend,Design', Progress: 65, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550101' } },
    { Name: 'Mobile App v2', Description: 'Native mobile app rebuild with React Native for iOS and Android platforms', Status: 'Planning', Priority: 'Critical', Budget: 120000, 'Start Date': '2026-03-01', 'End Date': '2026-09-30', 'Owner Email': 'mike@company.com', Website: 'https://app.company.com', Active: true, Tags: 'Mobile,Frontend', Progress: 10, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550102' } },
    { Name: 'API Gateway', Description: 'Centralized API gateway with rate limiting, authentication, and request routing', Status: 'Completed', Priority: 'High', Budget: 30000, 'Start Date': '2025-10-01', 'End Date': '2026-01-31', 'Owner Email': 'alex@company.com', Active: false, Tags: 'Backend,DevOps', Progress: 100, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550103' } },
    { Name: 'Data Pipeline', Description: 'ETL pipeline for analytics dashboard with real-time data processing', Status: 'In Progress', Priority: 'Medium', Budget: 55000, 'Start Date': '2026-02-01', 'End Date': '2026-06-15', 'Owner Email': 'jordan@company.com', Website: 'https://data.company.com', Active: true, Tags: 'Backend,AI/ML', Progress: 40, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550104' } },
    { Name: 'Design System', Description: 'Unified component library and design tokens for all products', Status: 'Review', Priority: 'Medium', Budget: 20000, 'Start Date': '2025-11-15', 'End Date': '2026-03-01', 'Owner Email': 'emma@company.com', Website: 'https://design.company.com', Active: true, Tags: 'Frontend,Design', Progress: 85, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550105' } },
    { Name: 'CI/CD Overhaul', Description: 'Migrate from Jenkins to GitHub Actions with improved test coverage', Status: 'On Hold', Priority: 'Low', Budget: 15000, 'Start Date': '2026-04-01', 'End Date': '2026-07-31', 'Owner Email': 'chris@company.com', Active: false, Tags: 'DevOps', Progress: 5, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550106' } },
    { Name: 'ML Recommender', Description: 'Machine learning recommendation engine for personalized product suggestions', Status: 'Planning', Priority: 'High', Budget: 80000, 'Start Date': '2026-05-01', 'End Date': '2026-12-31', 'Owner Email': 'priya@company.com', Website: 'https://ml.company.com', Active: true, Tags: 'AI/ML,Backend', Progress: 0, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550107' } },
    { Name: 'Security Audit', Description: 'Comprehensive security review, penetration testing, and vulnerability assessment', Status: 'In Progress', Priority: 'Critical', Budget: 25000, 'Start Date': '2026-02-10', 'End Date': '2026-03-15', 'Owner Email': 'david@company.com', Active: true, Tags: 'DevOps,Backend', Progress: 55, 'Contact Phone': { countryCode: 'US', countryNumber: '+1', phoneNumber: '5550108' } },
  ];

  const projectIds = [];
  for (let i = 0; i < projects.length; i++) {
    const recId = await createRecordAndUpdate(baseId, table1Id, view1Id, projFieldMap, projects[i]);
    if (recId) {
      projectIds.push(recId);
      console.log(`  + Project ${i + 1}: "${projects[i].Name}" (id=${recId})`);
    }
  }

  // Step 6: Populate Tasks
  console.log('\n6. Populating Tasks table...');
  const tasks = [
    { Name: 'Design homepage mockup', Description: 'Create Figma mockups for the new homepage layout with mobile-first approach', Status: 'Done', Priority: 'High', Assignee: 'Emma', 'Due Date': '2026-02-01', 'Hours Estimated': 16, Completed: true, Labels: 'Feature,Enhancement' },
    { Name: 'Implement responsive nav', Description: 'Build responsive navigation component with mobile hamburger menu', Status: 'In Progress', Priority: 'High', Assignee: 'Sarah', 'Due Date': '2026-02-20', 'Hours Estimated': 12, Completed: false, Labels: 'Feature' },
    { Name: 'Set up API endpoints', Description: 'Create REST API endpoints for user management and authentication', Status: 'Done', Priority: 'Medium', Assignee: 'Alex', 'Due Date': '2026-01-15', 'Hours Estimated': 24, Completed: true, Labels: 'Feature' },
    { Name: 'Write unit tests', Description: 'Cover critical user flows with comprehensive Jest test suites', Status: 'In Progress', Priority: 'Medium', Assignee: 'Jordan', 'Due Date': '2026-03-01', 'Hours Estimated': 20, Completed: false, Labels: 'Testing' },
    { Name: 'Fix login bug', Description: 'Users unable to log in with SSO on Safari - affects 15% of users', Status: 'To Do', Priority: 'High', Assignee: 'David', 'Due Date': '2026-02-25', 'Hours Estimated': 4, Completed: false, Labels: 'Bug' },
    { Name: 'Update README', Description: 'Add setup instructions, API documentation, and contribution guidelines', Status: 'To Do', Priority: 'Low', Assignee: 'Chris', 'Due Date': '2026-03-10', 'Hours Estimated': 3, Completed: false, Labels: 'Documentation' },
    { Name: 'Database migration', Description: 'Migrate user table schema for v2 features - needs API gateway changes first', Status: 'Blocked', Priority: 'High', Assignee: 'Alex', 'Due Date': '2026-02-18', 'Hours Estimated': 8, Completed: false, Labels: 'Enhancement' },
    { Name: 'Performance optimization', Description: 'Optimize React render cycles, reduce bundle size, implement code splitting', Status: 'In Progress', Priority: 'Medium', Assignee: 'Sarah', 'Due Date': '2026-03-15', 'Hours Estimated': 16, Completed: false, Labels: 'Enhancement' },
    { Name: 'Design icon set', Description: 'Create custom SVG icon set matching new brand guidelines', Status: 'Done', Priority: 'Low', Assignee: 'Emma', 'Due Date': '2026-01-30', 'Hours Estimated': 10, Completed: true, Labels: 'Feature,Enhancement' },
    { Name: 'Set up monitoring', Description: 'Configure Datadog dashboards, alerts, and log aggregation', Status: 'To Do', Priority: 'Medium', Assignee: 'Chris', 'Due Date': '2026-03-20', 'Hours Estimated': 6, Completed: false, Labels: 'Enhancement' },
  ];

  const taskIds = [];
  for (let i = 0; i < tasks.length; i++) {
    const recId = await createRecordAndUpdate(baseId, table2Id, view2Id, taskFieldMap, tasks[i]);
    if (recId) {
      taskIds.push(recId);
      console.log(`  + Task ${i + 1}: "${tasks[i].Name}" (id=${recId})`);
    }
  }

  // Step 7: Add comments
  console.log('\n7. Adding sample comments...');
  const comments = [
    { tableId: table1Id, recordId: projectIds[0], content: 'Looking great! The redesign is coming along nicely. Love the new color palette.' },
    { tableId: table1Id, recordId: projectIds[0], content: 'Can we schedule a review meeting for next week to discuss the final mockups?' },
    { tableId: table1Id, recordId: projectIds[0], content: 'Updated the timeline - we should be on track for the April deadline.' },
    { tableId: table1Id, recordId: projectIds[1], content: 'The React Native approach will save us 40% development time compared to native.' },
    { tableId: table1Id, recordId: projectIds[1], content: 'Need to finalize the feature list before we start sprint planning.' },
    { tableId: table1Id, recordId: projectIds[3], content: 'Data pipeline is processing 2M records/hour now. Performance looks good.' },
    { tableId: table1Id, recordId: projectIds[7], content: 'Found 3 critical vulnerabilities. Creating tickets for immediate fixes.' },
    { tableId: table1Id, recordId: projectIds[7], content: 'All critical issues have been patched. Moving to medium-severity items.' },
  ];

  if (taskIds[0]) comments.push({ tableId: table2Id, recordId: taskIds[0], content: 'Mockup approved by the design team! Ready for implementation.' });
  if (taskIds[4]) comments.push({ tableId: table2Id, recordId: taskIds[4], content: 'This is affecting 15% of Safari users. Bumping priority to High.' });
  if (taskIds[6]) comments.push({ tableId: table2Id, recordId: taskIds[6], content: 'Blocked on the API changes from the gateway project. Need Alex to unblock.' });

  for (const c of comments) {
    if (!c.recordId) { console.log('  X Skipping comment (no recordId)'); continue; }
    const res = await request('POST', '/comment/create', {
      tableId: c.tableId,
      recordId: String(c.recordId),
      content: c.content,
      baseId,
    });
    if (res.id) {
      console.log(`  + Comment on record ${c.recordId}: "${c.content.slice(0, 50)}..."`);
    } else {
      console.log(`  X Comment failed:`, JSON.stringify(res).slice(0, 200));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SEED COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\nSheet: "TINYTable Demo"  baseId=${baseId}`);
  console.log(`Projects: ${table1Id} (${projectIds.length} records), view=${view1Id}`);
  console.log(`Tasks: ${table2Id} (${taskIds.length} records), view=${view2Id}`);
  console.log(`Comments: ${comments.length} added`);

  // Write config for frontend
  const config = {
    baseId, table1Id, view1Id, table2Id, view2Id,
    projectRecordIds: projectIds,
    taskRecordIds: taskIds,
  };
  require('fs').writeFileSync(
    require('path').join(__dirname, '..', 'seed-result.json'),
    JSON.stringify(config, null, 2)
  );
  console.log('\nConfig written to seed-result.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
