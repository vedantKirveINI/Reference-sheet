/**
 * Node Descriptions Registry
 * 
 * Rich descriptions for all node types in the Command Palette.
 * Used for preview panel display and fuzzy search matching.
 * 
 * Schema:
 * - id: Unique identifier matching node type/subType
 * - title: Display name
 * - tagline: One punchy line (shown prominently)
 * - description: 2-3 friendly sentences for non-technical users
 * - useCases: Array of real-world examples (carousel)
 * - keywords: Searchable terms for fuzzy matching
 * - tips: Optional pro tips
 * - category: Node category for styling
 * 
 * Icons use Lucide React icon names for professional appearance.
 */

// ============================================
// QUESTION NODES
// ============================================

export const QUESTION_DESCRIPTIONS = {
  SHORT_TEXT: {
    id: "SHORT_TEXT",
    title: "Short Answer",
    tagline: "Capture quick answers in a single line",
    description: "Perfect for collecting **names**, **titles**, or any brief response. Keep your forms clean and focused with concise text fields that guide users to give you exactly what you need.",
    useCases: [
      { icon: "User", text: "Collect customer names for personalization" },
      { icon: "Building2", text: "Ask for company or brand names" },
      { icon: "Briefcase", text: "Gather job titles or roles" },
      { icon: "AtSign", text: "Request social media handles" },
    ],
    keywords: ["name", "text", "input", "field", "short", "single line", "title", "brief", "quick"],
    tips: "Great for fields that need validation like usernames or IDs",
    category: "question",
  },

  LONG_TEXT: {
    id: "LONG_TEXT",
    title: "Long Answer",
    tagline: "Let people share their full story",
    description: "When you need **detailed feedback**, **descriptions**, or **open-ended responses**, this gives your users the space to express themselves fully. Ideal for qualitative insights.",
    useCases: [
      { icon: "MessageSquare", text: "Collect detailed customer feedback" },
      { icon: "FileText", text: "Gather project descriptions or briefs" },
      { icon: "Lightbulb", text: "Ask for feature suggestions or ideas" },
      { icon: "BookOpen", text: "Request bio or about me sections" },
    ],
    keywords: ["paragraph", "description", "feedback", "comments", "textarea", "long", "detailed", "essay", "message"],
    tips: "Set a character limit to keep responses focused",
    category: "question",
  },

  EMAIL: {
    id: "EMAIL",
    title: "Email Address",
    tagline: "Collect verified email addresses",
    description: "Automatically validates email format so you never get invalid addresses. Perfect for **newsletters**, **account creation**, or **follow-up communications**.",
    useCases: [
      { icon: "Mail", text: "Build your newsletter subscriber list" },
      { icon: "Lock", text: "Collect login credentials for accounts" },
      { icon: "Send", text: "Gather contact info for follow-ups" },
      { icon: "Gift", text: "Send discount codes or offers" },
    ],
    keywords: ["email", "mail", "contact", "newsletter", "subscribe", "address", "inbox"],
    tips: "Combine with email sending nodes to auto-respond",
    category: "question",
  },

  PHONE_NUMBER: {
    id: "PHONE_NUMBER",
    title: "Phone Number",
    tagline: "Get properly formatted phone numbers",
    description: "Smart phone input with **country code detection** and format validation. Never miss a lead because of incorrectly entered numbers.",
    useCases: [
      { icon: "Smartphone", text: "Collect numbers for SMS campaigns" },
      { icon: "Phone", text: "Schedule sales or support callbacks" },
      { icon: "ShieldCheck", text: "Enable two-factor authentication" },
      { icon: "Truck", text: "Gather delivery contact numbers" },
    ],
    keywords: ["phone", "telephone", "mobile", "cell", "number", "call", "sms", "contact"],
    tips: "Works great with Twilio for automated SMS",
    category: "question",
  },

  NUMBER: {
    id: "NUMBER",
    title: "Number",
    tagline: "Collect numerical values with precision",
    description: "Accept only **numeric inputs** with optional min/max limits. Great for quantities, ratings, budgets, or any value you need to calculate with later.",
    useCases: [
      { icon: "ShoppingCart", text: "Ask for order quantities" },
      { icon: "DollarSign", text: "Collect budget or pricing info" },
      { icon: "BarChart3", text: "Gather age or years of experience" },
      { icon: "Star", text: "Get numeric ratings (1-10)" },
    ],
    keywords: ["number", "numeric", "quantity", "amount", "count", "integer", "decimal", "value"],
    tips: "Set min/max to prevent unrealistic values",
    category: "question",
  },

  DATE: {
    id: "DATE",
    title: "Date Picker",
    tagline: "Pick dates with a beautiful calendar",
    description: "An intuitive **date picker** that makes scheduling easy. Users see a visual calendar to select dates, eliminating format confusion.",
    useCases: [
      { icon: "Calendar", text: "Schedule appointments or meetings" },
      { icon: "Cake", text: "Collect birth dates for personalization" },
      { icon: "Rocket", text: "Set project deadlines or launch dates" },
      { icon: "Plane", text: "Book travel or event dates" },
    ],
    keywords: ["date", "calendar", "schedule", "appointment", "birthday", "deadline", "booking"],
    tips: "Combine with Time node for full datetime collection",
    category: "question",
  },

  TIME: {
    id: "TIME",
    title: "Time Picker",
    tagline: "Capture precise time selections",
    description: "Easy-to-use **time picker** for scheduling and appointments. Users can select hours and minutes without typing.",
    useCases: [
      { icon: "Clock", text: "Set meeting or call times" },
      { icon: "UtensilsCrossed", text: "Book restaurant reservations" },
      { icon: "Dumbbell", text: "Schedule class or session times" },
      { icon: "Package", text: "Choose delivery time windows" },
    ],
    keywords: ["time", "hour", "minute", "clock", "schedule", "appointment", "slot"],
    tips: "Pair with Date for complete scheduling",
    category: "question",
  },

  MCQ: {
    id: "MCQ",
    title: "Multiple Choice",
    tagline: "Let users pick one or more options",
    description: "Present a list of options and let users **select multiple answers**. Perfect for surveys, preferences, and gathering multi-faceted feedback.",
    useCases: [
      { icon: "ClipboardList", text: "Run product preference surveys" },
      { icon: "Target", text: "Understand customer interests" },
      { icon: "PieChart", text: "Collect market research data" },
      { icon: "CheckSquare", text: "Create checklists or requirements" },
    ],
    keywords: ["multiple choice", "checkbox", "select", "options", "survey", "poll", "multi-select"],
    tips: "Use 'Other' option to catch edge cases",
    category: "question",
  },

  DROP_DOWN: {
    id: "DROP_DOWN",
    title: "Dropdown",
    tagline: "Clean selection from a list of options",
    description: "A **space-saving dropdown** menu for single selections. Keeps your form tidy while offering many choices without visual clutter.",
    useCases: [
      { icon: "Globe", text: "Select country or region" },
      { icon: "Boxes", text: "Choose product categories" },
      { icon: "Users", text: "Pick department or team" },
      { icon: "CreditCard", text: "Select payment method" },
    ],
    keywords: ["dropdown", "select", "list", "menu", "picker", "choice", "single select"],
    tips: "Great for 5+ options to keep forms compact",
    category: "question",
  },

  YES_NO: {
    id: "YES_NO",
    title: "Yes / No",
    tagline: "Simple binary decisions made easy",
    description: "Perfect for **quick confirmations** and simple choices. Clear, unambiguous responses that are easy to act on in your workflows.",
    useCases: [
      { icon: "CheckCircle", text: "Confirm terms and conditions" },
      { icon: "Mail", text: "Opt-in for email marketing" },
      { icon: "Bell", text: "Enable or disable notifications" },
      { icon: "Gift", text: "Ask about interest in offers" },
    ],
    keywords: ["yes", "no", "boolean", "confirm", "toggle", "binary", "agree", "accept"],
    tips: "Use for branch logic in your workflows",
    category: "question",
  },

  RATING: {
    id: "RATING",
    title: "Star Rating",
    tagline: "Capture satisfaction with stars",
    description: "Beautiful **star rating** component for quick sentiment feedback. Users instantly understand how to express their satisfaction level.",
    useCases: [
      { icon: "Star", text: "Collect product reviews" },
      { icon: "Smile", text: "Measure customer satisfaction" },
      { icon: "Film", text: "Rate content or experiences" },
      { icon: "GraduationCap", text: "Evaluate service quality" },
    ],
    keywords: ["rating", "stars", "review", "satisfaction", "score", "feedback", "nps"],
    tips: "Follow up with Long Text to understand low ratings",
    category: "question",
  },

  RANKING: {
    id: "RANKING",
    title: "Ranking",
    tagline: "Let users order items by preference",
    description: "Drag-and-drop interface for **ranking items** in order of importance. Understand priorities and preferences at a glance.",
    useCases: [
      { icon: "Trophy", text: "Prioritize feature requests" },
      { icon: "BarChart", text: "Rank product preferences" },
      { icon: "Target", text: "Order goals or objectives" },
      { icon: "Briefcase", text: "Stack-rank job priorities" },
    ],
    keywords: ["ranking", "order", "priority", "sort", "drag", "arrange", "preference"],
    tips: "Limit to 5-7 items for best user experience",
    category: "question",
  },

  FILE_PICKER: {
    id: "FILE_PICKER",
    title: "File Upload",
    tagline: "Accept documents, images, and files",
    description: "Let users **upload files** directly through your form. Support for images, PDFs, documents, and more with size limits you control.",
    useCases: [
      { icon: "FileText", text: "Collect resumes or CVs" },
      { icon: "Image", text: "Gather portfolio images" },
      { icon: "ClipboardCheck", text: "Accept signed documents" },
      { icon: "FolderOpen", text: "Receive project briefs" },
    ],
    keywords: ["file", "upload", "document", "image", "attachment", "pdf", "resume"],
    tips: "Set allowed file types to prevent unwanted uploads",
    category: "question",
  },

  SIGNATURE: {
    id: "SIGNATURE",
    title: "Signature",
    tagline: "Capture legally binding e-signatures",
    description: "A smooth **signature pad** for collecting digital signatures. Perfect for contracts, agreements, and official approvals.",
    useCases: [
      { icon: "PenTool", text: "Sign contracts and agreements" },
      { icon: "ScrollText", text: "Approve official documents" },
      { icon: "Home", text: "Complete rental or lease forms" },
      { icon: "Handshake", text: "Onboard new clients" },
    ],
    keywords: ["signature", "sign", "autograph", "approval", "contract", "legal", "consent"],
    tips: "Combine with PDF Viewer for document signing flows",
    category: "question",
  },

  ADDRESS: {
    id: "ADDRESS",
    title: "Address",
    tagline: "Collect complete addresses with autocomplete",
    description: "Smart address input with **Google Places autocomplete**. Users type and select from suggestions, ensuring accurate addresses every time.",
    useCases: [
      { icon: "Package", text: "Collect shipping addresses" },
      { icon: "Home", text: "Gather billing information" },
      { icon: "Building", text: "Get business locations" },
      { icon: "MapPin", text: "Map customer locations" },
    ],
    keywords: ["address", "location", "street", "city", "zip", "postal", "shipping", "billing"],
    tips: "Auto-populates city, state, and zip from selection",
    category: "question",
  },

  CURRENCY: {
    id: "CURRENCY",
    title: "Currency Amount",
    tagline: "Collect monetary values with formatting",
    description: "Professional **currency input** with proper formatting and symbol display. Perfect for pricing, budgets, and financial data.",
    useCases: [
      { icon: "Wallet", text: "Collect budget information" },
      { icon: "Receipt", text: "Request pricing or quotes" },
      { icon: "TrendingUp", text: "Gather revenue or sales data" },
      { icon: "CircleDollarSign", text: "Set spending limits" },
    ],
    keywords: ["currency", "money", "price", "cost", "budget", "dollar", "payment", "amount"],
    tips: "Select currency type to show proper symbol",
    category: "question",
  },

  ZIP_CODE: {
    id: "ZIP_CODE",
    title: "Zip Code",
    tagline: "Validate postal codes by country",
    description: "Smart **postal code validation** that adapts to different countries. Ensures accurate location data for shipping and demographics.",
    useCases: [
      { icon: "Mailbox", text: "Verify delivery zones" },
      { icon: "Map", text: "Analyze geographic distribution" },
      { icon: "Store", text: "Find nearest store locations" },
      { icon: "Calculator", text: "Calculate shipping rates" },
    ],
    keywords: ["zip", "postal", "code", "postcode", "area", "region", "location"],
    tips: "Combine with Address for complete location data",
    category: "question",
  },

  WELCOME: {
    id: "WELCOME",
    title: "Welcome Screen",
    tagline: "Make a great first impression",
    description: "Start your form with an engaging **welcome message**. Set expectations, build trust, and motivate users to complete your form.",
    useCases: [
      { icon: "Hand", text: "Greet visitors to your survey" },
      { icon: "Info", text: "Explain what the form is about" },
      { icon: "Timer", text: "Set time expectations" },
      { icon: "Award", text: "Highlight incentives for completion" },
    ],
    keywords: ["welcome", "intro", "introduction", "start", "greeting", "landing"],
    tips: "Keep it brief — get users to the questions quickly",
    category: "question",
  },

  ENDING: {
    id: "ENDING",
    title: "Ending Screen",
    tagline: "Close the loop with a thank you",
    description: "Finish your form with a **thank you message** and next steps. Redirect users, show confirmations, or invite further action.",
    useCases: [
      { icon: "Heart", text: "Thank users for their time" },
      { icon: "ExternalLink", text: "Redirect to your website" },
      { icon: "CheckCircle2", text: "Confirm submission success" },
      { icon: "PartyPopper", text: "Show rewards or incentives" },
    ],
    keywords: ["ending", "thank you", "complete", "finish", "done", "confirmation", "success"],
    tips: "Add a CTA button to drive further engagement",
    category: "question",
  },

  QUOTE: {
    id: "QUOTE",
    title: "Statement",
    tagline: "Display informative text blocks",
    description: "Add **context or instructions** between questions. No input needed — just helpful information to guide your users.",
    useCases: [
      { icon: "Lightbulb", text: "Provide section instructions" },
      { icon: "Info", text: "Explain complex questions" },
      { icon: "AlertTriangle", text: "Show important notices" },
      { icon: "Pin", text: "Add context before sensitive questions" },
    ],
    keywords: ["quote", "statement", "text", "info", "instructions", "notice", "message"],
    tips: "Use sparingly to maintain form momentum",
    category: "question",
  },

  AUTOCOMPLETE: {
    id: "AUTOCOMPLETE",
    title: "Autocomplete",
    tagline: "Smart suggestions as users type",
    description: "Type-ahead **search suggestions** from your custom list. Helps users find options quickly while reducing typos and variations.",
    useCases: [
      { icon: "Search", text: "Search large product catalogs" },
      { icon: "Building2", text: "Find companies or organizations" },
      { icon: "Globe", text: "Select from country lists" },
      { icon: "Users", text: "Pick from contact databases" },
    ],
    keywords: ["autocomplete", "search", "suggest", "typeahead", "lookup", "find"],
    tips: "Connect to your database for dynamic options",
    category: "question",
  },

  PDF_VIEWER: {
    id: "PDF_VIEWER",
    title: "PDF Viewer",
    tagline: "Display documents for review",
    description: "Embed **PDF documents** directly in your form. Perfect for contracts, terms, or any document users need to read before proceeding.",
    useCases: [
      { icon: "FileCheck", text: "Show contracts before signing" },
      { icon: "Scale", text: "Display terms and conditions" },
      { icon: "Book", text: "Present product documentation" },
      { icon: "FileText", text: "Share policy documents" },
    ],
    keywords: ["pdf", "document", "viewer", "contract", "terms", "display", "read"],
    tips: "Pair with Signature for complete document signing",
    category: "question",
  },

  COLLECT_PAYMENT: {
    id: "COLLECT_PAYMENT",
    title: "Payment",
    tagline: "Accept payments right in your form",
    description: "Seamless **payment collection** with Stripe integration. Accept credit cards, process subscriptions, and collect deposits.",
    useCases: [
      { icon: "CreditCard", text: "Sell products or services" },
      { icon: "Ticket", text: "Collect event registration fees" },
      { icon: "CalendarCheck", text: "Accept booking deposits" },
      { icon: "RefreshCw", text: "Start subscription payments" },
    ],
    keywords: ["payment", "stripe", "credit card", "checkout", "purchase", "buy", "pay"],
    tips: "Set up Stripe integration first",
    category: "question",
  },
};

