import OpenAI from "openai";
import * as dbStudio from "../../db-studio.js";

export class TriggerResolver {
  constructor(openai) {
    this.openai = openai;
  }

  async resolve(description) {
    if (!this.openai) {
      console.warn("[TriggerResolver] No OpenAI client available, defaulting to manual trigger");
      return this._buildBuiltInResult({ type: "manual", app_name: null, event_hint: null, reasoning: "No OpenAI client available" });
    }

    const classification = await this._classifyIntent(description);
    
    // Step 2: If app-event, search for the trigger integration
    if (classification.type === "app_event") {
      const searchResult = await this._searchAppTrigger(classification.app_name, classification.event_hint);
      return this._buildResult(classification, searchResult);
    }

    // For non-app triggers, return the classification directly
    return this._buildBuiltInResult(classification);
  }

  async _classifyIntent(description) {
    // Use structured output with gpt-4o-mini for fast, reliable classification
    const systemPrompt = `You are a trigger classifier for a workflow automation platform. Given a user's workflow description, determine what should START/TRIGGER the workflow.

Classify into exactly one of these categories:
- "app_event": The workflow should start when something happens in an external app/service (e.g., "when a lead is created in HubSpot", "every time someone pays on Stripe", "whenever a new message arrives in Slack", "when a new email comes in Gmail"). Look for phrases like "when", "whenever", "every time", "as soon as", "on new", etc. combined with an app/service name.
- "scheduled": The workflow runs on a time schedule (e.g., "every day at 9am", "every hour", "weekly on Monday", "at noon daily")
- "form": The workflow is triggered by a form submission (e.g., "when someone submits a form", "on form submission")
- "webhook": The workflow is triggered by an external webhook/API call (e.g., "when my API receives a call", "on webhook")
- "manual": The workflow is triggered manually by the user clicking Run, OR you cannot determine a specific trigger from the description

For "app_event", also extract:
- app_name: The name of the app/service (e.g., "HubSpot", "Slack", "Stripe", "Gmail")
- event_hint: What event in that app triggers it (e.g., "contact created", "new message", "payment received", "new email")

IMPORTANT: If the user says "when [something happens] in [App]" — that is almost always "app_event", NOT "manual".

Respond with ONLY valid JSON, no markdown or explanation.`;

    const userPrompt = `Classify the trigger for this workflow description: "${description}"

Return JSON: { "type": "app_event"|"scheduled"|"form"|"webhook"|"manual", "app_name": "string or null", "event_hint": "string or null", "reasoning": "brief explanation" }`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 256,
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      
      console.log(`[TriggerResolver] Classification result:`, JSON.stringify(parsed));
      
      return {
        type: parsed.type || "manual",
        app_name: parsed.app_name || null,
        event_hint: parsed.event_hint || null,
        reasoning: parsed.reasoning || "",
      };
    } catch (error) {
      console.error(`[TriggerResolver] Classification failed:`, error.message);
      return { type: "manual", app_name: null, event_hint: null, reasoning: "Classification failed, defaulting to manual" };
    }
  }

  _getAppAliases(appName) {
    const name = appName.toLowerCase().trim();
    const aliasMap = {
      gmail: ["Google Mail", "Google Gmail", "google-gmail"],
      "google mail": ["Gmail", "Google Gmail", "google-gmail"],
      slack: ["Slack App", "slack-app"],
      hubspot: ["HubSpot CRM", "hubspot-crm"],
      stripe: ["Stripe Payments", "stripe-payments"],
      salesforce: ["Salesforce CRM", "salesforce-crm"],
      outlook: ["Microsoft Outlook", "microsoft-outlook", "Outlook Mail"],
      "microsoft outlook": ["Outlook", "outlook-mail"],
      trello: ["Trello Board", "trello-board"],
      asana: ["Asana Tasks", "asana-tasks"],
      notion: ["Notion App", "notion-app"],
      jira: ["Jira Software", "jira-software", "Atlassian Jira"],
      github: ["GitHub App", "github-app"],
      discord: ["Discord App", "discord-app"],
      shopify: ["Shopify Store", "shopify-store"],
      mailchimp: ["Mailchimp Email", "mailchimp-email"],
      zendesk: ["Zendesk Support", "zendesk-support"],
      intercom: ["Intercom App", "intercom-app"],
      airtable: ["Airtable Base", "airtable-base"],
      calendly: ["Calendly Scheduling", "calendly-scheduling"],
      twilio: ["Twilio SMS", "twilio-sms"],
      sendgrid: ["SendGrid Email", "sendgrid-email"],
      dropbox: ["Dropbox Storage", "dropbox-storage"],
      "google sheets": ["Google Spreadsheet", "google-sheets"],
      "google drive": ["Google Drive Storage", "google-drive"],
      "google calendar": ["Google Cal", "google-calendar"],
    };
    return aliasMap[name] || [];
  }

  async _searchAppTrigger(appName, eventHint) {
    if (!appName) {
      return { found: false, results: [], tier: "none", searchQueries: [] };
    }

    const searchQueries = [];
    
    // Tier 1: Specific query — app name + event hint, kind="trigger"
    if (eventHint) {
      const specificQuery = `${appName} ${eventHint}`;
      searchQueries.push({ tier: 1, query: specificQuery, kind: "trigger" });
      
      try {
        const results = await dbStudio.searchIntegrationKnowledgeV2(specificQuery, {
          limit: 5,
          similarityThreshold: 0.5,
          kind: "trigger",
        });
        
        console.log(`[TriggerResolver] Tier 1 search "${specificQuery}" (kind=trigger): ${results.length} results`);
        
        if (results.length > 0) {
          return { found: true, results, tier: 1, searchQueries };
        }
      } catch (error) {
        console.error(`[TriggerResolver] Tier 1 search failed:`, error.message);
      }

      const aliases = this._getAppAliases(appName);
      for (const alias of aliases) {
        const aliasQuery = `${alias} ${eventHint}`;
        searchQueries.push({ tier: 1.5, query: aliasQuery, kind: "trigger" });

        try {
          const results = await dbStudio.searchIntegrationKnowledgeV2(aliasQuery, {
            limit: 5,
            similarityThreshold: 0.5,
            kind: "trigger",
          });

          console.log(`[TriggerResolver] Tier 1.5 alias search "${aliasQuery}" (kind=trigger): ${results.length} results`);

          if (results.length > 0) {
            return { found: true, results, tier: 1.5, searchQueries };
          }
        } catch (error) {
          console.error(`[TriggerResolver] Tier 1.5 alias search failed:`, error.message);
        }
      }
    }

    // Tier 2: Broader query — just app name, kind="trigger"
    const broadQuery = appName;
    searchQueries.push({ tier: 2, query: broadQuery, kind: "trigger" });
    
    try {
      const results = await dbStudio.searchIntegrationKnowledgeV2(broadQuery, {
        limit: 5,
        similarityThreshold: 0.4,
        kind: "trigger",
      });
      
      console.log(`[TriggerResolver] Tier 2 search "${broadQuery}" (kind=trigger): ${results.length} results`);
      
      if (results.length > 0) {
        return { found: true, results, tier: 2, searchQueries };
      }
    } catch (error) {
      console.error(`[TriggerResolver] Tier 2 search failed:`, error.message);
    }

    const aliases = this._getAppAliases(appName);
    for (const alias of aliases) {
      searchQueries.push({ tier: 2.5, query: alias, kind: "trigger" });

      try {
        const results = await dbStudio.searchIntegrationKnowledgeV2(alias, {
          limit: 5,
          similarityThreshold: 0.4,
          kind: "trigger",
        });

        console.log(`[TriggerResolver] Tier 2.5 alias search "${alias}" (kind=trigger): ${results.length} results`);

        if (results.length > 0) {
          return { found: true, results, tier: 2.5, searchQueries };
        }
      } catch (error) {
        console.error(`[TriggerResolver] Tier 2.5 alias search failed:`, error.message);
      }
    }

    // Tier 3: No kind filter — search broadly for the app + "trigger"
    const fallbackQuery = `${appName} trigger`;
    searchQueries.push({ tier: 3, query: fallbackQuery, kind: null });
    
    try {
      const results = await dbStudio.searchIntegrationKnowledgeV2(fallbackQuery, {
        limit: 5,
        similarityThreshold: 0.3,
        kind: null,
      });
      
      // Filter to only trigger-kind results if any
      const triggerResults = results.filter(r => r.kind === "trigger");
      const relevantResults = triggerResults.length > 0 ? triggerResults : results;
      
      console.log(`[TriggerResolver] Tier 3 search "${fallbackQuery}" (no kind): ${results.length} total, ${triggerResults.length} trigger-kind`);
      
      if (relevantResults.length > 0) {
        return { found: true, results: relevantResults, tier: 3, searchQueries, hadToFallback: true };
      }
    } catch (error) {
      console.error(`[TriggerResolver] Tier 3 search failed:`, error.message);
    }

    // Tier 4: Event hint only (no app name), kind=null, low threshold
    if (eventHint) {
      searchQueries.push({ tier: 4, query: eventHint, kind: null });

      try {
        const results = await dbStudio.searchIntegrationKnowledgeV2(eventHint, {
          limit: 5,
          similarityThreshold: 0.2,
          kind: null,
        });

        const triggerResults = results.filter(r => r.kind === "trigger");
        const relevantResults = triggerResults.length > 0 ? triggerResults : results;

        console.log(`[TriggerResolver] Tier 4 search "${eventHint}" (no kind, threshold 0.2): ${results.length} total, ${triggerResults.length} trigger-kind`);

        if (relevantResults.length > 0) {
          return { found: true, results: relevantResults, tier: 4, searchQueries, hadToFallback: true };
        }
      } catch (error) {
        console.error(`[TriggerResolver] Tier 4 search failed:`, error.message);
      }
    }

    return { found: false, results: [], tier: "none", searchQueries };
  }

  _pickBestMatch(results, eventHint) {
    if (!results || results.length === 0) return null;
    if (results.length === 1) return results[0];

    // If we have an event hint, try to find the closest match by title
    if (eventHint) {
      const hintLower = eventHint.toLowerCase();
      const hintWords = hintLower.split(/\s+/);
      
      let bestMatch = results[0];
      let bestScore = 0;
      
      for (const result of results) {
        const titleLower = (result.title || "").toLowerCase();
        const descLower = (result.content || result.enrichedDescription || "").toLowerCase();
        let score = 0;
        
        for (const word of hintWords) {
          if (titleLower.includes(word)) score += 2;
          if (descLower.includes(word)) score += 1;
        }
        
        // Boost for exact kind match
        if (result.kind === "trigger") score += 3;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = result;
        }
      }
      
      return bestMatch;
    }

    // No event hint — return the first trigger-kind result, or the top result
    const triggerResult = results.find(r => r.kind === "trigger");
    return triggerResult || results[0];
  }

  _buildResult(classification, searchResult) {
    if (!searchResult.found) {
      return {
        classification: classification.type,
        confidence: "NONE",
        resolvedTrigger: null,
        fallbackType: "TRIGGER_SETUP_V3",
        reasoning: `Could not find an app-based trigger integration for "${classification.app_name}" in the database. IMPORTANT: You MUST use TRIGGER_SETUP_V3 as the trigger type. Do NOT substitute with SHEET_TRIGGER_V2, SHEET_DATE_FIELD_TRIGGER, or any other trigger type. TRIGGER_SETUP_V3 is the correct fallback — it allows the user to manually configure the trigger for "${classification.app_name}" later. Using any sheet-based trigger would be incorrect since the user wants "${classification.app_name}", not a TinySheet trigger.`,
        searchDetails: {
          appName: classification.app_name,
          eventHint: classification.event_hint,
          searchQueries: searchResult.searchQueries,
          resultCount: 0,
        },
      };
    }

    const bestMatch = this._pickBestMatch(searchResult.results, classification.event_hint);
    
    const isTriggerKind = bestMatch.kind === "trigger";
    const confidence = searchResult.tier === 1 && isTriggerKind
      ? "HIGH"
      : searchResult.tier <= 2 && isTriggerKind
        ? "MEDIUM"
        : "LOW";

    const resolvedTrigger = {
      type: bestMatch.workflowNodeIdentifier,
      is_trigger: true,
      name: bestMatch.title || `${classification.app_name} Trigger`,
      description: bestMatch.content || bestMatch.enrichedDescription || `Triggers when ${classification.event_hint || "an event occurs"} in ${classification.app_name}`,
      config: {},
      _resolver_meta: {
        integrationSlug: bestMatch.integrationSlug || bestMatch.extensionSlug,
        eventSlug: bestMatch.eventSlug,
        kind: bestMatch.kind,
        workflowNodeIdentifier: bestMatch.workflowNodeIdentifier,
        confidence,
        searchTier: searchResult.tier,
      },
    };

    return {
      classification: classification.type,
      confidence,
      resolvedTrigger,
      reasoning: this._buildReasoning(classification, bestMatch, searchResult, confidence),
      searchDetails: {
        appName: classification.app_name,
        eventHint: classification.event_hint,
        searchQueries: searchResult.searchQueries,
        resultCount: searchResult.results.length,
        selectedMatch: bestMatch.title,
        selectedKind: bestMatch.kind,
      },
    };
  }

  _buildBuiltInResult(classification) {
    const typeMap = {
      scheduled: {
        type: "TIME_BASED_TRIGGER_V2",
        name: "Scheduled Trigger",
        description: "Runs on a time-based schedule",
      },
      form: {
        type: "FORM_TRIGGER",
        name: "Form Trigger",
        description: "Triggers when a form is submitted",
      },
      webhook: {
        type: "CUSTOM_WEBHOOK",
        name: "Webhook Trigger",
        description: "Triggers when an external webhook is received",
      },
      manual: {
        type: "TRIGGER_SETUP_V3",
        name: "Manual Trigger",
        description: "Manual trigger — user clicks Run to start",
      },
    };

    const triggerDef = typeMap[classification.type] || typeMap.manual;

    return {
      classification: classification.type,
      confidence: "HIGH",
      resolvedTrigger: {
        type: triggerDef.type,
        is_trigger: false,
        name: triggerDef.name,
        description: triggerDef.description,
        config: {},
      },
      reasoning: classification.reasoning || `Using ${triggerDef.name} based on user description.`,
      searchDetails: null,
    };
  }

  _buildReasoning(classification, bestMatch, searchResult, confidence) {
    const parts = [`Detected "${classification.app_name}" app event: "${classification.event_hint}".`];
    
    if (confidence === "HIGH") {
      parts.push(`Found exact trigger match: "${bestMatch.title}" (${bestMatch.workflowNodeIdentifier}).`);
    } else if (confidence === "MEDIUM") {
      parts.push(`Found related trigger: "${bestMatch.title}" (search tier ${searchResult.tier}).`);
    } else {
      parts.push(`Found possible match: "${bestMatch.title}" but confidence is low (kind=${bestMatch.kind}, tier=${searchResult.tier}).`);
    }
    
    return parts.join(" ");
  }
}
