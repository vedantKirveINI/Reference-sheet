import { MODE } from "../../../constants/mode";

/**
 * Template cards for the Create Canvas Asset modal.
 * Each mode has 6 cards: Start from scratch (default) + 4 selectable templates + 1 disabled dummy.
 * suggestedName/suggestedDescription are used to populate the form when the template is selected.
 * "scratch" uses null to indicate fallback to defaultName/defaultDescription.
 * @typedef {{ id: string; title: string; description: string; suggestedName?: string | null; suggestedDescription?: string | null; disabled?: boolean }} TemplateItem
 * @type {Record<string, TemplateItem[]>}
 */
export const CREATE_CANVAS_ASSET_TEMPLATES = {
  [MODE.WORKFLOW_CANVAS]: [
    { id: "scratch", title: "Start from scratch", description: "Start with an empty form", suggestedName: null, suggestedDescription: null },
    { id: "template-1", title: "Contact Form", description: "Collect names, email, and message", suggestedName: "Contact Form", suggestedDescription: "A form to collect contact information including name, email, and message from visitors." },
    { id: "template-2", title: "Feedback Form", description: "Gather ratings and feedback", suggestedName: "Feedback Form", suggestedDescription: "Collect customer ratings and feedback to improve your product or service." },
    { id: "template-3", title: "Registration", description: "User sign-up and onboarding", suggestedName: "Registration Form", suggestedDescription: "User sign-up and onboarding flow for new accounts." },
    { id: "template-4", title: "Survey", description: "Multi-question surveys and polls", suggestedName: "Survey", suggestedDescription: "Multi-question survey to gather opinions and insights from respondents." },
    { id: "dummy", title: "More templates", description: "Coming soon", disabled: true },
  ],
  [MODE.WC_CANVAS]: [
    { id: "scratch", title: "Start from scratch", description: "Start with an empty canvas", suggestedName: null, suggestedDescription: null },
    { id: "template-1", title: "Lead to close", description: "Manage deals from lead to close", suggestedName: "Lead to Close", suggestedDescription: "Workflow to manage sales deals from initial lead through to close." },
    { id: "template-2", title: "Approval flow", description: "Request and approval workflows", suggestedName: "Approval Flow", suggestedDescription: "Request submission and multi-step approval workflow." },
    { id: "template-3", title: "Notifications", description: "Trigger notifications and alerts", suggestedName: "Notifications", suggestedDescription: "Trigger and send notifications or alerts based on events." },
    { id: "template-4", title: "Data sync", description: "Sync data between systems", suggestedName: "Data Sync", suggestedDescription: "Sync data between different systems and data sources." },
    { id: "dummy", title: "More templates", description: "Coming soon", disabled: true },
  ],
  [MODE.INTEGRATION_CANVAS]: [
    { id: "scratch", title: "Start from scratch", description: "Start with an empty integration", suggestedName: null, suggestedDescription: null },
    { id: "template-1", title: "API sync", description: "Sync data via REST or GraphQL", suggestedName: "API Sync", suggestedDescription: "Sync data between systems using REST or GraphQL APIs." },
    { id: "template-2", title: "Webhook handler", description: "Receive and process webhooks", suggestedName: "Webhook Handler", suggestedDescription: "Receive and process incoming webhook events from external services." },
    { id: "template-3", title: "Scheduled job", description: "Run on a schedule", suggestedName: "Scheduled Job", suggestedDescription: "Run integration tasks on a defined schedule." },
    { id: "template-4", title: "Event pipeline", description: "Process events end to end", suggestedName: "Event Pipeline", suggestedDescription: "Process and route events through a pipeline of handlers." },
    { id: "dummy", title: "More templates", description: "Coming soon", disabled: true },
  ],
  [MODE.CMS_CANVAS]: [
    { id: "scratch", title: "Start from scratch", description: "Start with an empty event", suggestedName: null, suggestedDescription: null },
    { id: "template-1", title: "Content published", description: "When content goes live", suggestedName: "Content Published", suggestedDescription: "Triggered when content is published or goes live." },
    { id: "template-2", title: "User signup", description: "New user registration events", suggestedName: "User Signup", suggestedDescription: "Triggered when a new user completes registration." },
    { id: "template-3", title: "Form submitted", description: "Form submission triggers", suggestedName: "Form Submitted", suggestedDescription: "Triggered when a form is submitted." },
    { id: "template-4", title: "Order placed", description: "E-commerce order events", suggestedName: "Order Placed", suggestedDescription: "Triggered when an order is placed in e-commerce." },
    { id: "dummy", title: "More templates", description: "Coming soon", disabled: true },
  ],
  [MODE.AGENT_CANVAS]: [
    { id: "scratch", title: "Start from scratch", description: "Start with an empty agent", suggestedName: null, suggestedDescription: null },
    { id: "template-1", title: "Customer support", description: "Answer questions and resolve issues", suggestedName: "Customer Support Agent", suggestedDescription: "AI agent that answers customer questions and helps resolve issues." },
    { id: "template-2", title: "Data analyst", description: "Query and summarize data", suggestedName: "Data Analyst Agent", suggestedDescription: "AI agent that queries and summarizes data for insights." },
    { id: "template-3", title: "Content writer", description: "Draft and refine content", suggestedName: "Content Writer Agent", suggestedDescription: "AI agent that drafts and refines written content." },
    { id: "template-4", title: "Code assistant", description: "Explain and generate code", suggestedName: "Code Assistant Agent", suggestedDescription: "AI agent that explains and helps generate code." },
    { id: "dummy", title: "More templates", description: "Coming soon", disabled: true },
  ],
  [MODE.TOOL_CANVAS]: [
    { id: "scratch", title: "Start from scratch", description: "Start with an empty AI tool", suggestedName: null, suggestedDescription: null },
    { id: "template-1", title: "Search", description: "Search across data or APIs", suggestedName: "Search Tool", suggestedDescription: "AI tool to search across data sources or APIs." },
    { id: "template-2", title: "Calculator", description: "Compute or transform inputs", suggestedName: "Calculator Tool", suggestedDescription: "AI tool to compute or transform user inputs." },
    { id: "template-3", title: "Notifier", description: "Send alerts or messages", suggestedName: "Notifier Tool", suggestedDescription: "AI tool to send alerts or messages based on context." },
    { id: "template-4", title: "Lookup", description: "Fetch and return structured data", suggestedName: "Lookup Tool", suggestedDescription: "AI tool to fetch and return structured data." },
    { id: "dummy", title: "More templates", description: "Coming soon", disabled: true },
  ],
};

/** Default templates for unknown mode (e.g. SEQUENCE_CANVAS) - same as WC_CANVAS */
const DEFAULT_TEMPLATES = CREATE_CANVAS_ASSET_TEMPLATES[MODE.WC_CANVAS];

/**
 * @param {string} mode
 * @returns {TemplateItem[]}
 */
export const getTemplatesForMode = (mode) => {
  return CREATE_CANVAS_ASSET_TEMPLATES[mode] ?? DEFAULT_TEMPLATES;
};
