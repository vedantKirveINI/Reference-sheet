import { buildSystemPrompt, openAITools, PromptContext, ViewState } from '../prompt-engine';
import { FieldSchema, BaseWithTables } from '../data-query';

function makeFields(): FieldSchema[] {
  return [
    { id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'fld_name', dbFieldType: 'text', isPrimary: true, options: null },
    { id: 2, name: 'Status', type: 'SCQ', dbFieldName: 'fld_status', dbFieldType: 'text', isPrimary: false, options: null },
    { id: 3, name: 'Budget', type: 'NUMBER', dbFieldName: 'fld_budget', dbFieldType: 'numeric', isPrimary: false, options: null },
  ];
}

function makeBases(): BaseWithTables[] {
  return [
    {
      id: 'base1',
      name: 'My Base',
      tables: [
        {
          id: 'tbl1',
          name: 'Projects',
          fields: [
            { id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'fld_name' },
            { id: 2, name: 'Status', type: 'SCQ', dbFieldName: 'fld_status' },
          ],
        },
      ],
    },
    {
      id: 'base2',
      name: 'Other Base',
      tables: [
        {
          id: 'tbl2',
          name: 'Tasks',
          fields: [{ id: 3, name: 'Title', type: 'SHORT_TEXT', dbFieldName: 'fld_title' }],
        },
      ],
    },
  ];
}

function makeContext(overrides?: Partial<PromptContext>): PromptContext {
  return {
    baseId: 'base1',
    baseName: 'My Base',
    tableId: 'tbl1',
    tableName: 'Projects',
    viewId: 'view1',
    fields: makeFields(),
    allBases: makeBases(),
    approvedContexts: [],
    ...overrides,
  };
}

describe('buildSystemPrompt', () => {
  it('includes base and table context', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('My Base');
    expect(prompt).toContain('Projects');
    expect(prompt).toContain('base1');
    expect(prompt).toContain('tbl1');
    expect(prompt).toContain('view1');
  });

  it('lists all fields with types and primary marker', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('"Name" (fieldId: fld_name, type: SHORT_TEXT, PRIMARY)');
    expect(prompt).toContain('"Status" (fieldId: fld_status, type: SCQ)');
    expect(prompt).toContain('"Budget" (fieldId: fld_budget, type: NUMBER)');
  });

  it('marks current base as [CURRENT]', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('"My Base" (id: base1) [CURRENT]');
  });

  it('marks approved bases as [APPROVED]', () => {
    const prompt = buildSystemPrompt(makeContext({ approvedContexts: [{ baseId: 'base2' }] }));
    expect(prompt).toContain('[APPROVED]');
  });

  it('marks unapproved bases as [REQUIRES CONSENT]', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('[REQUIRES CONSENT]');
  });

  it('marks current table as [CURRENT TABLE]', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('[CURRENT TABLE]');
  });

  it('includes view state with active filters', () => {
    const viewState: ViewState = {
      filters: {
        conjunction: 'and',
        conditions: [{ fieldId: 'fld_status', operator: 'equals', value: 'Active' }],
      },
    };
    const prompt = buildSystemPrompt(makeContext({ viewState }));
    expect(prompt).toContain('Active filters');
    expect(prompt).toContain('Status equals "Active"');
  });

  it('includes view state with active sorts', () => {
    const viewState: ViewState = {
      sorts: [{ fieldId: 'fld_budget', direction: 'desc' }],
    };
    const prompt = buildSystemPrompt(makeContext({ viewState }));
    expect(prompt).toContain('Active sorts');
    expect(prompt).toContain('Budget descending');
  });

  it('includes view state with active groups', () => {
    const viewState: ViewState = {
      groups: [{ fieldId: 'fld_status', direction: 'asc' }],
    };
    const prompt = buildSystemPrompt(makeContext({ viewState }));
    expect(prompt).toContain('Active groups');
    expect(prompt).toContain('Status');
  });

  it('shows "None" for empty view state sections', () => {
    const viewState: ViewState = {};
    const prompt = buildSystemPrompt(makeContext({ viewState }));
    expect(prompt).toContain('**Active filters**: None');
    expect(prompt).toContain('**Active sorts**: None');
    expect(prompt).toContain('**Active groups**: None');
  });

  it('omits view state section when viewState is undefined', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).not.toContain('## Current View State');
  });

  it('resolves field names in filter descriptions', () => {
    const viewState: ViewState = {
      filters: {
        conjunction: 'or',
        conditions: [
          { fieldId: 'fld_name', operator: 'contains', value: 'test' },
          { fieldId: 'fld_status', operator: 'equals', value: 'Done' },
        ],
      },
    };
    const prompt = buildSystemPrompt(makeContext({ viewState }));
    expect(prompt).toContain('Name contains "test"');
    expect(prompt).toContain('Status equals "Done"');
  });

  it('falls back to fieldId when field not found', () => {
    const viewState: ViewState = {
      filters: {
        conjunction: 'and',
        conditions: [{ fieldId: 'unknown_field', operator: 'equals', value: 'x' }],
      },
    };
    const prompt = buildSystemPrompt(makeContext({ viewState }));
    expect(prompt).toContain('unknown_field equals "x"');
  });

  it('includes all capabilities', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('Querying data');
    expect(prompt).toContain('Applying filters');
    expect(prompt).toContain('Applying sorts');
    expect(prompt).toContain('Applying grouping');
    expect(prompt).toContain('Applying conditional colors');
    expect(prompt).toContain('Creating records');
    expect(prompt).toContain('Updating records');
    expect(prompt).toContain('Deleting records');
    expect(prompt).toContain('Generating formulas');
    expect(prompt).toContain('Summarizing data');
    expect(prompt).toContain('Bulk updating records');
    expect(prompt).toContain('Bulk deleting records');
  });

  it('includes cross-base access rules', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('Cross-Base Access Rules');
    expect(prompt).toContain('request_cross_base_access');
  });

  it('includes personality guidelines', () => {
    const prompt = buildSystemPrompt(makeContext());
    expect(prompt).toContain('Personality & Communication Style');
    expect(prompt).toContain('Communication Anti-Patterns');
  });
});

