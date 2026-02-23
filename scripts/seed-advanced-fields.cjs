#!/usr/bin/env node
const http = require('http');
const { Client } = require('pg');

const fs = require('fs');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci0wMDEiLCJ1c2VyX2lkIjoiZGV2LXVzZXItMDAxIiwibmFtZSI6IkRldiBVc2VyIiwiZW1haWwiOiJkZXZAdGlueXRhYmxlLmFwcCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTc4NDI5MiwiZXhwIjoxODAzMzIwMjkyfQ.Y7H8RDYfvzJbPW5yzXIihSVTw4Rl-rWaBfjKQGDc8MA';

const seedResult = JSON.parse(fs.readFileSync('./seed-result.json', 'utf8'));
const BASE_ID = seedResult.baseId;
const PROJECTS_TABLE_ID = seedResult.table1Id;
const PROJECTS_VIEW_ID = seedResult.view1Id;
const TASKS_TABLE_ID = seedResult.table2Id;
const TASKS_VIEW_ID = seedResult.view2Id;

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': TOKEN,
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();
  console.log('Connected to PostgreSQL\n');

  try {
    // =========================================================================
    // Step 1: Create Link field on Tasks table (ManyOne → Projects)
    // =========================================================================
    console.log('=== Step 1: Create Link field "Project" on Tasks table ===');
    const linkRes = await apiPost('/field/create_field', {
      baseId: BASE_ID,
      tableId: TASKS_TABLE_ID,
      viewId: TASKS_VIEW_ID,
      name: 'Project',
      type: 'LINK',
      order: 10,
      options: {
        relationship: 'ManyOne',
        foreignTableId: PROJECTS_TABLE_ID,
        isOneWay: false,
      },
    });
    console.log('Link field response:', JSON.stringify(linkRes, null, 2));

    if (linkRes.id && linkRes.options) {
      const { foreignKeyName, fkHostTableName } = linkRes.options;
      console.log(`  foreignKeyName: ${foreignKeyName}`);
      console.log(`  fkHostTableName: ${fkHostTableName}`);

      // =========================================================================
      // Step 2: Populate link data via SQL
      // =========================================================================
      console.log('\n=== Step 2: Populate link FK data ===');
      const [schemaName, tableName] = fkHostTableName.split('.');

      const linkAssignments = [
        { taskIds: [4, 5], projectId: 6 },
        { taskIds: [6, 7], projectId: 7 },
        { taskIds: [8, 9], projectId: 8 },
        { taskIds: [10], projectId: 9 },
        { taskIds: [11], projectId: 10 },
        { taskIds: [12, 13], projectId: 12 },
      ];

      for (const { taskIds, projectId } of linkAssignments) {
        for (const taskId of taskIds) {
          const sql = `UPDATE "${schemaName}".${tableName} SET "${foreignKeyName}" = $1 WHERE __id = $2`;
          try {
            await pgClient.query(sql, [projectId, taskId]);
            console.log(`  Task ${taskId} → Project ${projectId}`);
          } catch (err) {
            console.error(`  Error linking task ${taskId}:`, err.message);
          }
        }
      }
    } else {
      console.error('  Link field creation failed or missing options');
    }

    // =========================================================================
    // Step 3: Create system fields on Projects table
    // =========================================================================
    console.log('\n=== Step 3: Create system fields on Projects table ===');

    console.log('\n3a. CreatedBy field...');
    const createdByRes = await apiPost('/field/create_field', {
      baseId: BASE_ID,
      tableId: PROJECTS_TABLE_ID,
      viewId: PROJECTS_VIEW_ID,
      name: 'Created By',
      type: 'CREATED_BY',
      order: 14,
    });
    console.log('  Result:', createdByRes.id ? `id=${createdByRes.id}` : JSON.stringify(createdByRes));

    console.log('\n3b. LastModifiedBy field...');
    const lastModByRes = await apiPost('/field/create_field', {
      baseId: BASE_ID,
      tableId: PROJECTS_TABLE_ID,
      viewId: PROJECTS_VIEW_ID,
      name: 'Last Modified By',
      type: 'LAST_MODIFIED_BY',
      order: 15,
    });
    console.log('  Result:', lastModByRes.id ? `id=${lastModByRes.id}` : JSON.stringify(lastModByRes));

    console.log('\n3c. LastModifiedTime field...');
    const lastModTimeRes = await apiPost('/field/create_field', {
      baseId: BASE_ID,
      tableId: PROJECTS_TABLE_ID,
      viewId: PROJECTS_VIEW_ID,
      name: 'Last Modified',
      type: 'LAST_MODIFIED_TIME',
      order: 16,
    });
    console.log('  Result:', lastModTimeRes.id ? `id=${lastModTimeRes.id}` : JSON.stringify(lastModTimeRes));

    console.log('\n3d. AutoNumber field...');
    const autoNumRes = await apiPost('/field/create_field', {
      baseId: BASE_ID,
      tableId: PROJECTS_TABLE_ID,
      viewId: PROJECTS_VIEW_ID,
      name: 'Auto #',
      type: 'AUTO_NUMBER',
      order: 17,
    });
    console.log('  Result:', autoNumRes.id ? `id=${autoNumRes.id}` : JSON.stringify(autoNumRes));

    // =========================================================================
    // Step 4: Create User field on Projects table + populate
    // =========================================================================
    console.log('\n=== Step 4: Create User field "Assigned To" on Projects table ===');
    const userFieldRes = await apiPost('/field/create_field', {
      baseId: BASE_ID,
      tableId: PROJECTS_TABLE_ID,
      viewId: PROJECTS_VIEW_ID,
      name: 'Assigned To',
      type: 'USER',
      order: 18,
    });
    console.log('  Result:', userFieldRes.id ? `id=${userFieldRes.id}, dbFieldName=${userFieldRes.dbFieldName}` : JSON.stringify(userFieldRes));

    if (userFieldRes.id && userFieldRes.dbFieldName) {
      console.log('\n  Populating User field data...');
      const userDbCol = userFieldRes.dbFieldName;
      const projSchema = BASE_ID;
      const projTable = PROJECTS_TABLE_ID;

      const userAssignments = [
        { recordId: 6, user: { id: 'dev-user-001', title: 'Dev User', email: 'dev@tinytable.app', avatarUrl: '' } },
        { recordId: 7, user: { id: 'user-alice', title: 'Alice Chen', email: 'alice@tinytable.app', avatarUrl: '' } },
        { recordId: 8, user: { id: 'user-bob', title: 'Bob Smith', email: 'bob@tinytable.app', avatarUrl: '' } },
        { recordId: 9, user: { id: 'user-carol', title: 'Carol Lee', email: 'carol@tinytable.app', avatarUrl: '' } },
        { recordId: 10, user: { id: 'user-alice', title: 'Alice Chen', email: 'alice@tinytable.app', avatarUrl: '' } },
        { recordId: 11, user: { id: 'user-dave', title: 'Dave Patel', email: 'dave@tinytable.app', avatarUrl: '' } },
        { recordId: 12, user: { id: 'user-bob', title: 'Bob Smith', email: 'bob@tinytable.app', avatarUrl: '' } },
        { recordId: 13, user: { id: 'dev-user-001', title: 'Dev User', email: 'dev@tinytable.app', avatarUrl: '' } },
      ];

      for (const { recordId, user } of userAssignments) {
        const sql = `UPDATE "${projSchema}".${projTable} SET "${userDbCol}" = $1::jsonb WHERE __id = $2`;
        try {
          await pgClient.query(sql, [JSON.stringify(user), recordId]);
          console.log(`    Record ${recordId} → ${user.title}`);
        } catch (err) {
          console.error(`    Error setting user for record ${recordId}:`, err.message);
        }
      }
    }

    // =========================================================================
    // Step 5: Create Button field on Projects table + populate
    // =========================================================================
    console.log('\n=== Step 5: Create Button field "Open" on Projects table ===');
    const buttonFieldRes = await apiPost('/field/create_field', {
      baseId: BASE_ID,
      tableId: PROJECTS_TABLE_ID,
      viewId: PROJECTS_VIEW_ID,
      name: 'Open',
      type: 'BUTTON',
      order: 19,
    });
    console.log('  Result:', buttonFieldRes.id ? `id=${buttonFieldRes.id}, dbFieldName=${buttonFieldRes.dbFieldName}` : JSON.stringify(buttonFieldRes));

    if (buttonFieldRes.id && buttonFieldRes.dbFieldName) {
      console.log('\n  Populating Button field data...');
      const btnDbCol = buttonFieldRes.dbFieldName;
      const projSchema = BASE_ID;
      const projTable = PROJECTS_TABLE_ID;
      const buttonData = JSON.stringify({ label: 'Open', color: '#39A380', clickCount: 0 });

      for (let recordId = 6; recordId <= 13; recordId++) {
        const sql = `UPDATE "${projSchema}".${projTable} SET "${btnDbCol}" = $1::jsonb WHERE __id = $2`;
        try {
          await pgClient.query(sql, [buttonData, recordId]);
          console.log(`    Record ${recordId} → Button set`);
        } catch (err) {
          console.error(`    Error setting button for record ${recordId}:`, err.message);
        }
      }
    }

    // =========================================================================
    // Step 6: Populate system field data (__created_by, __last_updated_by, __auto_number)
    // =========================================================================
    console.log('\n=== Step 6: Populate system field data on Projects table ===');
    const projSchema = BASE_ID;
    const projTable = PROJECTS_TABLE_ID;

    const createdByAssignments = [
      { recordId: 6, user: { id: 'dev-user-001', title: 'Dev User', email: 'dev@tinytable.app', avatarUrl: '' } },
      { recordId: 7, user: { id: 'user-alice', title: 'Alice Chen', email: 'alice@tinytable.app', avatarUrl: '' } },
      { recordId: 8, user: { id: 'user-bob', title: 'Bob Smith', email: 'bob@tinytable.app', avatarUrl: '' } },
      { recordId: 9, user: { id: 'user-carol', title: 'Carol Lee', email: 'carol@tinytable.app', avatarUrl: '' } },
      { recordId: 10, user: { id: 'user-alice', title: 'Alice Chen', email: 'alice@tinytable.app', avatarUrl: '' } },
      { recordId: 11, user: { id: 'user-dave', title: 'Dave Patel', email: 'dave@tinytable.app', avatarUrl: '' } },
      { recordId: 12, user: { id: 'user-bob', title: 'Bob Smith', email: 'bob@tinytable.app', avatarUrl: '' } },
      { recordId: 13, user: { id: 'dev-user-001', title: 'Dev User', email: 'dev@tinytable.app', avatarUrl: '' } },
    ];

    const lastUpdatedByAssignments = [
      { recordId: 6, user: { id: 'user-alice', title: 'Alice Chen', email: 'alice@tinytable.app', avatarUrl: '' } },
      { recordId: 7, user: { id: 'dev-user-001', title: 'Dev User', email: 'dev@tinytable.app', avatarUrl: '' } },
      { recordId: 8, user: { id: 'user-carol', title: 'Carol Lee', email: 'carol@tinytable.app', avatarUrl: '' } },
      { recordId: 9, user: { id: 'user-bob', title: 'Bob Smith', email: 'bob@tinytable.app', avatarUrl: '' } },
      { recordId: 10, user: { id: 'user-dave', title: 'Dave Patel', email: 'dave@tinytable.app', avatarUrl: '' } },
      { recordId: 11, user: { id: 'user-alice', title: 'Alice Chen', email: 'alice@tinytable.app', avatarUrl: '' } },
      { recordId: 12, user: { id: 'dev-user-001', title: 'Dev User', email: 'dev@tinytable.app', avatarUrl: '' } },
      { recordId: 13, user: { id: 'user-carol', title: 'Carol Lee', email: 'carol@tinytable.app', avatarUrl: '' } },
    ];

    console.log('\n  Setting __created_by...');
    for (const { recordId, user } of createdByAssignments) {
      const sql = `UPDATE "${projSchema}".${projTable} SET "__created_by" = $1::jsonb WHERE __id = $2`;
      try {
        await pgClient.query(sql, [JSON.stringify(user), recordId]);
        console.log(`    Record ${recordId} → ${user.title}`);
      } catch (err) {
        console.error(`    Error:`, err.message);
      }
    }

    console.log('\n  Setting __last_updated_by...');
    for (const { recordId, user } of lastUpdatedByAssignments) {
      const sql = `UPDATE "${projSchema}".${projTable} SET "__last_updated_by" = $1::jsonb WHERE __id = $2`;
      try {
        await pgClient.query(sql, [JSON.stringify(user), recordId]);
        console.log(`    Record ${recordId} → ${user.title}`);
      } catch (err) {
        console.error(`    Error:`, err.message);
      }
    }

    console.log('\n  Setting __auto_number (1-8 for records 6-13)...');
    for (let i = 0; i < 8; i++) {
      const recordId = 6 + i;
      const autoNum = i + 1;
      const sql = `UPDATE "${projSchema}".${projTable} SET "__auto_number" = $1 WHERE __id = $2`;
      try {
        await pgClient.query(sql, [autoNum, recordId]);
        console.log(`    Record ${recordId} → Auto# ${autoNum}`);
      } catch (err) {
        console.error(`    Error:`, err.message);
      }
    }

    console.log('\n  Setting __last_modified_time...');
    for (let i = 0; i < 8; i++) {
      const recordId = 6 + i;
      const daysAgo = 7 - i;
      const sql = `UPDATE "${projSchema}".${projTable} SET "__last_modified_time" = NOW() - INTERVAL '${daysAgo} days' WHERE __id = $1`;
      try {
        await pgClient.query(sql, [recordId]);
        console.log(`    Record ${recordId} → ${daysAgo} days ago`);
      } catch (err) {
        console.error(`    Error:`, err.message);
      }
    }

    // =========================================================================
    // Done
    // =========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('ADVANCED FIELDS SEED COMPLETE!');
    console.log('='.repeat(60));

  } finally {
    await pgClient.end();
    console.log('\nPostgreSQL connection closed.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