// ============================================
// LOGIC NODES
// ============================================

export const LOGIC_DESCRIPTIONS = {
  if_else: {
    id: "if_else",
    title: "If / Else",
    tagline: "Create branching paths based on conditions",
    description: "The **decision-maker** of your workflow. Set conditions to route data down different paths — like a traffic light for your automation.",
    useCases: [
      { icon: "GitBranch", text: "Route leads based on score or value" },
      { icon: "Users", text: "Handle different customer segments" },
      { icon: "CheckCircle", text: "Check if required data exists" },
      { icon: "Filter", text: "Apply different logic by source" },
    ],
    keywords: ["if", "else", "condition", "branch", "logic", "decision", "route", "check"],
    tips: "Use multiple conditions with AND/OR for complex logic",
    category: "logic",
  },

  if_else_v2: {
    id: "if_else_v2",
    title: "If / Else (Advanced)",
    tagline: "Multi-branch decisions with complex logic",
    description: "**Enhanced decision logic** with multiple condition groups and nested rules. Handle sophisticated branching scenarios with ease.",
    useCases: [
      { icon: "Layers", text: "Create multi-tier lead scoring" },
      { icon: "Route", text: "Route based on multiple criteria" },
      { icon: "ListChecks", text: "Apply complex business rules" },
      { icon: "Zap", text: "Handle edge cases elegantly" },
    ],
    keywords: ["if", "else", "condition", "advanced", "multi", "nested", "complex", "logic"],
    tips: "Great for replacing multiple simple If/Else nodes",
    category: "logic",
  },

  switch: {
    id: "switch",
    title: "Switch",
    tagline: "Route to many paths based on a value",
    description: "Like a **switchboard** that directs traffic. When you have many possible outcomes based on one value, Switch keeps it clean and organized.",
    useCases: [
      { icon: "Tag", text: "Route by product category" },
      { icon: "Globe", text: "Handle different regions or countries" },
      { icon: "AtSign", text: "Direct by email domain" },
      { icon: "UserCircle", text: "Process by customer type" },
    ],
    keywords: ["switch", "case", "route", "multiple", "options", "selector", "match"],
    tips: "Add a 'default' case for unmatched values",
    category: "logic",
  },

  iterator: {
    id: "iterator",
    title: "Iterator",
    tagline: "Process items one at a time",
    description: "When you have a **list of items** to process individually, Iterator steps through each one. Perfect for bulk operations on records.",
    useCases: [
      { icon: "ListOrdered", text: "Send emails to a contact list" },
      { icon: "RotateCw", text: "Update records one by one" },
      { icon: "Package", text: "Process order line items" },
      { icon: "CheckSquare", text: "Validate each entry in a list" },
    ],
    keywords: ["iterator", "loop", "each", "list", "array", "process", "bulk", "repeat"],
    tips: "Use with aggregator to collect results",
    category: "logic",
  },

  for_each: {
    id: "for_each",
    title: "For Each",
    tagline: "Loop through every item in a list",
    description: "Take a list and **do something with each item**. The workhorse for batch processing, bulk updates, and list operations.",
    useCases: [
      { icon: "Mail", text: "Email every contact in a list" },
      { icon: "Tags", text: "Tag or update multiple records" },
      { icon: "ArrowRightLeft", text: "Transform data row by row" },
      { icon: "ScanSearch", text: "Check each item for conditions" },
    ],
    keywords: ["for each", "loop", "iterate", "list", "array", "batch", "bulk", "all"],
    tips: "Control loop speed to avoid API rate limits",
    category: "logic",
  },

  loop: {
    id: "loop",
    title: "Loop",
    tagline: "Repeat actions a specific number of times",
    description: "Run the same action **multiple times** based on a count. Useful for retries, pagination, or generating sequences.",
    useCases: [
      { icon: "Repeat", text: "Retry failed API calls" },
      { icon: "FileStack", text: "Paginate through API results" },
      { icon: "Shuffle", text: "Generate multiple variations" },
      { icon: "Timer", text: "Poll until a condition is met" },
    ],
    keywords: ["loop", "repeat", "times", "count", "retry", "iterate", "cycle"],
    tips: "Set a max limit to prevent infinite loops",
    category: "logic",
  },

  delay: {
    id: "delay",
    title: "Delay",
    tagline: "Pause your workflow for a set time",
    description: "Add a **waiting period** before the next step. Perfect for rate limiting, scheduling, or giving external systems time to process.",
    useCases: [
      { icon: "AlarmClock", text: "Wait before follow-up emails" },
      { icon: "Gauge", text: "Respect API rate limits" },
      { icon: "CalendarClock", text: "Schedule actions for later" },
      { icon: "Hourglass", text: "Space out batch operations" },
    ],
    keywords: ["delay", "wait", "pause", "timer", "schedule", "slow", "throttle"],
    tips: "Combine with loops for polite API usage",
    category: "logic",
  },

  transformer: {
    id: "transformer",
    title: "Transformer",
    tagline: "Reshape and modify your data",
    description: "**Transform data** from one format to another. Rename fields, restructure objects, or prepare data for the next step in your workflow.",
    useCases: [
      { icon: "ArrowLeftRight", text: "Convert API response formats" },
      { icon: "PencilLine", text: "Rename and reorganize fields" },
      { icon: "Sparkles", text: "Clean and normalize data" },
      { icon: "BarChart2", text: "Prepare data for analytics" },
    ],
    keywords: ["transformer", "convert", "map", "reshape", "modify", "format", "change"],
    tips: "Use JavaScript expressions for complex transformations",
    category: "logic",
  },

  aggregator: {
    id: "aggregator",
    title: "Aggregator",
    tagline: "Combine multiple items into one",
    description: "Collect outputs from loops and **merge them together**. Turn many individual results into a single, unified output.",
    useCases: [
      { icon: "FolderInput", text: "Collect loop results into an array" },
      { icon: "Calculator", text: "Sum up values from iterations" },
      { icon: "FileBarChart", text: "Build reports from multiple sources" },
      { icon: "Merge", text: "Merge data from parallel branches" },
    ],
    keywords: ["aggregator", "collect", "combine", "merge", "sum", "gather", "bundle"],
    tips: "Essential partner for Iterator and For Each nodes",
    category: "logic",
  },

  filter: {
    id: "filter",
    title: "Filter",
    tagline: "Keep only the items you need",
    description: "Remove items that don't match your criteria. **Keep only what matters** — like a bouncer for your data.",
    useCases: [
      { icon: "Search", text: "Filter out incomplete records" },
      { icon: "Star", text: "Keep only high-value leads" },
      { icon: "CalendarRange", text: "Select records from a date range" },
      { icon: "Ban", text: "Remove duplicates or invalid entries" },
    ],
    keywords: ["filter", "remove", "keep", "select", "exclude", "include", "condition"],
    tips: "Chain filters for precise data selection",
    category: "logic",
  },

  map: {
    id: "map",
    title: "Map",
    tagline: "Transform every item in a list",
    description: "Apply a transformation to **each item in an array**. Change, enhance, or restructure every element in one go.",
    useCases: [
      { icon: "Columns", text: "Extract specific fields from objects" },
      { icon: "AlignLeft", text: "Format all items consistently" },
      { icon: "Hash", text: "Calculate values for each item" },
      { icon: "Plus", text: "Add properties to every record" },
    ],
    keywords: ["map", "transform", "each", "array", "convert", "modify", "apply"],
    tips: "Returns a new array — original stays unchanged",
    category: "logic",
  },

  reduce: {
    id: "reduce",
    title: "Reduce",
    tagline: "Combine all items into a single value",
    description: "Take a list and **condense it** into one result. Perfect for totals, averages, or building complex objects from arrays.",
    useCases: [
      { icon: "PlusCircle", text: "Sum up order totals" },
      { icon: "TrendingUp", text: "Calculate averages or stats" },
      { icon: "Boxes", text: "Build objects from array data" },
      { icon: "FileSpreadsheet", text: "Create summary reports" },
    ],
    keywords: ["reduce", "sum", "total", "aggregate", "combine", "accumulate", "fold"],
    tips: "Set an initial value for predictable results",
    category: "logic",
  },
};

