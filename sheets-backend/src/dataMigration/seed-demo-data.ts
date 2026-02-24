import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://127.0.0.1:3000';
const JWT_SECRET = 'hockeystick';

const token = jwt.sign(
  {
    sub: 'dev-user-001',
    user_id: 'dev-user-001',
    name: 'Dev User',
    email: 'dev@tinytable.app',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  },
  JWT_SECRET,
);

const api = axios.create({
  baseURL: API_BASE,
  headers: { token, 'Content-Type': 'application/json' },
});

const COMPANIES = [
  { name: 'Stripe', email: 'team@stripe.com', website: 'stripe.com', industry: 'Fintech', status: 'Active', employees: 8000, revenue: '$14B', founded: '2010', city: 'San Francisco', rating: 5 },
  { name: 'Notion', email: 'hello@notion.so', website: 'notion.so', industry: 'Productivity', status: 'Active', employees: 800, revenue: '$2B', founded: '2013', city: 'San Francisco', rating: 5 },
  { name: 'Figma', email: 'support@figma.com', website: 'figma.com', industry: 'Design', status: 'Active', employees: 1200, revenue: '$600M', founded: '2012', city: 'San Francisco', rating: 4 },
  { name: 'Linear', email: 'team@linear.app', website: 'linear.app', industry: 'Dev Tools', status: 'Active', employees: 100, revenue: '$50M', founded: '2019', city: 'San Francisco', rating: 5 },
  { name: 'Vercel', email: 'hello@vercel.com', website: 'vercel.com', industry: 'Infrastructure', status: 'Active', employees: 500, revenue: '$250M', founded: '2015', city: 'San Francisco', rating: 4 },
  { name: 'Airtable', email: 'support@airtable.com', website: 'airtable.com', industry: 'Productivity', status: 'Active', employees: 900, revenue: '$500M', founded: '2012', city: 'San Francisco', rating: 4 },
  { name: 'Supabase', email: 'team@supabase.io', website: 'supabase.com', industry: 'Infrastructure', status: 'Active', employees: 200, revenue: '$80M', founded: '2020', city: 'Singapore', rating: 4 },
  { name: 'Resend', email: 'hello@resend.com', website: 'resend.com', industry: 'Dev Tools', status: 'Active', employees: 30, revenue: '$10M', founded: '2022', city: 'San Francisco', rating: 3 },
  { name: 'Retool', email: 'team@retool.com', website: 'retool.com', industry: 'Dev Tools', status: 'Active', employees: 500, revenue: '$200M', founded: '2017', city: 'San Francisco', rating: 4 },
  { name: 'PostHog', email: 'hey@posthog.com', website: 'posthog.com', industry: 'Analytics', status: 'Active', employees: 80, revenue: '$40M', founded: '2020', city: 'London', rating: 4 },
  { name: 'Dbt Labs', email: 'info@dbtlabs.com', website: 'getdbt.com', industry: 'Data', status: 'Active', employees: 600, revenue: '$300M', founded: '2016', city: 'Philadelphia', rating: 4 },
  { name: 'Loom', email: 'team@loom.com', website: 'loom.com', industry: 'Productivity', status: 'Acquired', employees: 300, revenue: '$150M', founded: '2015', city: 'San Francisco', rating: 3 },
  { name: 'Mercury', email: 'support@mercury.com', website: 'mercury.com', industry: 'Fintech', status: 'Active', employees: 400, revenue: '$160M', founded: '2019', city: 'San Francisco', rating: 4 },
  { name: 'Cal.com', email: 'hello@cal.com', website: 'cal.com', industry: 'Productivity', status: 'Active', employees: 50, revenue: '$15M', founded: '2021', city: 'Remote', rating: 3 },
  { name: 'Railway', email: 'team@railway.app', website: 'railway.app', industry: 'Infrastructure', status: 'Active', employees: 40, revenue: '$20M', founded: '2020', city: 'San Francisco', rating: 3 },
];

