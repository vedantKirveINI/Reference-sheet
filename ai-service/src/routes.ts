import 'dotenv/config';

import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { createId } from '@paralleldrive/cuid2';
import pool from './db';
import { buildSystemPrompt, openAITools, PromptContext } from './prompt-engine';
import { queryTableData, getTableSchema, getAllAccessibleBases, createRecord, updateRecord, deleteRecord, summarizeTableData, bulkUpdateRecords, bulkDeleteRecords, FieldSchema } from './data-query';

function extractUserId(req: Request): string | null {
  const token = req.headers['token'] as string;
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload.user_id || payload.sub || payload.userId || null;
  } catch {
    return null;
  }
}

function authMiddleware(req: Request, res: Response, next: Function) {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid token' });
  }
  (req as any).userId = userId;
  next();
}

function getThinkingMessage(toolName: string, args: any, fields?: FieldSchema[]): string {
  const resolveFieldName = (fieldId: string): string => {
    if (!fields) return fieldId;
    const field = fields.find(f => f.dbFieldName === fieldId || String(f.id) === String(fieldId));
    return field ? field.name : fieldId;
  };

  switch (toolName) {
    case 'query_data': {
      const conditions = args.conditions || [];
      if (conditions.length > 0) {
        const desc = conditions.map((c: any) => `${c.fieldDbName} ${c.operator} ${c.value || ''}`).join(', ');
        return `Searching records where ${desc}...`;
      }
      return `Fetching records from table...`;
    }
    case 'apply_filter': {
      const conds = args.filterSet?.conditions || [];
      if (conds.length > 0) {
        const desc = conds.map((c: any) => `${resolveFieldName(c.fieldId)} ${c.operator.replace(/_/g, ' ')} "${c.value || ''}"`).join(' and ');
        return `Applying filter: ${desc}`;
      }
      return 'Setting up filter...';
    }
    case 'apply_sort': {
      const sorts = args.sorts || [];
      if (sorts.length > 0) {
        const desc = sorts.map((s: any) => `${resolveFieldName(s.fieldId)} ${s.order === 'desc' ? 'descending' : 'ascending'}`).join(', ');
        return `Sorting by ${desc}`;
      }
      return 'Sorting records...';
    }
    case 'apply_group_by': {
      const groups = args.groups || [];
      if (groups.length > 0) {
        const desc = groups.map((g: any) => resolveFieldName(g.fieldId)).join(', ');
        return `Grouping by ${desc}`;
      }
      return 'Setting up groups...';
    }
    case 'apply_conditional_color': {
      const rules = args.rules || [];
      return `Applying ${rules.length} color rule${rules.length !== 1 ? 's' : ''}...`;
    }
    case 'request_cross_base_access':
      return `Requesting access to "${args.baseName || 'unknown base'}"...`;
    case 'create_record':
      return 'Creating new record...';
    case 'update_record':
      return 'Updating record...';
    case 'delete_record':
      return 'Preparing to delete record...';
    case 'add_filter_condition': {
      const fieldName = resolveFieldName(args.fieldId || '');
      return `Adding filter: ${fieldName} ${(args.operator || '').replace(/_/g, ' ')} "${args.value || ''}"`;
    }
    case 'remove_filter_condition': {
      const fieldName = resolveFieldName(args.fieldId || '');
      return `Removing filter on ${fieldName}...`;
    }
    case 'add_sort': {
      const fieldName = resolveFieldName(args.fieldId || '');
      return `Adding sort: ${fieldName} ${args.order === 'desc' ? 'descending' : 'ascending'}`;
    }
    case 'remove_sort': {
      const fieldName = resolveFieldName(args.fieldId || '');
      return `Removing sort on ${fieldName}...`;
    }
    case 'clear_filter':
      return 'Clearing all filters...';
    case 'clear_sort':
      return 'Clearing all sorts...';
    case 'clear_group_by':
      return 'Clearing all groups...';
    case 'clear_conditional_color':
      return 'Clearing all color rules...';
    case 'generate_formula':
      return `Crafting formula: ${args.description || ''}`;
    case 'summarize_data': {
      const agg = (args.aggregation || 'count').toUpperCase();
      const fieldName = args.fieldDbName ? resolveFieldName(args.fieldDbName) : 'records';
      const groupBy = args.groupByFields?.length ? ` grouped by ${args.groupByFields.map((g: string) => resolveFieldName(g)).join(', ')}` : '';
      return `Computing ${agg} of ${fieldName}${groupBy}...`;
    }
    case 'get_view_state':
      return 'Checking current view state...';
    case 'bulk_update_records': {
      const condCount = args.conditions?.length || 0;
      const fieldCount = args.fieldUpdates ? Object.keys(args.fieldUpdates).length : 0;
      return `Bulk updating records (${condCount} condition${condCount !== 1 ? 's' : ''}, ${fieldCount} field${fieldCount !== 1 ? 's' : ''})...`;
    }
    case 'bulk_delete_records': {
      const condCount = args.conditions?.length || 0;
      return `Bulk deleting records matching ${condCount} condition${condCount !== 1 ? 's' : ''}...`;
    }
    default:
      return `Working on it...`;
  }
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const pendingViewStateRequests = new Map<string, { resolve: (state: any) => void; timer: NodeJS.Timeout }>();

export function createRouter(): Router {
  const router = Router();

  pool.query(`ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS feedback VARCHAR(10) DEFAULT NULL`).catch(() => {});

  router.use(authMiddleware);

  router.get('/conversations', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const result = await pool.query(
        `SELECT * FROM ai_conversations WHERE user_id = $1 ORDER BY updated_at DESC`,
        [userId]
      );
      res.json({ conversations: result.rows });
    } catch (err: any) {
      console.error('Error listing conversations:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/conversations', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { title, baseId, tableId, viewId } = req.body;
      const result = await pool.query(
        `INSERT INTO ai_conversations (id, user_id, title, current_base_id, current_table_id, current_view_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [createId(), userId, title || 'New Conversation', baseId || null, tableId || null, viewId || null]
      );
      res.json({ conversation: result.rows[0] });
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/conversations/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const convResult = await pool.query(
        `SELECT * FROM ai_conversations WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      if (convResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      const messagesResult = await pool.query(
        `SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
        [id]
      );
      res.json({
        conversation: convResult.rows[0],
        messages: messagesResult.rows,
      });
    } catch (err: any) {
      console.error('Error getting conversation:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/conversations/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      await pool.query(
        `DELETE FROM ai_messages WHERE conversation_id = $1`,
        [id]
      );
      await pool.query(
        `DELETE FROM ai_approved_contexts WHERE conversation_id = $1`,
        [id]
      );
      const result = await pool.query(
        `DELETE FROM ai_conversations WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
        [id]
      );
      res.json({ messages: result.rows });
    } catch (err: any) {
      console.error('Error getting messages:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/conversations/:id/messages/:messageId/feedback', async (req: Request, res: Response) => {
    try {
      const { id, messageId } = req.params;
      const { feedback } = req.body;
      if (!feedback || !['up', 'down'].includes(feedback)) {
        return res.status(400).json({ error: 'Invalid feedback. Must be "up" or "down".' });
      }
      await pool.query(
        'UPDATE ai_messages SET feedback = $1 WHERE id = $2 AND conversation_id = $3',
        [feedback, messageId, id]
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error saving feedback:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/context/bases', async (_req: Request, res: Response) => {
    try {
      const bases = await getAllAccessibleBases(pool);
      res.json({ bases });
    } catch (err: any) {
      console.error('Error getting bases context:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/conversations/:id/approve-context', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { baseId, tableId } = req.body;
      await pool.query(
        `INSERT INTO ai_approved_contexts (id, conversation_id, base_id, table_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [createId(), id, baseId, tableId || null]
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error approving context:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/conversations/:id/view-state-response', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { requestId, viewState } = req.body;
      const key = `${id}:${requestId}`;
      const pending = pendingViewStateRequests.get(key);
      if (pending) {
        clearTimeout(pending.timer);
        pendingViewStateRequests.delete(key);
        pending.resolve(viewState || {});
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error handling view state response:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/conversations/:id/chat', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { content, baseId, tableId, viewId, viewState } = req.body;

      if (!content || !baseId || !tableId || !viewId) {
        return res.status(400).json({ error: 'Missing required fields: content, baseId, tableId, viewId' });
      }

      const convResult = await pool.query(
        `SELECT * FROM ai_conversations WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      if (convResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      await pool.query(
        `UPDATE ai_conversations SET current_base_id = $1, current_table_id = $2, current_view_id = $3, updated_at = NOW() WHERE id = $4`,
        [baseId, tableId, viewId, id]
      );

      await pool.query(
        `INSERT INTO ai_messages (id, conversation_id, role, content) VALUES ($1, $2, $3, $4)`,
        [createId(), id, 'user', content]
      );

      const [fields, allBases, approvedResult, historyResult] = await Promise.all([
        getTableSchema(pool, tableId),
        getAllAccessibleBases(pool),
        pool.query(
          `SELECT base_id, table_id FROM ai_approved_contexts WHERE conversation_id = $1`,
          [id]
        ),
        pool.query(
          `SELECT role, content FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
          [id]
        ),
      ]);

      const approvedContexts = approvedResult.rows.map((r) => ({
        baseId: r.base_id,
        tableId: r.table_id || undefined,
      }));

      const currentBase = allBases.find((b) => b.id === baseId);
      const currentTable = currentBase?.tables.find((t) => t.id === tableId);

      const promptContext: PromptContext = {
        baseId,
        baseName: currentBase?.name || 'Unknown Base',
        tableId,
        tableName: currentTable?.name || 'Unknown Table',
        viewId,
        fields,
        allBases,
        approvedContexts,
        viewState: viewState || undefined,
      };

      const systemPrompt = buildSystemPrompt(promptContext);

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      for (const msg of historyResult.rows) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      let fullResponse = '';
      let actionType: string | null = null;
      let actionPayload: any = null;

      try {
        let currentMessages = [...messages];
        let continueLoop = true;

        while (continueLoop) {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: currentMessages,
            tools: openAITools,
            stream: true,
          });

          let toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();
          let hasToolCalls = false;

          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
              fullResponse += delta.content;
              res.write(`data: ${JSON.stringify({ type: 'token', content: delta.content })}\n\n`);
            }

            if (delta?.tool_calls) {
              hasToolCalls = true;
              for (const tc of delta.tool_calls) {
                if (!toolCalls.has(tc.index)) {
                  toolCalls.set(tc.index, { id: tc.id || '', name: tc.function?.name || '', arguments: '' });
                }
                const existing = toolCalls.get(tc.index)!;
                if (tc.id) existing.id = tc.id;
                if (tc.function?.name) existing.name = tc.function.name;
                if (tc.function?.arguments) existing.arguments += tc.function.arguments;
              }
            }
          }

          if (!hasToolCalls) {
            continueLoop = false;
            break;
          }

          const assistantMessage: any = {
            role: 'assistant' as const,
            content: fullResponse || null,
            tool_calls: Array.from(toolCalls.values()).map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          };
          currentMessages.push(assistantMessage);

          for (const [, tc] of toolCalls) {
            let args: any = {};
            try {
              args = JSON.parse(tc.arguments);
            } catch {}

            let toolResult: any;

            if (tc.name !== 'query_data') {
              res.write(`data: ${JSON.stringify({ type: 'thinking', tool: tc.name, message: getThinkingMessage(tc.name, args, fields), toolArgs: args })}\n\n`);
            }

            switch (tc.name) {
              case 'query_data': {
                const targetTable = allBases.flatMap(b => b.tables).find(t => t.id === args.tableId);
                const thinkingMsg = getThinkingMessage('query_data', args, fields);
                const displayMsg = targetTable ? thinkingMsg.replace('from table', `from ${targetTable.name}`) : thinkingMsg;
                res.write(`data: ${JSON.stringify({ type: 'thinking', tool: 'query_data', message: displayMsg, toolArgs: args })}\n\n`);
                try {
                  const isCurrentBase = args.baseId === baseId;
                  const isApproved = approvedContexts.some((ac) => ac.baseId === args.baseId);
                  if (!isCurrentBase && !isApproved) {
                    toolResult = { error: 'Access to this base has not been approved. Use request_cross_base_access first.' };
                  } else {
                    const data = await queryTableData(
                      pool,
                      args.baseId,
                      args.tableId,
                      args.conditions || [],
                      args.limit || 100,
                      args.orderBy
                    );
                    toolResult = { recordCount: data.records.length, records: data.records };
                  }
                } catch (err: any) {
                  toolResult = { error: err.message };
                }
                break;
              }

              case 'apply_filter': {
                actionType = 'apply_filter';
                actionPayload = args.filterSet;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'apply_filter', payload: args.filterSet })}\n\n`);
                toolResult = { success: true, message: 'Filter applied to current view' };
                break;
              }

              case 'apply_sort': {
                actionType = 'apply_sort';
                actionPayload = args.sorts;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'apply_sort', payload: args.sorts })}\n\n`);
                toolResult = { success: true, message: 'Sort applied to current view' };
                break;
              }

              case 'apply_group_by': {
                actionType = 'apply_group_by';
                actionPayload = args.groups;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'apply_group_by', payload: args.groups })}\n\n`);
                toolResult = { success: true, message: 'Grouping applied to current view' };
                break;
              }

              case 'apply_conditional_color': {
                actionType = 'apply_conditional_color';
                actionPayload = args.rules;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'apply_conditional_color', payload: args.rules })}\n\n`);
                toolResult = { success: true, message: 'Conditional coloring rules applied' };
                break;
              }

              case 'clear_filter': {
                actionType = 'clear_filter';
                actionPayload = null;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'clear_filter', payload: null })}\n\n`);
                toolResult = { success: true, message: 'All filters cleared from current view' };
                break;
              }

              case 'clear_sort': {
                actionType = 'clear_sort';
                actionPayload = null;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'clear_sort', payload: null })}\n\n`);
                toolResult = { success: true, message: 'All sorts cleared from current view' };
                break;
              }

              case 'clear_group_by': {
                actionType = 'clear_group_by';
                actionPayload = null;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'clear_group_by', payload: null })}\n\n`);
                toolResult = { success: true, message: 'All grouping cleared from current view' };
                break;
              }

              case 'clear_conditional_color': {
                actionType = 'clear_conditional_color';
                actionPayload = null;
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'clear_conditional_color', payload: null })}\n\n`);
                toolResult = { success: true, message: 'All conditional color rules cleared from current view' };
                break;
              }

              case 'add_filter_condition': {
                actionType = 'add_filter_condition';
                actionPayload = { fieldId: args.fieldId, operator: args.operator, value: args.value };
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'add_filter_condition', payload: actionPayload })}\n\n`);
                toolResult = { success: true, message: 'Filter condition added to current view' };
                break;
              }

              case 'remove_filter_condition': {
                actionType = 'remove_filter_condition';
                actionPayload = { fieldId: args.fieldId, operator: args.operator || null };
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'remove_filter_condition', payload: actionPayload })}\n\n`);
                toolResult = { success: true, message: 'Filter condition removed from current view' };
                break;
              }

              case 'add_sort': {
                actionType = 'add_sort';
                actionPayload = { fieldId: args.fieldId, order: args.order };
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'add_sort', payload: actionPayload })}\n\n`);
                toolResult = { success: true, message: 'Sort rule added to current view' };
                break;
              }

              case 'remove_sort': {
                actionType = 'remove_sort';
                actionPayload = { fieldId: args.fieldId };
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'remove_sort', payload: actionPayload })}\n\n`);
                toolResult = { success: true, message: 'Sort rule removed from current view' };
                break;
              }

              case 'request_cross_base_access': {
                res.write(`data: ${JSON.stringify({
                  type: 'consent_request',
                  baseId: args.baseId,
                  baseName: args.baseName,
                  tableId: args.tableId || null,
                  tableName: args.tableName || null,
                })}\n\n`);
                toolResult = { success: true, message: 'Cross-base access request sent to user. Wait for approval before querying.' };
                break;
              }

              case 'create_record': {
                const isCurrentBase = args.baseId === baseId;
                const isApproved = approvedContexts.some((ac) => ac.baseId === args.baseId);
                if (!isCurrentBase && !isApproved) {
                  toolResult = { error: 'Access to this base has not been approved. Use request_cross_base_access first.' };
                  break;
                }
                try {
                  const result = await createRecord(pool, args.baseId, args.tableId, args.fields);
                  res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'create_record', payload: { recordId: result.id, fields: args.fields } })}\n\n`);
                  toolResult = { success: true, recordId: result.id, message: 'Record created successfully' };
                } catch (err: any) {
                  toolResult = { error: err.message };
                }
                break;
              }

              case 'update_record': {
                const isCurrentBase = args.baseId === baseId;
                const isApproved = approvedContexts.some((ac) => ac.baseId === args.baseId);
                if (!isCurrentBase && !isApproved) {
                  toolResult = { error: 'Access to this base has not been approved. Use request_cross_base_access first.' };
                  break;
                }
                try {
                  await updateRecord(pool, args.baseId, args.tableId, args.recordId, args.fields);
                  res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'update_record', payload: { recordId: args.recordId, fields: args.fields } })}\n\n`);
                  toolResult = { success: true, message: 'Record updated successfully' };
                } catch (err: any) {
                  toolResult = { error: err.message };
                }
                break;
              }

              case 'delete_record': {
                const isCurrentBase = args.baseId === baseId;
                const isApproved = approvedContexts.some((ac) => ac.baseId === args.baseId);
                if (!isCurrentBase && !isApproved) {
                  toolResult = { error: 'Access to this base has not been approved. Use request_cross_base_access first.' };
                  break;
                }
                try {
                  await deleteRecord(pool, args.baseId, args.tableId, args.recordId);
                  res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'delete_record', payload: { recordId: args.recordId } })}\n\n`);
                  toolResult = { success: true, message: 'Record deleted successfully' };
                } catch (err: any) {
                  toolResult = { error: err.message };
                }
                break;
              }

              case 'generate_formula': {
                res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'generate_formula', payload: { formula: args.formula, description: args.description } })}\n\n`);
                toolResult = { success: true, formula: args.formula, message: 'Formula generated' };
                break;
              }

              case 'summarize_data': {
                const isCurrentBase = args.baseId === baseId;
                const isApproved = approvedContexts.some((ac) => ac.baseId === args.baseId);
                if (!isCurrentBase && !isApproved) {
                  toolResult = { error: 'Access to this base has not been approved. Use request_cross_base_access first.' };
                  break;
                }
                try {
                  const result = await summarizeTableData(pool, {
                    baseId: args.baseId,
                    tableId: args.tableId,
                    aggregation: args.aggregation,
                    fieldDbName: args.fieldDbName,
                    groupByFields: args.groupByFields,
                    conditions: args.conditions,
                  });
                  toolResult = { success: true, summary: result.summary, results: result.results };
                } catch (err: any) {
                  toolResult = { error: err.message };
                }
                break;
              }

              case 'get_view_state': {
                const requestId = `vsr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                res.write(`data: ${JSON.stringify({ type: 'view_state_request', requestId })}\n\n`);
                try {
                  const freshViewState = await new Promise<any>((resolve) => {
                    const timer = setTimeout(() => {
                      pendingViewStateRequests.delete(`${id}:${requestId}`);
                      resolve(viewState || {});
                    }, 5000);
                    pendingViewStateRequests.set(`${id}:${requestId}`, { resolve, timer });
                  });
                  const resolveField = (fieldId: string): string => {
                    const field = fields.find(f => f.dbFieldName === fieldId);
                    return field ? field.name : fieldId;
                  };
                  const stateDescription: any = { filters: 'None', sorts: 'None', groups: 'None' };
                  if (freshViewState.filters?.conditions?.length > 0) {
                    stateDescription.filters = freshViewState.filters.conditions.map((c: any) =>
                      `${resolveField(c.fieldId)} ${(c.operator || '').replace(/_/g, ' ')} "${c.value ?? ''}"`
                    ).join(` ${freshViewState.filters.conjunction || 'and'} `);
                  }
                  if (freshViewState.sorts?.length > 0) {
                    stateDescription.sorts = freshViewState.sorts.map((s: any) =>
                      `${resolveField(s.fieldId)} ${s.direction === 'desc' ? 'descending' : 'ascending'}`
                    ).join(', ');
                  }
                  if (freshViewState.groups?.length > 0) {
                    stateDescription.groups = freshViewState.groups.map((g: any) =>
                      resolveField(g.fieldId)
                    ).join(', ');
                  }
                  toolResult = { success: true, viewState: stateDescription, raw: freshViewState };
                } catch (err: any) {
                  toolResult = { error: 'Failed to retrieve view state: ' + err.message };
                }
                break;
              }

              case 'bulk_update_records': {
                const isCurrentBase = args.baseId === baseId;
                const isApproved = approvedContexts.some((ac) => ac.baseId === args.baseId);
                if (!isCurrentBase && !isApproved) {
                  toolResult = { error: 'Access to this base has not been approved. Use request_cross_base_access first.' };
                  break;
                }
                try {
                  const result = await bulkUpdateRecords(pool, {
                    baseId: args.baseId,
                    tableId: args.tableId,
                    conditions: args.conditions || [],
                    fieldUpdates: args.fieldUpdates || {},
                  });
                  res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'bulk_update_records', payload: { conditions: args.conditions, fieldUpdates: args.fieldUpdates, updatedCount: result.updatedCount } })}\n\n`);
                  toolResult = { success: true, updatedCount: result.updatedCount, message: `Successfully updated ${result.updatedCount} record(s)` };
                } catch (err: any) {
                  toolResult = { error: err.message };
                }
                break;
              }

              case 'bulk_delete_records': {
                const isCurrentBase = args.baseId === baseId;
                const isApproved = approvedContexts.some((ac) => ac.baseId === args.baseId);
                if (!isCurrentBase && !isApproved) {
                  toolResult = { error: 'Access to this base has not been approved. Use request_cross_base_access first.' };
                  break;
                }
                try {
                  const result = await bulkDeleteRecords(pool, {
                    baseId: args.baseId,
                    tableId: args.tableId,
                    conditions: args.conditions || [],
                  });
                  res.write(`data: ${JSON.stringify({ type: 'action', actionType: 'bulk_delete_records', payload: { conditions: args.conditions, deletedCount: result.deletedCount } })}\n\n`);
                  toolResult = { success: true, deletedCount: result.deletedCount, message: `Successfully deleted ${result.deletedCount} record(s)` };
                } catch (err: any) {
                  toolResult = { error: err.message };
                }
                break;
              }

              default:
                toolResult = { error: `Unknown tool: ${tc.name}` };
            }

            currentMessages.push({
              role: 'tool' as const,
              tool_call_id: tc.id,
              content: JSON.stringify(toolResult),
            });
          }

          fullResponse = '';
        }
      } catch (err: any) {
        console.error('OpenAI streaming error:', err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      }

      await pool.query(
        `INSERT INTO ai_messages (id, conversation_id, role, content, action_type, action_payload) VALUES ($1, $2, $3, $4, $5, $6)`,
        [createId(), id, 'assistant', fullResponse, actionType, actionPayload ? JSON.stringify(actionPayload) : null]
      );

      const msgCount = await pool.query('SELECT COUNT(*) FROM ai_messages WHERE conversation_id = $1', [id]);
      if (parseInt(msgCount.rows[0].count) <= 2) {
        const title = content.length > 50 ? content.substring(0, 47) + '...' : content;
        await pool.query('UPDATE ai_conversations SET title = $1 WHERE id = $2', [title, id]);
        res.write(`data: ${JSON.stringify({ type: 'title_update', title })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error('Error in chat endpoint:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
        res.end();
      }
    }
  });

  return router;
}