// ============================================
// AI / GPT NODES
// ============================================

export const AI_DESCRIPTIONS = {
  tiny_gpt: {
    id: "tiny_gpt",
    title: "TinyGPT",
    tagline: "AI-powered text generation and analysis",
    description: "Harness the power of **GPT AI** right in your workflow. Generate content, analyze text, extract insights, or have intelligent conversations.",
    useCases: [
      { icon: "Wand2", text: "Generate personalized email responses" },
      { icon: "ThumbsUp", text: "Analyze sentiment from feedback" },
      { icon: "FileText", text: "Summarize long documents" },
      { icon: "Crosshair", text: "Extract key info from text" },
    ],
    keywords: ["ai", "gpt", "openai", "generate", "text", "smart", "intelligent", "nlp", "chatgpt"],
    tips: "Be specific in your prompts for better results",
    category: "ai",
  },

  openai: {
    id: "openai",
    title: "OpenAI",
    tagline: "Connect to OpenAI's powerful models",
    description: "Direct access to **OpenAI's API** for advanced AI capabilities. Use GPT-4, DALL-E, Whisper, and more in your automations.",
    useCases: [
      { icon: "Bot", text: "Build AI chatbots and assistants" },
      { icon: "ImagePlus", text: "Generate images with DALL-E" },
      { icon: "Mic", text: "Transcribe audio with Whisper" },
      { icon: "Sparkles", text: "Create intelligent content" },
    ],
    keywords: ["openai", "gpt", "gpt4", "dalle", "whisper", "ai", "chatgpt", "artificial intelligence"],
    tips: "Use temperature settings to control creativity",
    category: "ai",
  },

  claude: {
    id: "claude",
    title: "Claude",
    tagline: "Anthropic's helpful AI assistant",
    description: "Leverage **Claude's capabilities** for nuanced, thoughtful AI responses. Great for analysis, writing, and complex reasoning tasks.",
    useCases: [
      { icon: "BookOpen", text: "Analyze complex documents" },
      { icon: "PenLine", text: "Write long-form content" },
      { icon: "Microscope", text: "Perform detailed research tasks" },
      { icon: "MessagesSquare", text: "Handle nuanced conversations" },
    ],
    keywords: ["claude", "anthropic", "ai", "assistant", "analyze", "write", "reason"],
    tips: "Claude excels at following detailed instructions",
    category: "ai",
  },

  gemini: {
    id: "gemini",
    title: "Gemini",
    tagline: "Google's multimodal AI",
    description: "Access **Google's Gemini** for text, image, and multimodal AI tasks. Process different types of content in a single workflow.",
    useCases: [
      { icon: "ScanEye", text: "Analyze images and visuals" },
      { icon: "Video", text: "Process video content" },
      { icon: "Layers", text: "Handle mixed media inputs" },
      { icon: "MonitorSmartphone", text: "Extract info from screenshots" },
    ],
    keywords: ["gemini", "google", "ai", "multimodal", "image", "vision", "bard"],
    tips: "Great for workflows involving images and text",
    category: "ai",
  },
};