const CONTACTS = [
  { name: 'Patrick Collison', email: 'patrick@stripe.com', company: 'Stripe', role: 'CEO', status: 'Lead', phone: '+1-415-555-0101', linkedin: 'linkedin.com/in/patrickcollison', 'last contact': '2026-02-15', source: 'Conference' },
  { name: 'Ivan Zhao', email: 'ivan@notion.so', company: 'Notion', role: 'CEO', status: 'Customer', phone: '+1-415-555-0102', linkedin: 'linkedin.com/in/ivanzhao', 'last contact': '2026-02-10', source: 'Inbound' },
  { name: 'Dylan Field', email: 'dylan@figma.com', company: 'Figma', role: 'CEO', status: 'Lead', phone: '+1-415-555-0103', linkedin: 'linkedin.com/in/dylanfield', 'last contact': '2026-01-28', source: 'Referral' },
  { name: 'Karri Saarinen', email: 'karri@linear.app', company: 'Linear', role: 'CEO', status: 'Customer', phone: '+1-415-555-0104', linkedin: 'linkedin.com/in/karrisaarinen', 'last contact': '2026-02-20', source: 'Outbound' },
  { name: 'Guillermo Rauch', email: 'guillermo@vercel.com', company: 'Vercel', role: 'CEO', status: 'Lead', phone: '+1-415-555-0105', linkedin: 'linkedin.com/in/guillermorauch', 'last contact': '2026-02-01', source: 'Conference' },
  { name: 'Howie Liu', email: 'howie@airtable.com', company: 'Airtable', role: 'CEO', status: 'Churned', phone: '+1-415-555-0106', linkedin: 'linkedin.com/in/howieliu', 'last contact': '2025-12-10', source: 'Inbound' },
  { name: 'Paul Copplestone', email: 'paul@supabase.io', company: 'Supabase', role: 'CEO', status: 'Customer', phone: '+65-9555-0107', linkedin: 'linkedin.com/in/paulcopplestone', 'last contact': '2026-02-18', source: 'Community' },
  { name: 'Zeno Rocha', email: 'zeno@resend.com', company: 'Resend', role: 'CEO', status: 'Lead', phone: '+1-415-555-0108', linkedin: 'linkedin.com/in/zenorocha', 'last contact': '2026-02-05', source: 'Twitter' },
  { name: 'David Hsu', email: 'david@retool.com', company: 'Retool', role: 'CEO', status: 'Customer', phone: '+1-415-555-0109', linkedin: 'linkedin.com/in/davidhsu', 'last contact': '2026-01-20', source: 'Outbound' },
  { name: 'James Hawkins', email: 'james@posthog.com', company: 'PostHog', role: 'CEO', status: 'Lead', phone: '+44-20-5555-0110', linkedin: 'linkedin.com/in/jameshawkins', 'last contact': '2026-02-12', source: 'Community' },
];

const DEALS = [
  { name: 'Stripe Enterprise', company: 'Stripe', stage: 'Negotiation', 'deal size': '$50,000', probability: 80, owner: 'Alice Chen', 'close date': '2026-03-15', notes: 'Annual contract renewal with upsell' },
  { name: 'Notion Team Plan', company: 'Notion', stage: 'Won', 'deal size': '$25,000', probability: 100, owner: 'Bob Smith', 'close date': '2026-02-01', notes: 'Closed! 50 seats' },
  { name: 'Linear Scale', company: 'Linear', stage: 'Proposal', 'deal size': '$15,000', probability: 60, owner: 'Alice Chen', 'close date': '2026-04-01', notes: 'Sent proposal, awaiting feedback' },
  { name: 'Vercel Pro', company: 'Vercel', stage: 'Discovery', 'deal size': '$35,000', probability: 30, owner: 'Carol Davis', 'close date': '2026-05-01', notes: 'Initial demo scheduled' },
  { name: 'PostHog Growth', company: 'PostHog', stage: 'Negotiation', 'deal size': '$20,000', probability: 75, owner: 'Bob Smith', 'close date': '2026-03-20', notes: 'Pricing discussion ongoing' },
  { name: 'Supabase Pro', company: 'Supabase', stage: 'Won', 'deal size': '$18,000', probability: 100, owner: 'Alice Chen', 'close date': '2026-01-15', notes: 'Annual plan signed' },
  { name: 'Retool Enterprise', company: 'Retool', stage: 'Proposal', 'deal size': '$40,000', probability: 50, owner: 'Carol Davis', 'close date': '2026-04-15', notes: 'Custom integration needed' },
  { name: 'Mercury Banking', company: 'Mercury', stage: 'Lost', 'deal size': '$30,000', probability: 0, owner: 'Bob Smith', 'close date': '2026-01-30', notes: 'Went with competitor' },
];

