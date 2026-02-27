import { FieldSchema, BaseWithTables } from './data-query';
import { ChatCompletionTool } from 'openai/resources/chat/completions';

export interface ViewState {
  filters?: { conjunction?: string; conditions?: { fieldId: string; operator: string; value?: any }[] };
  sorts?: { fieldId: string; direction: string }[];
  groups?: { fieldId: string; direction: string }[];
}

export interface PromptContext {
  baseId: string;
  baseName: string;
  tableId: string;
  tableName: string;
  viewId: string;
  fields: FieldSchema[];
  allBases: BaseWithTables[];
  approvedContexts: { baseId: string; tableId?: string }[];
  viewState?: ViewState;
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const fieldsList = ctx.fields
    .map((f) => `  - "${f.name}" (fieldId: ${f.dbFieldName}, type: ${f.type}${f.isPrimary ? ', PRIMARY' : ''})`)
    .join('\n');

  const resolveFieldName = (fieldId: string): string => {
    const field = ctx.fields.find(f => f.dbFieldName === fieldId);
    return field ? field.name : fieldId;
  };

  const viewStateSection = (() => {
    if (!ctx.viewState) return '';
    const parts: string[] = [];

    const filters = ctx.viewState.filters;
    if (filters?.conditions && filters.conditions.length > 0) {
      const filterDesc = filters.conditions.map(c =>
        `${resolveFieldName(c.fieldId)} ${c.operator.replace(/_/g, ' ')} "${c.value ?? ''}"`
      ).join(` ${filters.conjunction || 'and'} `);
      parts.push(`- **Active filters**: ${filterDesc}`);
    } else {
      parts.push('- **Active filters**: None');
    }

    const sorts = ctx.viewState.sorts;
    if (sorts && sorts.length > 0) {
      const sortDesc = sorts.map(s => `${resolveFieldName(s.fieldId)} ${s.direction === 'desc' ? 'descending' : 'ascending'}`).join(', ');
      parts.push(`- **Active sorts**: ${sortDesc}`);
    } else {
      parts.push('- **Active sorts**: None');
    }

    const groups = ctx.viewState.groups;
    if (groups && groups.length > 0) {
      const groupDesc = groups.map(g => `${resolveFieldName(g.fieldId)}`).join(', ');
      parts.push(`- **Active groups**: ${groupDesc}`);
    } else {
      parts.push('- **Active groups**: None');
    }

    return `\n## Current View State\n${parts.join('\n')}\n`;
  })();

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
${viewStateSection}
## All Accessible Bases and Tables
${basesInfo}

## Capabilities
You can help users by:
1. **Querying data**: Use the query_data tool to fetch and analyze records from tables.
2. **Applying filters**: Use apply_filter to filter the current view based on conditions.
3. **Applying sorts**: Use apply_sort to sort the current view by one or more fields.
4. **Applying grouping**: Use apply_group_by to group records in the current view.
5. **Applying conditional colors**: Use apply_conditional_color to highlight rows based on conditions.
6. **Adding a filter condition**: Use add_filter_condition to add a single filter condition to the existing filters without replacing them.
7. **Removing a filter condition**: Use remove_filter_condition to remove a specific filter condition by field and operator.
8. **Adding a sort**: Use add_sort to add a sort rule to the existing sorts without replacing them.
9. **Removing a sort**: Use remove_sort to remove a specific sort rule by field.
10. **Clearing filters**: Use clear_filter to remove all filters from the current view.
11. **Clearing sorts**: Use clear_sort to remove all sorts from the current view.
12. **Clearing groups**: Use clear_group_by to remove all grouping from the current view.
13. **Clearing conditional colors**: Use clear_conditional_color to remove all conditional color rules from the current view.
14. **Cross-base queries**: Query data across different bases (requires user consent for non-current bases).
15. **Creating records**: Use create_record to add new records to tables.
16. **Updating records**: Use update_record to modify existing record values.
17. **Deleting records**: Use delete_record to remove records (always confirm with user first).
18. **Generating formulas**: Use generate_formula to create spreadsheet formulas from natural language descriptions.
19. **Summarizing data**: Use summarize_data to compute aggregations (COUNT, SUM, AVG, MIN, MAX, COUNT_DISTINCT) over fields, with optional grouping and filtering. Use this instead of query_data when the user asks questions like "What's the total?", "How many?", "Average?", "What's the highest/lowest?".
20. **Checking view state**: Use get_view_state to retrieve the current filters, sorts, groups, and conditional colors active on the view. Use this when you need to check what's currently applied, especially if the conversation has been going on for a while and the user may have changed things manually.
21. **Bulk updating records**: Use bulk_update_records to update multiple records at once based on filter conditions. Much faster than calling update_record in a loop. ALWAYS ask the user for explicit confirmation before executing — describe exactly which records will be affected and what will change.
22. **Bulk deleting records**: Use bulk_delete_records to delete multiple records at once based on filter conditions. ALWAYS ask the user for explicit confirmation before executing — describe exactly which records will be deleted.

## Incremental vs. Full Replacement
When the user says "also filter by", "add a filter for", "additionally sort by", or similar additive language, use the incremental tools (add_filter_condition, add_sort) to preserve existing filters/sorts.
When the user says "filter by" without additive language and clearly wants a fresh filter, use apply_filter to replace entirely.
When the user says "remove the filter on Status" or "stop sorting by Budget", use the removal tools (remove_filter_condition, remove_sort) to remove only that specific condition.
- "Also filter by Priority = High" → call add_filter_condition
- "Remove the filter on Status" → call remove_filter_condition with the Status field
- "Also sort by name" → call add_sort
- "Stop sorting by budget" → call remove_sort with the Budget field

## Clearing/Removing View Modifications
When the user asks to "remove", "clear", "reset", "undo", or "get rid of" ALL filters, sorts, groups, or conditional colors, use the appropriate clear tool:
- "Remove the filter" / "Clear filters" / "Reset filters" → call clear_filter
- "Remove the sort" / "Clear sorting" / "Unsort" → call clear_sort
- "Remove grouping" / "Ungroup" / "Clear groups" → call clear_group_by
- "Remove colors" / "Clear highlighting" / "Remove conditional colors" → call clear_conditional_color
Do NOT use apply_filter with empty conditions to clear — always use the dedicated clear tools.

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
- **Suggest next steps sparingly**: After completing an action, you MAY suggest what the user might want to do next — but only when it feels natural. Read the room first (see anti-patterns below).
- **Match the user's energy**: Short questions get short answers. Exploratory questions get detailed help. Frustrated users get focused problem-solving, not upsells.

## Communication Anti-Patterns (NEVER DO THESE)
1. **Never claim success without calling a tool.** If the user says "remove the filter" you MUST call clear_filter. Never say "Done! I've removed the filter" without actually invoking the tool. If you cannot perform an action, say so honestly.
2. **Don't upsell when the user is frustrated.** If the user is repeating themselves, expressing frustration, or asking you to undo something, focus 100% on solving their problem. Do NOT end with "Want me to sort or group next?" in these situations.
3. **Don't repeat the same response.** If your previous response didn't work and the user asks again, try a different approach or acknowledge the issue — don't just rephrase the same answer.
4. **Be specific about what you did.** After applying or clearing an action, reference the specific change: "I've removed the filter that was showing only 'mobile' descriptions" — not just "Done!"
5. **Check the Current View State.** Before applying or clearing actions, look at the Current View State section above to understand what's already active. Don't try to clear something that isn't there, and don't apply something that conflicts with existing settings without mentioning it.

## Action Guidelines
- When presenting data, format it clearly using markdown tables when appropriate.
- When applying actions (filter, sort, group, color), explain what you're setting up before the action card appears.
- If the user asks about data in another base, check if it's approved first.
- Use the fieldId values listed above (dbFieldName format) when calling apply_filter, apply_sort, apply_group_by, and apply_conditional_color.
- Use dbFieldName (same as fieldId) when calling query_data conditions and orderBy.
- Always provide context about the data you find.
- Before deleting records, ALWAYS ask the user for confirmation first. Never delete without explicit approval.
- When creating or updating records, confirm the changes with the user afterward.
- When generating formulas, explain what the formula does and how it works.
- Before executing bulk_update_records or bulk_delete_records, ALWAYS describe what will be affected (e.g., "This will update 15 records where Status = 'In Progress' to set Status = 'Done'") and wait for the user's explicit confirmation. Never execute bulk operations without approval.`;
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
      name: 'clear_filter',
      description: 'Remove all filters from the current view. Use this when the user asks to clear, remove, reset, or undo filters.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_sort',
      description: 'Remove all sorting from the current view. Use this when the user asks to clear, remove, reset, or undo sorts.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_group_by',
      description: 'Remove all grouping from the current view. Use this when the user asks to clear, remove, reset, or undo groups.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_conditional_color',
      description: 'Remove all conditional color rules from the current view. Use this when the user asks to clear, remove, or reset row highlighting/colors.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_filter_condition',
      description: 'Add a single filter condition to the existing filters without replacing them. Use this when the user wants to add an additional filter on top of existing ones (e.g., "also filter by...", "add a filter for...").',
      parameters: {
        type: 'object',
        properties: {
          fieldId: { type: 'string', description: 'The field ID to filter on' },
          operator: { type: 'string', description: 'The filter operator', enum: ['contains', 'does_not_contain', 'equals', 'does_not_equal', 'is_empty', 'is_not_empty', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'] },
          value: { description: 'The filter value' },
        },
        required: ['fieldId', 'operator', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_filter_condition',
      description: 'Remove a specific filter condition from the existing filters by matching on fieldId. Use this when the user wants to remove one particular filter while keeping others (e.g., "remove the filter on Status").',
      parameters: {
        type: 'object',
        properties: {
          fieldId: { type: 'string', description: 'The field ID of the filter condition to remove' },
          operator: { type: 'string', description: 'Optional: the specific operator to match for removal. If omitted, removes all filter conditions on this field.' },
        },
        required: ['fieldId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_sort',
      description: 'Add a sort rule to the existing sorts without replacing them. Use this when the user wants to add an additional sort on top of existing ones (e.g., "also sort by...", "add a sort for...").',
      parameters: {
        type: 'object',
        properties: {
          fieldId: { type: 'string', description: 'The field ID to sort by' },
          order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        },
        required: ['fieldId', 'order'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_sort',
      description: 'Remove a specific sort rule from the existing sorts by matching on fieldId. Use this when the user wants to remove one particular sort while keeping others (e.g., "stop sorting by Budget").',
      parameters: {
        type: 'object',
        properties: {
          fieldId: { type: 'string', description: 'The field ID of the sort rule to remove' },
        },
        required: ['fieldId'],
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
  {
    type: 'function',
    function: {
      name: 'summarize_data',
      description: 'Compute aggregate statistics over table data. Use this for questions about totals, averages, counts, min/max values, and breakdowns by category. Prefer this over query_data when the user wants summary numbers rather than individual records.',
      parameters: {
        type: 'object',
        properties: {
          baseId: {
            type: 'string',
            description: 'The base ID containing the table',
          },
          tableId: {
            type: 'string',
            description: 'The table ID to summarize',
          },
          aggregation: {
            type: 'string',
            enum: ['count', 'sum', 'avg', 'min', 'max', 'count_distinct'],
            description: 'The aggregation function to apply',
          },
          fieldDbName: {
            type: 'string',
            description: 'The database field name to aggregate over (required for sum, avg, min, max, count_distinct; optional for count)',
          },
          groupByFields: {
            type: 'array',
            items: { type: 'string' },
            description: 'Database field names to group results by (e.g., group by status to get count per status)',
          },
          conditions: {
            type: 'array',
            description: 'Filter conditions to apply before aggregating',
            items: {
              type: 'object',
              properties: {
                fieldDbName: { type: 'string', description: 'The database field name' },
                operator: {
                  type: 'string',
                  enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'is_empty', 'is_not_empty'],
                },
                value: { description: 'The value to compare against' },
              },
              required: ['fieldDbName', 'operator'],
            },
          },
        },
        required: ['baseId', 'tableId', 'aggregation'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_view_state',
      description: 'Retrieve the current filters, sorts, groups, and conditional colors active on the view. Use this to check what is currently applied, especially during long conversations where the user may have changed things manually.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bulk_update_records',
      description: 'Update multiple records at once based on filter conditions. Use this instead of calling update_record in a loop. IMPORTANT: Always ask the user for explicit confirmation before executing, describing exactly which records will be affected and what changes will be made.',
      parameters: {
        type: 'object',
        properties: {
          baseId: {
            type: 'string',
            description: 'The base ID containing the table',
          },
          tableId: {
            type: 'string',
            description: 'The table ID to update records in',
          },
          conditions: {
            type: 'array',
            description: 'Filter conditions to select which records to update. At least one condition is required.',
            items: {
              type: 'object',
              properties: {
                fieldDbName: { type: 'string', description: 'The database field name to filter on' },
                operator: {
                  type: 'string',
                  enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'is_empty', 'is_not_empty'],
                },
                value: { description: 'The value to compare against' },
              },
              required: ['fieldDbName', 'operator'],
            },
          },
          fieldUpdates: {
            type: 'object',
            description: 'Key-value pairs of dbFieldName to new value for the fields to update',
            additionalProperties: true,
          },
        },
        required: ['baseId', 'tableId', 'conditions', 'fieldUpdates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bulk_delete_records',
      description: 'Delete multiple records at once based on filter conditions. This is destructive and irreversible. IMPORTANT: Always ask the user for explicit confirmation before executing, describing exactly which records will be deleted.',
      parameters: {
        type: 'object',
        properties: {
          baseId: {
            type: 'string',
            description: 'The base ID containing the table',
          },
          tableId: {
            type: 'string',
            description: 'The table ID to delete records from',
          },
          conditions: {
            type: 'array',
            description: 'Filter conditions to select which records to delete. At least one condition is required.',
            items: {
              type: 'object',
              properties: {
                fieldDbName: { type: 'string', description: 'The database field name to filter on' },
                operator: {
                  type: 'string',
                  enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'is_empty', 'is_not_empty'],
                },
                value: { description: 'The value to compare against' },
              },
              required: ['fieldDbName', 'operator'],
            },
          },
        },
        required: ['baseId', 'tableId', 'conditions'],
      },
    },
  },
];