describe('openAITools', () => {
  it('is an array of tool definitions', () => {
    expect(Array.isArray(openAITools)).toBe(true);
    expect(openAITools.length).toBeGreaterThan(0);
  });

  it('each tool has type "function" and a function definition', () => {
    for (const tool of openAITools) {
      expect(tool.type).toBe('function');
      expect(tool.function).toBeDefined();
      expect(tool.function.name).toBeTruthy();
      expect(tool.function.parameters).toBeDefined();
    }
  });

  const expectedTools = [
    'query_data', 'apply_filter', 'apply_sort', 'apply_group_by', 'apply_conditional_color',
    'clear_filter', 'clear_sort', 'clear_group_by', 'clear_conditional_color',
    'add_filter_condition', 'remove_filter_condition', 'add_sort', 'remove_sort',
    'request_cross_base_access', 'create_record', 'update_record', 'delete_record',
    'generate_formula', 'summarize_data', 'get_view_state', 'bulk_update_records', 'bulk_delete_records',
  ];

  it.each(expectedTools)('includes tool definition for %s', (toolName) => {
    const tool = openAITools.find((t) => t.function.name === toolName);
    expect(tool).toBeDefined();
  });

  it('query_data requires baseId and tableId', () => {
    const tool = openAITools.find((t) => t.function.name === 'query_data')!;
    const params = tool.function.parameters as any;
    expect(params.required).toContain('baseId');
    expect(params.required).toContain('tableId');
  });

  it('apply_filter requires filterSet', () => {
    const tool = openAITools.find((t) => t.function.name === 'apply_filter')!;
    const params = tool.function.parameters as any;
    expect(params.required).toContain('filterSet');
  });

  it('create_record requires baseId, tableId, fields', () => {
    const tool = openAITools.find((t) => t.function.name === 'create_record')!;
    const params = tool.function.parameters as any;
    expect(params.required).toEqual(expect.arrayContaining(['baseId', 'tableId', 'fields']));
  });

  it('delete_record requires baseId, tableId, recordId', () => {
    const tool = openAITools.find((t) => t.function.name === 'delete_record')!;
    const params = tool.function.parameters as any;
    expect(params.required).toEqual(expect.arrayContaining(['baseId', 'tableId', 'recordId']));
  });

  it('bulk_update_records requires conditions and fieldUpdates', () => {
    const tool = openAITools.find((t) => t.function.name === 'bulk_update_records')!;
    const params = tool.function.parameters as any;
    expect(params.required).toEqual(expect.arrayContaining(['conditions', 'fieldUpdates']));
  });

  it('bulk_delete_records requires conditions', () => {
    const tool = openAITools.find((t) => t.function.name === 'bulk_delete_records')!;
    const params = tool.function.parameters as any;
    expect(params.required).toContain('conditions');
  });

  it('summarize_data requires aggregation', () => {
    const tool = openAITools.find((t) => t.function.name === 'summarize_data')!;
    const params = tool.function.parameters as any;
    expect(params.required).toContain('aggregation');
  });

  it('get_view_state has no required parameters', () => {
    const tool = openAITools.find((t) => t.function.name === 'get_view_state')!;
    const params = tool.function.parameters as any;
    expect(params.required).toEqual([]);
  });
});