// ============================================
// HTTP / WEBHOOK NODES
// ============================================

export const HTTP_DESCRIPTIONS = {
  http: {
    id: "http",
    title: "HTTP Request",
    tagline: "Connect to any API in the world",
    description: "Make **HTTP calls** to external services. GET, POST, PUT, DELETE — talk to any REST API and bring data into your workflow.",
    useCases: [
      { icon: "Link", text: "Fetch data from external APIs" },
      { icon: "Upload", text: "Send data to third-party services" },
      { icon: "RefreshCcw", text: "Sync data between systems" },
      { icon: "Database", text: "Query external databases" },
    ],
    keywords: ["http", "api", "request", "rest", "get", "post", "fetch", "call", "endpoint"],
    tips: "Use environment variables for API keys",
    category: "integration",
  },

  webhook: {
    id: "webhook",
    title: "Webhook",
    tagline: "Receive real-time data from any service",
    description: "Create an **endpoint URL** that external services can call. Trigger your workflow instantly when events happen elsewhere.",
    useCases: [
      { icon: "Bell", text: "Receive payment notifications" },
      { icon: "Mail", text: "Trigger on incoming emails" },
      { icon: "ShoppingBag", text: "Handle e-commerce events" },
      { icon: "Smartphone", text: "Process app notifications" },
    ],
    keywords: ["webhook", "trigger", "receive", "listen", "endpoint", "callback", "realtime"],
    tips: "Secure webhooks with signature verification",
    category: "trigger",
  },

  send_email: {
    id: "send_email",
    title: "Send Email",
    tagline: "Deliver emails right from your workflow",
    description: "Send **beautiful, personalized emails** automatically. Use templates, merge fields, and rich HTML formatting.",
    useCases: [
      { icon: "UserPlus", text: "Send welcome emails to new users" },
      { icon: "Receipt", text: "Deliver order confirmations" },
      { icon: "BellRing", text: "Notify team members of events" },
      { icon: "FileBarChart", text: "Send automated reports" },
    ],
    keywords: ["email", "send", "mail", "message", "notification", "smtp", "deliver"],
    tips: "Personalize with dynamic fields from your data",
    category: "integration",
  },
};

