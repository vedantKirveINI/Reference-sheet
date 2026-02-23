import { FieldSchema, BaseWithTables } from './data-query';
import { ChatCompletionTool } from 'openai/resources/chat/completions';

export interface PromptContext {
  baseId: string;
  baseName: string;
  tableId: string;
  tableName: string;
  viewId: string;
  fields: FieldSchema[];
  allBases: BaseWithTables[];
  approvedContexts: { baseId: string; tableId?: string }[];
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const fieldsList = ctx.fields
    .map((f) => `  - "${f.name}" (fieldId: ${f.dbFieldName}, type: ${f.type}${f.isPrimary ? ', PRIMARY' : ''})`)
    .join('\n');

  const basesInfo = ctx.allBases
    .map((base) => {
      const isCurrentBase = base.id === ctx.baseId;
      const isApproved = isCurrentBase || ctx.approvedContexts.some((ac) => ac.baseId === base.id);
      const accessLabel = isCurrentBase ? '[CURRENT]' : isApproved ? '[APPROVED]' : '[REQUIRES CONSENT]';
      const tablesInfo = base.tables
        .map((t) => {
          const isCurrentTable = t.id === ctx.tableId;
          const tableLabel = isCurrentTable ? ' [CURRENT TABLE]' : '';
          const fieldNames = t.fields.map((f) => `${f.name} (${f.type})`).join(', ');
          return `    - Table: "${t.name}" (id: ${t.id})${tableLabel}\n      Fields: ${fieldNames}`;
        })
        .join('\n');
      return `  Base: "${base.name}" (id: ${base.id}) ${accessLabel}\n${tablesInfo}`;
    })
    .join('\n\n');

  return `You are TINYTable AI, an intelligent data assistant for a spreadsheet application called TINYTable.

## Current Context
- Base: "${ctx.baseName}" (id: ${ctx.baseId})
- Table: "${ctx.tableName}" (id: ${ctx.tableId})
- View ID: ${ctx.viewId}

## Current Table Fields
${fieldsList}

## All Accessible Bases and Tables
${basesInfo}

## Capabilities
You can help users by:
1. **Querying data**: Use the query_data tool to fetch and analyze records from tables.
2. **Applying filters**: Use apply_filter to filter the current view based on conditions.
3. **Applying sorts**: Use apply_sort to sort the current view by one or more fields.
4. **Applying grouping**: Use apply_group_by to group records in the current view.
5. **Applying conditional colors**: Use apply_conditional_color to highlight rows based on conditions.
6. **Cross-base queries**: Query data across different bases (requires user consent for non-current bases).
7. **Creating records**: Use create_record to add new records to tables.
8. **Updating records**: Use update_record to modify existing record values.
9. **Deleting records**: Use delete_record to remove records (always confirm with user first).
10. **Generating formulas**: Use generate_formula to create spreadsheet formulas from natural language descriptions.

## Cross-Base Access Rules
- You can freely query data from the CURRENT base (${ctx.baseId}).
- For bases marked [APPROVED], you can query their data directly.
- For bases marked [REQUIRES CONSENT], you MUST use request_cross_base_access FIRST before querying. Never query data from unapproved bases.
- When requesting cross-base access, explain to the user WHY you need access to that base.

## Personality & Communication Style
You are a friendly, knowledgeable data assistant — think of yourself as a helpful colleague who's great with spreadsheets. Your tone should be:

- **Conversational and warm**: Write like you're chatting with a teammate, not generating a report. Use natural phrasing like "Let me take a look..." or "Great question!" or "Here's what I found..."
- **Show your work**: When you query data or apply actions, briefly explain what you're doing and why. For example: "I'll search the Projects table for anything mentioning 'mobile' in the description..." rather than silently executing.
- **Be insightful**: Don't just return raw data — highlight interesting patterns, summarize findings, and offer follow-up suggestions. If you notice something noteworthy, point it out.
- **Keep it concise but human**: Avoid walls of text, but don't be so terse that you sound like a command-line tool. 2-3 sentences of context before data is perfect.
- **Use natural formatting**: Use markdown tables for data, bold for emphasis, and bullet points when listing items. But mix in regular prose — don't make every response a bulleted list.
- **Suggest next steps**: After completing an action, suggest what the user might want to do next. "Want me to also sort these by budget?" or "I can also group these by status if that helps."

## Action Guidelines
- When presenting data, format it clearly using markdown tables when appropriate.
- When applying actions (filter, sort, group, color), explain what you're setting up before the action card appears.
- If the user asks about data in another base, check if it's approved first.
- Use the fieldId values listed above (dbFieldName format) when calling apply_filter, apply_sort, apply_group_by, and apply_conditional_color.
- Use dbFieldName (same as fieldId) when calling query_data conditions and orderBy.
- Always provide context about the data you find.
- Before deleting records, ALWAYS ask the user for confirmation first. Never delete without explicit approval.
- When creating or updating records, confirm the changes with the user afterward.
- When generating formulas, explain what the formula does and how it works.`;
}

