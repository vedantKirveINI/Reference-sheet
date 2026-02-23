import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import pool from './db';
import { buildSystemPrompt, openAITools, PromptContext } from './prompt-engine';
import { queryTableData, getTableSchema, getAllAccessibleBases, createRecord, updateRecord, deleteRecord } from './data-query';

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

function getThinkingMessage(toolName: string, args: any): string {
  switch (toolName) {
    case 'query_data':
      return `Querying ${args.tableId || 'unknown'} table...`;
    case 'apply_filter':
      return 'Preparing filter...';
    case 'apply_sort':
      return 'Setting up sort order...';
    case 'apply_group_by':
      return 'Organizing groups...';
    case 'apply_conditional_color':
      return 'Applying color rules...';
    case 'request_cross_base_access':
      return `Requesting access to ${args.baseName}...`;
    case 'create_record':
      return 'Creating new record...';
    case 'update_record':
      return 'Updating record...';
    case 'delete_record':
      return 'Preparing to delete record...';
    case 'generate_formula':
      return 'Generating formula...';
    default:
      return `Processing ${toolName}...`;
  }
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
        `INSERT INTO ai_conversations (user_id, title, current_base_id, current_table_id, current_view_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, title || 'New Conversation', baseId || null, tableId || null, viewId || null]
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
        `INSERT INTO ai_approved_contexts (conversation_id, base_id, table_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [id, baseId, tableId || null]
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error approving context:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/conversations/:id/chat', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { content, baseId, tableId, viewId } = req.body;

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
        `INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
        [id, 'user', content]
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
              res.write(`data: ${JSON.stringify({ type: 'thinking', tool: tc.name, message: getThinkingMessage(tc.name, args) })}\n\n`);
            }

            switch (tc.name) {
              case 'query_data': {
                const targetTable = allBases.flatMap(b => b.tables).find(t => t.id === args.tableId);
                const thinkingMsg = targetTable ? `Querying ${targetTable.name} table...` : 'Querying table data...';
                res.write(`data: ${JSON.stringify({ type: 'thinking', tool: 'query_data', message: thinkingMsg })}\n\n`);
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
        `INSERT INTO ai_messages (conversation_id, role, content, action_type, action_payload) VALUES ($1, $2, $3, $4, $5)`,
        [id, 'assistant', fullResponse, actionType, actionPayload ? JSON.stringify(actionPayload) : null]
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