// ============================================
// DATA / SHEET OPERATIONS
// ============================================

export const DATA_DESCRIPTIONS = {
  find_all: {
    id: "find_all",
    title: "Find All",
    tagline: "Retrieve multiple records at once",
    description: "Query your database and get **all matching records**. Filter, sort, and paginate to get exactly the data you need.",
    useCases: [
      { icon: "Users", text: "Get all customers in a segment" },
      { icon: "FileDown", text: "Pull records for reporting" },
      { icon: "Search", text: "Search for matching entries" },
      { icon: "Download", text: "Export data for analysis" },
    ],
    keywords: ["find", "all", "query", "search", "list", "get", "retrieve", "fetch", "records"],
    tips: "Add filters to improve performance on large datasets",
    category: "data",
  },

  find_one: {
    id: "find_one",
    title: "Find One",
    tagline: "Get a single specific record",
    description: "Look up **one record** by ID or unique criteria. Perfect for fetching user profiles, order details, or any specific item.",
    useCases: [
      { icon: "User", text: "Fetch a user profile by ID" },
      { icon: "Package", text: "Get order details by order number" },
      { icon: "Ticket", text: "Look up a booking or reservation" },
      { icon: "File", text: "Retrieve a document by reference" },
    ],
    keywords: ["find", "one", "single", "get", "lookup", "fetch", "retrieve", "id"],
    tips: "Use unique identifiers for reliable lookups",
    category: "data",
  },

  create: {
    id: "create",
    title: "Create Record",
    tagline: "Add new data to your database",
    description: "Insert a **new record** into your database. Store form submissions, create new entries, or log events.",
    useCases: [
      { icon: "Plus", text: "Save new form submissions" },
      { icon: "UserPlus", text: "Create new user accounts" },
      { icon: "ClipboardEdit", text: "Log events or activities" },
      { icon: "PackagePlus", text: "Add new inventory items" },
    ],
    keywords: ["create", "new", "add", "insert", "save", "store", "record"],
    tips: "Validate data before creating to avoid errors",
    category: "data",
  },

  update: {
    id: "update",
    title: "Update Record",
    tagline: "Modify existing data",
    description: "Change **specific fields** in an existing record. Keep your data current without replacing everything.",
    useCases: [
      { icon: "PencilLine", text: "Update customer information" },
      { icon: "RefreshCw", text: "Change order status" },
      { icon: "ArrowRightLeft", text: "Sync data from external sources" },
      { icon: "Clock", text: "Update timestamps or counters" },
    ],
    keywords: ["update", "edit", "modify", "change", "patch", "set", "alter"],
    tips: "Only update fields that have changed",
    category: "data",
  },

  upsert: {
    id: "upsert",
    title: "Upsert",
    tagline: "Update if exists, create if not",
    description: "The **smart saver** — updates existing records or creates new ones automatically. Never worry about duplicates again.",
    useCases: [
      { icon: "RefreshCcw", text: "Sync data from external systems" },
      { icon: "FileInput", text: "Import data without duplicates" },
      { icon: "UserCog", text: "Update or create user profiles" },
      { icon: "Database", text: "Maintain master data records" },
    ],
    keywords: ["upsert", "update", "create", "insert", "sync", "merge", "smart"],
    tips: "Define a unique key for reliable matching",
    category: "data",
  },

  delete: {
    id: "delete",
    title: "Delete Record",
    tagline: "Remove data from your database",
    description: "Permanently **remove records** that are no longer needed. Clean up test data, expired entries, or cancelled items.",
    useCases: [
      { icon: "Trash2", text: "Remove cancelled orders" },
      { icon: "Eraser", text: "Clean up test or dummy data" },
      { icon: "CalendarX", text: "Delete expired records" },
      { icon: "UserMinus", text: "Remove unsubscribed contacts" },
    ],
    keywords: ["delete", "remove", "erase", "clear", "destroy", "cleanup"],
    tips: "Consider soft deletes for important data",
    category: "data",
  },

  query: {
    id: "query",
    title: "Custom Query",
    tagline: "Run advanced database queries",
    description: "Execute **custom SQL or database queries** for complex operations. Full control for power users who need it.",
    useCases: [
      { icon: "BarChart3", text: "Run complex aggregation queries" },
      { icon: "Network", text: "Join data from multiple tables" },
      { icon: "LineChart", text: "Create custom reports" },
      { icon: "Sigma", text: "Perform calculations in database" },
    ],
    keywords: ["query", "sql", "database", "custom", "advanced", "raw", "execute"],
    tips: "Test queries on small datasets first",
    category: "data",
  },
};

