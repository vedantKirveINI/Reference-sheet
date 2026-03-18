import posthog from "posthog-js";

export const analytics = {
  // Identity
  identify: (userId: string, props: Record<string, unknown>) =>
    posthog.identify(userId, props),

  // Table lifecycle
  tableCreated: (props: { from_template: boolean; template_name?: string; workspace_id?: string }) =>
    posthog.capture("table_created", props),

  // View
  viewChanged: (props: { view_type: string; table_id?: string }) =>
    posthog.capture("view_changed", props),

  // Data operations
  filterApplied: (props: { rule_count: number; table_id?: string }) =>
    posthog.capture("table_filter_applied", props),

  sortApplied: (props: { rule_count: number; table_id?: string }) =>
    posthog.capture("table_sort_applied", props),

  groupApplied: (props: { rule_count: number; table_id?: string }) =>
    posthog.capture("table_group_applied", props),

  recordAdded: (props: { table_id?: string }) =>
    posthog.capture("record_added", props),

  dataImported: (props: { file_type?: string; mode: "existing" | "new" }) =>
    posthog.capture("data_imported", props),

  dataExported: (props: { table_id?: string }) =>
    posthog.capture("data_exported", props),

  // Sharing
  tableShared: (props: { table_id?: string; role?: string }) =>
    posthog.capture("table_shared", props),

  // AI
  aiEnrichmentStarted: (props: { table_id?: string }) =>
    posthog.capture("ai_enrichment_started", props),
};
