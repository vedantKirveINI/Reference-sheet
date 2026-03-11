# Server scripts

## Solution basis (integration knowledge v2)

The canvas assistant uses `integration_knowledge_v2` for external integration search and validation. A small amount of sample data in that table is enough to exercise the flow: the assistant searches v2 first via `searchExternalExtensions`, can call `getExtensionKnowledge(workflow_node_identifier)` for full schema, and `GenerateFlowHandler` accepts node types found in v2. Re-run the enrichment script only when you need to backfill more integrations or refresh data.

## enrich-integrations.js

Populates the `integration_knowledge_v2` table by fetching integrations from the Asset API, loading published flows from the Canvas API, enriching each event with OpenAI, and upserting rows. Runs events in parallel (see `ENRICH_CONCURRENCY`).

### How to run

From the project root:

```bash
node server/scripts/enrich-integrations.js [--workspace-id=WORKSPACE_ID]
```

Or use the npm script:

```bash
npm run script:enrich-integrations [-- --workspace-id=WORKSPACE_ID]
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INTEGRATION_KNOWLEDGE_TOKEN` or `ACCESS_TOKEN` | Yes | Auth token for Asset and Canvas APIs. |
| `OUTE_SERVER` or `REACT_APP_OUTE_SERVER` | No | Asset API base URL (default: `http://localhost:3101`). |
| `STUDIO_SERVER` or `REACT_APP_STUDIO_SERVER` | No | Canvas API base URL (default: `http://localhost:3003`). |
| `WORKSPACE_ID` | No | Workspace ID for `getEvents` (default: `default`). Overridable via `--workspace-id`. |
| `OPENAI_API_KEY` | Yes for enrichment | Used for enrichment and embeddings. |
| `DATABASE_URL` or `PGHOST`/`PGUSER`/etc. | Yes | PostgreSQL connection for `integration_knowledge_v2`. |
| `ENRICHMENT_MODEL` | No | OpenAI model for enrichment (default: `gpt-4o-mini`). |
| `ENRICH_CONCURRENCY` | No | Number of events to process in parallel (default: `10`). |

### Obtaining a token

1. Open the app in the browser and log in.
2. Open the Command Palette (e.g. Cmd/Ctrl+Shift+P) once so the app loads integration config.
3. In the browser console, copy the value of `window.accessToken` (if exposed for debugging).
4. Set it in your environment: `export INTEGRATION_KNOWLEDGE_TOKEN="<paste>"`.

If the app does not log the token, you may need to temporarily add a one-off log in the code path that runs when the Command Palette is opened (e.g. in `useSearchConfig.js` when `getAllConfigsCombined` runs), then remove it after copying the token. Do not leave token logging in production code.

### Idempotency

The script upserts by `(integration_id, event_id)`. Re-running it refreshes existing rows and adds new ones.

### Scheduling

No cron is configured by default. You can run the script periodically via cron or a job runner using the same CLI and env.