// ============================================
// TRIGGER NODES
// ============================================

export const TRIGGER_DESCRIPTIONS = {
  form_trigger: {
    id: "form_trigger",
    title: "Form Trigger",
    tagline: "Start when a form is submitted",
    description: "Kick off your workflow **every time someone submits your form**. All form data flows directly into your automation.",
    useCases: [
      { icon: "FileInput", text: "Process lead capture forms" },
      { icon: "Send", text: "Handle contact form submissions" },
      { icon: "ShoppingCart", text: "Start order processing" },
      { icon: "ClipboardList", text: "Begin onboarding sequences" },
    ],
    keywords: ["form", "submit", "trigger", "start", "input", "capture", "lead"],
    tips: "Test with sample submissions before going live",
    category: "trigger",
  },

  schedule_trigger: {
    id: "schedule_trigger",
    title: "Schedule Trigger",
    tagline: "Run workflows on a schedule",
    description: "Automate tasks to run **at specific times** — daily, weekly, or custom cron schedules. Set it and forget it.",
    useCases: [
      { icon: "FileBarChart", text: "Generate daily reports" },
      { icon: "RefreshCw", text: "Sync data every hour" },
      { icon: "Newspaper", text: "Send weekly newsletters" },
      { icon: "Moon", text: "Run nightly cleanup jobs" },
    ],
    keywords: ["schedule", "cron", "timer", "recurring", "daily", "weekly", "hourly"],
    tips: "Account for timezone differences",
    category: "trigger",
  },

  webhook_trigger: {
    id: "webhook_trigger",
    title: "Webhook Trigger",
    tagline: "Start from external events",
    description: "Generate a **URL endpoint** that external services can call to trigger your workflow. Real-time integrations made easy.",
    useCases: [
      { icon: "CreditCard", text: "Handle payment webhooks" },
      { icon: "Bell", text: "Respond to app events" },
      { icon: "Webhook", text: "Process notification callbacks" },
      { icon: "Plug", text: "Connect to any external service" },
    ],
    keywords: ["webhook", "trigger", "endpoint", "url", "callback", "external", "api"],
    tips: "Validate incoming data for security",
    category: "trigger",
  },

  manual_trigger: {
    id: "manual_trigger",
    title: "Manual Trigger",
    tagline: "Start with a button click",
    description: "Run your workflow **on demand** whenever you need it. Perfect for testing, one-off tasks, or user-initiated actions.",
    useCases: [
      { icon: "Play", text: "Test workflows during development" },
      { icon: "ArrowRightToLine", text: "Run one-time data migrations" },
      { icon: "FileOutput", text: "Generate reports on request" },
      { icon: "Rocket", text: "Deploy or publish content" },
    ],
    keywords: ["manual", "button", "click", "run", "execute", "start", "on demand"],
    tips: "Great for workflows you run occasionally",
    category: "trigger",
  },
};

