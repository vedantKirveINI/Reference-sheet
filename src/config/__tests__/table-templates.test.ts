import { describe, it, expect } from 'vitest';
import { TABLE_TEMPLATES } from '../table-templates';

describe('TABLE_TEMPLATES', () => {
  it('has 6 templates', () => {
    expect(TABLE_TEMPLATES.length).toBe(6);
  });

  it('each template has required properties', () => {
    TABLE_TEMPLATES.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(Array.isArray(t.fields)).toBe(true);
      expect(t.fields.length).toBeGreaterThan(0);
    });
  });

  it('each field has name and type', () => {
    TABLE_TEMPLATES.forEach(t => {
      t.fields.forEach(f => {
        expect(f.name).toBeTruthy();
        expect(f.type).toBeTruthy();
      });
    });
  });

  describe('CRM Contacts', () => {
    const crm = TABLE_TEMPLATES.find(t => t.id === 'crm-contacts')!;

    it('exists', () => {
      expect(crm).toBeDefined();
      expect(crm.name).toBe('CRM Contacts');
    });

    it('has correct fields', () => {
      const fieldNames = crm.fields.map(f => f.name);
      expect(fieldNames).toContain('Email');
      expect(fieldNames).toContain('Company');
      expect(fieldNames).toContain('Phone');
      expect(fieldNames).toContain('Status');
      expect(fieldNames).toContain('Last Contact');
    });

    it('has DATE type for Last Contact', () => {
      const lastContact = crm.fields.find(f => f.name === 'Last Contact');
      expect(lastContact!.type).toBe('DATE');
    });
  });

  describe('Sales Pipeline', () => {
    const sales = TABLE_TEMPLATES.find(t => t.id === 'sales-pipeline')!;

    it('exists', () => {
      expect(sales).toBeDefined();
      expect(sales.name).toBe('Sales Pipeline');
    });

    it('has Value field with NUMBER type and options', () => {
      const value = sales.fields.find(f => f.name === 'Value');
      expect(value!.type).toBe('NUMBER');
      expect(value!.options).toEqual({ allowNegative: false, allowFraction: true });
    });
  });

  describe('Content Calendar', () => {
    const content = TABLE_TEMPLATES.find(t => t.id === 'content-calendar')!;

    it('exists', () => {
      expect(content).toBeDefined();
      expect(content.name).toBe('Content Calendar');
    });

    it('has Publish Date field', () => {
      const pubDate = content.fields.find(f => f.name === 'Publish Date');
      expect(pubDate!.type).toBe('DATE');
    });
  });

  describe('Project Tracker', () => {
    const project = TABLE_TEMPLATES.find(t => t.id === 'project-tracker')!;

    it('exists', () => {
      expect(project).toBeDefined();
      expect(project.name).toBe('Project Tracker');
    });

    it('has Assignee, Priority, Status, Due Date fields', () => {
      const names = project.fields.map(f => f.name);
      expect(names).toContain('Assignee');
      expect(names).toContain('Priority');
      expect(names).toContain('Status');
      expect(names).toContain('Due Date');
    });
  });

  describe('Bug Tracker', () => {
    const bug = TABLE_TEMPLATES.find(t => t.id === 'bug-tracker')!;

    it('exists', () => {
      expect(bug).toBeDefined();
      expect(bug.name).toBe('Bug Tracker');
    });

    it('has Severity and Reporter fields', () => {
      const names = bug.fields.map(f => f.name);
      expect(names).toContain('Severity');
      expect(names).toContain('Reporter');
    });
  });

  describe('Inventory', () => {
    const inv = TABLE_TEMPLATES.find(t => t.id === 'inventory')!;

    it('exists', () => {
      expect(inv).toBeDefined();
      expect(inv.name).toBe('Inventory');
    });

    it('has Quantity field with no fractions allowed', () => {
      const qty = inv.fields.find(f => f.name === 'Quantity');
      expect(qty!.type).toBe('NUMBER');
      expect(qty!.options!.allowFraction).toBe(false);
    });

    it('has Price field with fractions allowed', () => {
      const price = inv.fields.find(f => f.name === 'Price');
      expect(price!.type).toBe('NUMBER');
      expect(price!.options!.allowFraction).toBe(true);
    });

    it('has SKU, Category, Supplier fields', () => {
      const names = inv.fields.map(f => f.name);
      expect(names).toContain('SKU');
      expect(names).toContain('Category');
      expect(names).toContain('Supplier');
    });
  });

  it('all template IDs are unique', () => {
    const ids = TABLE_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