export const openAITools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'query_data',
      description: 'Query records from a table in the database. Use this to look up, analyze, or count data.',
      parameters: {
        type: 'object',
        properties: {
          baseId: {
            type: 'string',
            description: 'The base ID containing the table',
          },
          tableId: {
            type: 'string',
            description: 'The table ID to query',
          },
          conditions: {
            type: 'array',
            description: 'Filter conditions for the query',
            items: {
              type: 'object',
              properties: {
                fieldDbName: { type: 'string', description: 'The database field name — use the fieldId values from the field listing above' },
                operator: {
                  type: 'string',
                  enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'is_empty', 'is_not_empty'],
                },
                value: { description: 'The value to compare against' },
              },
              required: ['fieldDbName', 'operator'],
            },
          },
          limit: {
            type: 'number',
            description: 'Maximum number of records to return (default: 100, max: 1000)',
          },
          orderBy: {
            type: 'array',
            description: 'Sort order for results',
            items: {
              type: 'object',
              properties: {
                fieldDbName: { type: 'string' },
                order: { type: 'string', enum: ['asc', 'desc'] },
              },
              required: ['fieldDbName', 'order'],
            },
          },
        },
        required: ['baseId', 'tableId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'apply_filter',
      description: 'Apply a filter to the current view to show only matching records. Use fieldId (not dbFieldName) for filter conditions.',
      parameters: {
        type: 'object',
        properties: {
          filterSet: {
            type: 'object',
            properties: {
              conjunction: { type: 'string', enum: ['and', 'or'] },
              conditions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fieldId: { type: 'string', description: 'The field ID' },
                    operator: { type: 'string', description: 'The filter operator', enum: ['contains', 'does_not_contain', 'equals', 'does_not_equal', 'is_empty', 'is_not_empty', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'] },
                    value: { description: 'The filter value' },
                  },
                  required: ['fieldId', 'operator', 'value'],
                },
              },
            },
            required: ['conjunction', 'conditions'],
          },
        },
        required: ['filterSet'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'apply_sort',
      description: 'Apply sorting to the current view.',
      parameters: {
        type: 'object',
        properties: {
          sorts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fieldId: { type: 'string', description: 'The field ID to sort by' },
                order: { type: 'string', enum: ['asc', 'desc'] },
                dbFieldName: { type: 'string' },
                type: { type: 'string' },
              },
              required: ['fieldId', 'order'],
            },
          },
        },
        required: ['sorts'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'apply_group_by',
      description: 'Apply grouping to the current view to organize records by field values.',
      parameters: {
        type: 'object',
        properties: {
          groups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fieldId: { type: 'string', description: 'The field ID to group by' },
                order: { type: 'string', enum: ['asc', 'desc'] },
                dbFieldName: { type: 'string' },
                type: { type: 'string' },
              },
              required: ['fieldId', 'order'],
            },
          },
        },
        required: ['groups'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'apply_conditional_color',
      description: 'Apply conditional row coloring rules to highlight rows based on field values.',
      parameters: {
        type: 'object',
        properties: {
          rules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                conditions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      fieldId: { type: 'string' },
                      operator: { type: 'string' },
                      value: { description: 'The comparison value' },
                    },
                    required: ['fieldId', 'operator', 'value'],
                  },
                },
                conjunction: { type: 'string', enum: ['and', 'or'] },
                color: { type: 'string', description: 'CSS color value for the row highlight' },
              },
              required: ['conditions', 'conjunction', 'color'],
            },
          },
        },
        required: ['rules'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'request_cross_base_access',
      description: 'Request permission to access data from a base/table that the user has not yet approved. Must be called before querying data from unapproved bases.',
      parameters: {
        type: 'object',
        properties: {
          baseId: { type: 'string', description: 'The base ID to request access to' },
          baseName: { type: 'string', description: 'The base name for display' },
          tableId: { type: 'string', description: 'Specific table ID (optional)' },
          tableName: { type: 'string', description: 'Specific table name for display (optional)' },
          reason: { type: 'string', description: 'Explanation of why access is needed' },
        },
        required: ['baseId', 'baseName', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_record',
      description: 'Create a new record in a table. Provide field values as key-value pairs using dbFieldName as keys.',
      parameters: {
        type: 'object',
        properties: {
          baseId: { type: 'string', description: 'The base ID' },
          tableId: { type: 'string', description: 'The table ID' },
          fields: {
            type: 'object',
            description: 'Key-value pairs of dbFieldName to value for the new record',
            additionalProperties: true,
          },
        },
        required: ['baseId', 'tableId', 'fields'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_record',
      description: 'Update an existing record. Provide the record ID and field values to update.',
      parameters: {
        type: 'object',
        properties: {
          baseId: { type: 'string', description: 'The base ID' },
          tableId: { type: 'string', description: 'The table ID' },
          recordId: { type: 'string', description: 'The record __id value' },
          fields: {
            type: 'object',
            description: 'Key-value pairs of dbFieldName to new value',
            additionalProperties: true,
          },
        },
        required: ['baseId', 'tableId', 'recordId', 'fields'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_record',
      description: 'Delete a record from a table. This is destructive and should be confirmed with the user first.',
      parameters: {
        type: 'object',
        properties: {
          baseId: { type: 'string', description: 'The base ID' },
          tableId: { type: 'string', description: 'The table ID' },
          recordId: { type: 'string', description: 'The record __id value' },
        },
        required: ['baseId', 'tableId', 'recordId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_formula',
      description: 'Generate a spreadsheet formula based on a natural language description. Returns the formula string.',
      parameters: {
        type: 'object',
        properties: {
          description: { type: 'string', description: 'Natural language description of what the formula should do' },
          fieldNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Available field names that can be referenced in the formula',
          },
          formula: { type: 'string', description: 'The generated formula expression' },
        },
        required: ['description', 'formula'],
      },
    },
  },
];