// ============================================
// INTEGRATION NODE SCHEMA
// (For backend to provide data for integration nodes)
// ============================================

/**
 * Integration Node Description Schema
 * Backend should return data in this format for integration nodes.
 * Icons should use Lucide React icon names.
 */
export const INTEGRATION_SCHEMA = {
  id: "string - unique identifier",
  title: "string - display name",
  tagline: "string - one punchy line (max 50 chars)",
  description: "string - 2-3 sentences with **bold** for emphasis",
  useCases: [
    {
      icon: "string - Lucide icon name (e.g., 'Mail', 'CreditCard', 'Users')",
      text: "string - use case description (max 50 chars)",
    },
  ],
  keywords: ["array of searchable terms"],
  tips: "string - optional pro tip",
  category: "string - integration",
  brand: {
    color: "string - hex color for branding",
    icon: "string - icon name or URL",
  },
};

// ============================================
// SEQUENCE NODES
// ============================================

export const SEQUENCE_DESCRIPTIONS = {
  SEQUENCE_TRIGGER: {
    id: "SEQUENCE_TRIGGER",
    title: "Trigger",
    tagline: "Start the sequence",
    description: "The **entry point** for your sequence. Define how and when the sequence should begin — via webhook, schedule, or manual trigger.",
    useCases: [
      { icon: "Play", text: "Kick off a drip campaign" },
      { icon: "Webhook", text: "Start from an external webhook" },
      { icon: "Calendar", text: "Run on a recurring schedule" },
      { icon: "Zap", text: "Manually trigger for testing" },
    ],
    keywords: ["start", "begin", "trigger", "webhook", "schedule", "cron", "initiate", "sequence"],
    tips: "Every sequence needs exactly one trigger",
    category: "trigger",
  },

  TINY_MODULE: {
    id: "TINY_MODULE",
    title: "Tiny Module",
    tagline: "Reusable mini-workflow",
    description: "A self-contained, **reusable unit of work**. Encapsulate common actions into modules that can be shared across sequences.",
    useCases: [
      { icon: "Box", text: "Encapsulate repeated logic" },
      { icon: "Repeat", text: "Reuse across multiple sequences" },
      { icon: "Layers", text: "Organize complex workflows" },
      { icon: "Package", text: "Share modules with your team" },
    ],
    keywords: ["module", "workflow", "action", "reusable", "component", "block", "function"],
    tips: "Great for DRY (Don't Repeat Yourself) automation",
    category: "action",
  },

  SEQUENCE_WAIT: {
    id: "SEQUENCE_WAIT",
    title: "Wait",
    tagline: "Long-duration pause",
    description: "Pause the sequence for **hours, days, or weeks**. Perfect for drip campaigns, follow-up schedules, or waiting until a specific date.",
    useCases: [
      { icon: "Clock", text: "Add delays between emails" },
      { icon: "Calendar", text: "Wait until a specific date" },
      { icon: "Bell", text: "Schedule follow-up reminders" },
      { icon: "Target", text: "Time campaigns for max impact" },
    ],
    keywords: ["wait", "pause", "time", "schedule", "timer", "sleep", "duration", "days", "weeks", "hours"],
    tips: "Use relative or absolute wait times",
    category: "flow",
  },

  SEQUENCE_CONDITIONAL: {
    id: "SEQUENCE_CONDITIONAL",
    title: "Conditional",
    tagline: "If-else branching",
    description: "Branch your sequence based on **conditions**. Route execution paths depending on data values or previous outcomes.",
    useCases: [
      { icon: "GitBranch", text: "Route based on user behavior" },
      { icon: "Filter", text: "Filter contacts by criteria" },
      { icon: "CheckCircle", text: "Check if goals are met" },
      { icon: "Route", text: "Create personalized paths" },
    ],
    keywords: ["if", "else", "condition", "branch", "logic", "decision", "switch", "route"],
    tips: "Combine with merge nodes to rejoin branches",
    category: "flow",
  },

  SEQUENCE_EXIT: {
    id: "SEQUENCE_EXIT",
    title: "Exit",
    tagline: "Terminate sequence early",
    description: "End the sequence **before completion**. Use when goals are achieved, errors occur, or the sequence should stop.",
    useCases: [
      { icon: "CheckCircle", text: "Stop when goal is achieved" },
      { icon: "AlertTriangle", text: "Exit on error conditions" },
      { icon: "Users", text: "Remove unresponsive contacts" },
      { icon: "Target", text: "End after conversion" },
    ],
    keywords: ["exit", "stop", "end", "terminate", "abort", "finish", "complete"],
    tips: "Add exit conditions to prevent unnecessary processing",
    category: "flow",
  },

  SEQUENCE_HITL: {
    id: "SEQUENCE_HITL",
    title: "Human in the Loop",
    tagline: "Pause for human action",
    description: "Wait for **human intervention** before continuing. Create approval workflows or manual review steps in your automation.",
    useCases: [
      { icon: "User", text: "Require manager approval" },
      { icon: "CheckSquare", text: "Manual quality review" },
      { icon: "ClipboardList", text: "Human decision points" },
      { icon: "Bell", text: "Notify team for action" },
    ],
    keywords: ["human", "manual", "approval", "review", "task", "intervention", "hitl", "pause"],
    tips: "Set timeouts to prevent sequences from stalling",
    category: "action",
  },

  SEQUENCE_MERGE_JOIN: {
    id: "SEQUENCE_MERGE_JOIN",
    title: "Merge / Join",
    tagline: "Branch convergence",
    description: "Bring **multiple execution paths** back together. Synchronize branches after conditional splits.",
    useCases: [
      { icon: "Merge", text: "Rejoin after if-else branches" },
      { icon: "GitBranch", text: "Converge parallel paths" },
      { icon: "Network", text: "Synchronize split workflows" },
      { icon: "Layers", text: "Combine branch results" },
    ],
    keywords: ["merge", "join", "converge", "sync", "combine", "unite", "branch"],
    tips: "Place after conditional nodes to unify flow",
    category: "flow",
  },

  SEQUENCE_LOOP_START: {
    id: "SEQUENCE_LOOP_START",
    title: "Loop",
    tagline: "Recurring pattern",
    description: "Create a **repeating section** in your sequence. Nodes between Loop Start and Loop End will repeat based on count, condition, or indefinitely.",
    useCases: [
      { icon: "Repeat", text: "Retry failed operations" },
      { icon: "Clock", text: "Recurring check-ins" },
      { icon: "RefreshCw", text: "Poll until condition met" },
      { icon: "Layers", text: "Process items in batches" },
    ],
    keywords: ["loop", "repeat", "recurring", "cycle", "iterate", "again", "recurrence", "interval"],
    tips: "Always set a max iteration limit",
    category: "flow",
  },
};