async function getDefaultViewId(baseId: string, tableId: string): Promise<string> {
  const res = await api.post('/view/get_views', { baseId, tableId });
  const views = res.data?.data || res.data || [];
  return views[0]?.id;
}

async function createFields(baseId: string, tableId: string, viewId: string, fields: { name: string; type: string; options?: any }[]) {
  for (const field of fields) {
    try {
      const payload: any = {
        baseId,
        tableId,
        viewId,
        name: field.name,
        type: field.type,
      };
      if (field.options) payload.options = field.options;
      if (field.type === 'NUMBER' && !field.options) {
        payload.options = { allowNegative: false, allowFraction: true };
      }
      await api.post('/field/create_field', payload);
    } catch (e: any) {
      console.log(`  Field "${field.name}" failed:`, e?.response?.data?.message || e.message);
    }
  }
}

async function getFieldMap(baseId: string, tableId: string): Promise<Record<string, number>> {
  const res = await api.get('/field/getFields', { params: { tableId, baseId } });
  const fields = res.data?.data || res.data || [];
  const map: Record<string, number> = {};
  for (const f of fields) {
    map[(f.name || '').toLowerCase()] = f.id;
  }
  return map;
}

async function insertRecords(
  baseId: string,
  tableId: string,
  viewId: string,
  fieldMap: Record<string, number>,
  rows: Record<string, any>[],
) {
  for (const row of rows) {
    const fields_info: { field_id: number; data: any }[] = [];
    for (const [key, val] of Object.entries(row)) {
      const fieldId = fieldMap[key.toLowerCase()];
      if (fieldId && val !== undefined) {
        fields_info.push({ field_id: fieldId, data: String(val) });
      }
    }
    try {
      await api.post('/record/create_record', { baseId, tableId, viewId, fields_info });
    } catch (e: any) {
      console.log(`  Record insert failed:`, e?.response?.data?.message || e.message);
    }
  }
}

async function createTableWithFields(
  baseId: string,
  tableName: string,
  fieldDefs: { name: string; type: string }[],
): Promise<{ tableId: string; viewId: string }> {
  const res = await api.post('/table/create_table', { baseId, name: tableName, user_id: 'dev-user-001' });
  const data = res.data?.data || res.data;
  const tableId = data?.id || data?.table?.id;
  if (!tableId) {
    console.log('  create_table response:', JSON.stringify(data).substring(0, 300));
    throw new Error(`Failed to get tableId from create_table response`);
  }
  const viewId = await getDefaultViewId(baseId, tableId);
  console.log(`   Table "${tableName}": ${tableId}, View: ${viewId}`);

  await createFields(baseId, tableId, viewId, fieldDefs);

  try {
    const recRes = await api.post('/record/get_records', { baseId, tableId, viewId, offset: 0, limit: 10 });
    const emptyIds = (recRes.data?.records || [])
      .filter((r: any) => r.__status === 'active')
      .map((r: any) => ({ __id: r.__id, __status: 'inactive' as const }));
    if (emptyIds.length > 0) {
      await api.put('/record/update_records_status', { baseId, tableId, viewId, records: emptyIds });
    }
  } catch (_) {}

  return { tableId, viewId };
}

