/**
 * PromptManager - Versioned prompt system with template support
 * 
 * Manages prompts with versioning, variable substitution, and composition.
 * Supports A/B testing and prompt evolution over time.
 */
class PromptManager {
  constructor() {
    this.prompts = new Map();
    this.versions = new Map();
    this.initialized = false;
  }

  /**
   * Initialize prompt manager by loading all templates
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    await this.loadTemplates();
    this.initialized = true;
    console.log(`[PromptManager] Initialized with ${this.prompts.size} prompts`);
  }

  /**
   * Load prompt templates from the templates directory
   * @private
   */
  async loadTemplates() {
    const templates = [
      "system-prompt",
      "generate-flow",
      "setup-node",
      "setup-internal",
      "setup-integration",
      "suggest-next",
    ];

    for (const templateName of templates) {
      try {
        const module = await import(`./templates/${templateName}.js`);
        const template = module.default || module;
        
        if (typeof template === "function") {
          // Template is a function that returns the prompt
          this.register(templateName, template);
        } else if (typeof template === "string") {
          // Template is a string
          this.register(templateName, () => template);
        } else if (template.content) {
          // Template has content and version
          this.register(templateName, template.content, template.version);
        } else {
          console.warn(`[PromptManager] Invalid template format for ${templateName}`);
        }
      } catch (error) {
        console.warn(`[PromptManager] Failed to load template ${templateName}:`, error.message);
      }
    }
  }

  /**
   * Register a prompt template
   * @param {string} name - Prompt name
   * @param {Function|string} template - Template function or string
   * @param {string} version - Version identifier (default: "v1")
   */
  register(name, template, version = "v1") {
    const key = `${name}:${version}`;
    
    if (typeof template === "function") {
      this.prompts.set(key, template);
    } else {
      // Convert string to function
      this.prompts.set(key, () => template);
    }

    // Track versions
    if (!this.versions.has(name)) {
      this.versions.set(name, []);
    }
    this.versions.get(name).push(version);
  }

  /**
   * Get a prompt by name and version
   * @param {string} name - Prompt name
   * @param {string} version - Version (default: latest)
   * @param {object} variables - Variables to substitute
   * @returns {string} - Rendered prompt
   */
  get(name, version = null, variables = {}) {
    // If no version specified, use latest
    if (!version) {
      const versions = this.versions.get(name);
      if (versions && versions.length > 0) {
        version = versions[versions.length - 1];
      } else {
        version = "v1";
      }
    }

    const key = `${name}:${version}`;
    const template = this.prompts.get(key);

    if (!template) {
      throw new Error(`Prompt '${name}' (version ${version}) not found`);
    }

    // Execute template function with variables
    const prompt = typeof template === "function" ? template(variables) : template;

    // Simple variable substitution: {{variableName}}
    return this.substituteVariables(prompt, variables);
  }

  /**
   * Substitute variables in prompt string
   * @private
   */
  substituteVariables(prompt, variables) {
    let result = prompt;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Compose multiple prompts together
   * @param {Array<{name: string, version?: string, variables?: object}>} prompts - Array of prompt configs
   * @param {string} separator - Separator between prompts (default: "\n\n")
   * @returns {string} - Composed prompt
   */
  compose(prompts, separator = "\n\n") {
    return prompts
      .map((p) => this.get(p.name, p.version, p.variables || {}))
      .join(separator);
  }

  /**
   * Get all versions of a prompt
   * @param {string} name - Prompt name
   * @returns {Array<string>} - Array of version identifiers
   */
  getVersions(name) {
    return this.versions.get(name) || [];
  }

  /**
   * Check if a prompt exists
   * @param {string} name - Prompt name
   * @param {string} version - Version (optional)
   * @returns {boolean}
   */
  has(name, version = null) {
    if (version) {
      return this.prompts.has(`${name}:${version}`);
    }
    return this.versions.has(name);
  }
}

// Singleton instance
const promptManager = new PromptManager();

export default promptManager;
