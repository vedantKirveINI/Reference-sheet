export interface TemplateField {
  name: string;
  type: string;
  options?: Record<string, any>;
}

export interface TableTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: TemplateField[];
}

export const TABLE_TEMPLATES: TableTemplate[] = [
  {
    id: 'crm-contacts',
    name: 'CRM Contacts',
    icon: 'Users',
    description: 'Track people, companies, and relationships',
    fields: [
      { name: 'Email', type: 'SHORT_TEXT' },
      { name: 'Company', type: 'SHORT_TEXT' },
      { name: 'Phone', type: 'SHORT_TEXT' },
      { name: 'Status', type: 'SHORT_TEXT' },
      { name: 'Last Contact', type: 'DATE' },
    ],
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    icon: 'TrendingUp',
    description: 'Manage deals from lead to close',
    fields: [
      { name: 'Company', type: 'SHORT_TEXT' },
      { name: 'Value', type: 'NUMBER', options: { allowNegative: false, allowFraction: true } },
      { name: 'Stage', type: 'SHORT_TEXT' },
      { name: 'Close Date', type: 'DATE' },
      { name: 'Owner', type: 'SHORT_TEXT' },
    ],
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    icon: 'Calendar',
    description: 'Plan and schedule content across channels',
    fields: [
      { name: 'Type', type: 'SHORT_TEXT' },
      { name: 'Status', type: 'SHORT_TEXT' },
      { name: 'Publish Date', type: 'DATE' },
      { name: 'Channel', type: 'SHORT_TEXT' },
      { name: 'Author', type: 'SHORT_TEXT' },
    ],
  },
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    icon: 'CheckSquare',
    description: 'Organize tasks, deadlines, and assignments',
    fields: [
      { name: 'Assignee', type: 'SHORT_TEXT' },
      { name: 'Priority', type: 'SHORT_TEXT' },
      { name: 'Status', type: 'SHORT_TEXT' },
      { name: 'Due Date', type: 'DATE' },
    ],
  },
  {
    id: 'bug-tracker',
    name: 'Bug Tracker',
    icon: 'Bug',
    description: 'Log and resolve issues systematically',
    fields: [
      { name: 'Severity', type: 'SHORT_TEXT' },
      { name: 'Status', type: 'SHORT_TEXT' },
      { name: 'Assignee', type: 'SHORT_TEXT' },
      { name: 'Reporter', type: 'SHORT_TEXT' },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: 'Package',
    description: 'Track stock, pricing, and suppliers',
    fields: [
      { name: 'SKU', type: 'SHORT_TEXT' },
      { name: 'Category', type: 'SHORT_TEXT' },
      { name: 'Quantity', type: 'NUMBER', options: { allowNegative: false, allowFraction: false } },
      { name: 'Price', type: 'NUMBER', options: { allowNegative: false, allowFraction: true } },
      { name: 'Supplier', type: 'SHORT_TEXT' },
    ],
  },
];