async function seed() {
  console.log('=== TINYTable Demo Data Seed ===\n');

  console.log('1. Creating sheet...');
  const sheetRes = await api.post('/sheet/create_sheet', {
    workspace_id: 'demo-seed',
    parent_id: '',
  });
  const sheet = sheetRes.data?.data || sheetRes.data;
  const baseId = sheet.base?.id;
  const table1Id = sheet.table?.id;
  const view1Id = sheet.table?.views?.[0]?.id || sheet.view?.id;
  console.log(`   Base: ${baseId}`);
  console.log(`   Table 1 (default): ${table1Id}, View: ${view1Id}`);

  console.log('\n2. Renaming sheet and table...');
  try {
    await api.put('/base/update_base_sheet_name', { id: baseId, name: 'GTM Workspace' });
    console.log('   Sheet renamed to "GTM Workspace"');
  } catch (e: any) {
    console.log('   Sheet rename skipped:', e?.response?.data?.message || e.message);
  }
  try {
    await api.put('/table/update_table', { id: table1Id, baseId, name: 'Companies' });
    console.log('   Table 1 renamed to "Companies"');
  } catch (e: any) {
    console.log('   Table rename skipped:', e?.response?.data?.message || e.message);
  }

  console.log('\n2b. Removing default empty records...');
  try {
    await api.put('/record/update_records_status', {
      baseId, tableId: table1Id, viewId: view1Id,
      records: [1, 2, 3, 4, 5].map(id => ({ __id: id, __status: 'inactive' })),
    });
    console.log('   Removed 5 default empty records');
  } catch (e: any) {
    console.log('   Could not remove default records:', e?.response?.data?.message || e.message);
  }

  console.log('\n3. Creating fields for Companies...');
  await createFields(baseId, table1Id, view1Id, [
    { name: 'Email', type: 'EMAIL' },
    { name: 'Website', type: 'URL' },
    { name: 'Industry', type: 'SHORT_TEXT' },
    { name: 'Status', type: 'SHORT_TEXT' },
    { name: 'Employees', type: 'NUMBER' },
    { name: 'Revenue', type: 'SHORT_TEXT' },
    { name: 'Founded', type: 'SHORT_TEXT' },
    { name: 'City', type: 'SHORT_TEXT' },
    { name: 'Rating', type: 'NUMBER' },
  ]);

  console.log('\n4. Inserting company records...');
  const fieldMap1 = await getFieldMap(baseId, table1Id);
  console.log('   Fields:', Object.keys(fieldMap1).join(', '));
  await insertRecords(baseId, table1Id, view1Id, fieldMap1, COMPANIES);
  console.log(`   Done: ${COMPANIES.length} companies`);

  console.log('\n5. Creating Contacts table...');
  const { tableId: table2Id, viewId: view2Id } = await createTableWithFields(baseId, 'Contacts', [
    { name: 'Email', type: 'EMAIL' },
    { name: 'Company', type: 'SHORT_TEXT' },
    { name: 'Role', type: 'SHORT_TEXT' },
    { name: 'Status', type: 'SHORT_TEXT' },
    { name: 'Phone', type: 'PHONE' },
    { name: 'LinkedIn', type: 'URL' },
    { name: 'Last Contact', type: 'SHORT_TEXT' },
    { name: 'Source', type: 'SHORT_TEXT' },
  ]);

  console.log('\n6. Inserting contact records...');
  const fieldMap2 = await getFieldMap(baseId, table2Id);
  await insertRecords(baseId, table2Id, view2Id, fieldMap2, CONTACTS);
  console.log(`   Done: ${CONTACTS.length} contacts`);

  console.log('\n7. Creating Pipeline table...');
  const { tableId: table3Id, viewId: view3Id } = await createTableWithFields(baseId, 'Pipeline', [
    { name: 'Company', type: 'SHORT_TEXT' },
    { name: 'Stage', type: 'SHORT_TEXT' },
    { name: 'Deal Size', type: 'SHORT_TEXT' },
    { name: 'Probability', type: 'NUMBER' },
    { name: 'Owner', type: 'SHORT_TEXT' },
    { name: 'Close Date', type: 'SHORT_TEXT' },
    { name: 'Notes', type: 'LONG_TEXT' },
  ]);

  console.log('\n8. Inserting pipeline deals...');
  const fieldMap3 = await getFieldMap(baseId, table3Id);
  await insertRecords(baseId, table3Id, view3Id, fieldMap3, DEALS);
  console.log(`   Done: ${DEALS.length} deals`);

  console.log('\n=== Seed complete! ===');
  console.log(`Base ID: ${baseId}`);
  console.log(`Tables: Companies (${table1Id}), Contacts (${table2Id}), Pipeline (${table3Id})`);
}

seed().catch((err) => {
  console.error('Seed failed:', err?.response?.data || err.message);
  process.exit(1);
});