// ============================================
// MASTER REGISTRY
// ============================================

export const NODE_DESCRIPTIONS = {
  ...QUESTION_DESCRIPTIONS,
  ...LOGIC_DESCRIPTIONS,
  ...AI_DESCRIPTIONS,
  ...HTTP_DESCRIPTIONS,
  ...DATA_DESCRIPTIONS,
  ...TRIGGER_DESCRIPTIONS,
  ...SEQUENCE_DESCRIPTIONS,
};

/**
 * Get description for a node by type/subType/name
 * Tries multiple matching strategies
 */
export const getNodeDescription = (node) => {
  if (!node) return null;
  
  const { type, subType, name, nodeType } = node;
  
  // Direct match by subType (most specific)
  if (subType && NODE_DESCRIPTIONS[subType]) {
    return NODE_DESCRIPTIONS[subType];
  }
  
  // Direct match by type
  if (type && NODE_DESCRIPTIONS[type]) {
    return NODE_DESCRIPTIONS[type];
  }
  
  // Direct match by nodeType
  if (nodeType && NODE_DESCRIPTIONS[nodeType]) {
    return NODE_DESCRIPTIONS[nodeType];
  }
  
  // Try lowercase variants
  const lowerType = type?.toLowerCase();
  const lowerSubType = subType?.toLowerCase();
  
  if (lowerSubType && NODE_DESCRIPTIONS[lowerSubType]) {
    return NODE_DESCRIPTIONS[lowerSubType];
  }
  
  if (lowerType && NODE_DESCRIPTIONS[lowerType]) {
    return NODE_DESCRIPTIONS[lowerType];
  }
  
  // Try matching by name patterns
  const lowerName = name?.toLowerCase() || "";
  
  for (const [key, desc] of Object.entries(NODE_DESCRIPTIONS)) {
    if (lowerName.includes(key.toLowerCase().replace(/_/g, " "))) {
      return desc;
    }
  }
  
  return null;
};

/**
 * Get all keywords for fuzzy search
 * Returns array of { nodeId, keyword, weight }
 */
export const getSearchableKeywords = () => {
  const keywords = [];
  
  for (const [nodeId, desc] of Object.entries(NODE_DESCRIPTIONS)) {
    // Add title with high weight
    keywords.push({ nodeId, keyword: desc.title, weight: 1.0 });
    
    // Add tagline with medium weight
    keywords.push({ nodeId, keyword: desc.tagline, weight: 0.7 });
    
    // Add keywords with lower weight
    if (desc.keywords) {
      desc.keywords.forEach((kw) => {
        keywords.push({ nodeId, keyword: kw, weight: 0.4 });
      });
    }
    
    // Add use case text with lowest weight
    if (desc.useCases) {
      desc.useCases.forEach((uc) => {
        keywords.push({ nodeId, keyword: uc.text, weight: 0.3 });
      });
    }
  }
  
  return keywords;
};

export default NODE_DESCRIPTIONS;
