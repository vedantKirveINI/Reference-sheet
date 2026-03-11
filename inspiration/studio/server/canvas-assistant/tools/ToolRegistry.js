import { BaseTool } from "./BaseTool.js";
import { validateSchema, applyDefaults } from "./validators.js";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync } from "fs";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * ToolRegistry - Auto-discovery and registration system for tools
 * 
 * Automatically discovers all tools extending BaseTool and registers them.
 * Eliminates the need for hardcoded switch statements.
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the registry by discovering and registering all tools
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    await this.discoverTools();
    this.initialized = true;
    console.log(`[ToolRegistry] Initialized with ${this.tools.size} tools`);
  }

  /**
   * Discover tools by scanning the tools directory
   * @private
   */
  async discoverTools() {
    const toolDirs = [
      path.join(__dirname, "extension"),
      path.join(__dirname, "user"),
      path.join(__dirname, "canvas"),
      path.join(__dirname, "workflow"),
    ];

    // Also check root tools directory for direct tool files
    const rootDir = __dirname;

    for (const dir of toolDirs) {
      await this.scanDirectory(dir);
    }

    // Scan root directory for direct tool files (if any)
    await this.scanDirectory(rootDir, false);
  }

  /**
   * Scan a directory for tool files
   * @private
   */
  async scanDirectory(dirPath, isSubDir = true) {
    try {
      if (!statSync(dirPath).isDirectory()) {
        return;
      }

      const files = readdirSync(dirPath);
      
      for (const file of files) {
        // Skip non-JS files and index files
        if (!file.endsWith(".js") || file === "index.js" || file === "ToolRegistry.js" || file === "BaseTool.js" || file === "validators.js") {
          continue;
        }

        const filePath = path.join(dirPath, file);
        const stat = statSync(filePath);
        
        if (stat.isFile()) {
          await this.loadTool(filePath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read - that's okay
      if (error.code !== "ENOENT") {
        console.warn(`[ToolRegistry] Error scanning directory ${dirPath}:`, error.message);
      }
    }
  }

  /**
   * Load a tool from a file path
   * @private
   */
  async loadTool(filePath) {
    try {
      const module = await import(`file://${filePath}`);
      
      // Find exported class that extends BaseTool
      let ToolClass = null;
      
      // Check default export
      if (module.default && module.default.prototype instanceof BaseTool) {
        ToolClass = module.default;
      }
      
      // Check named exports
      if (!ToolClass) {
        for (const [key, value] of Object.entries(module)) {
          if (value && value.prototype instanceof BaseTool) {
            ToolClass = value;
            break;
          }
        }
      }

      if (!ToolClass) {
        console.warn(`[ToolRegistry] File ${filePath} does not export a BaseTool class`);
        return;
      }

      const tool = new ToolClass();
      
      if (!tool.name) {
        console.warn(`[ToolRegistry] Tool from ${filePath} does not define a name`);
        return;
      }

      this.register(tool);
    } catch (error) {
      console.error(`[ToolRegistry] Error loading tool from ${filePath}:`, error);
    }
  }

  /**
   * Register a tool instance
   * @param {BaseTool} tool - Tool instance to register
   */
  register(tool) {
    if (!(tool instanceof BaseTool)) {
      throw new Error("Tool must extend BaseTool");
    }

    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Tool '${tool.name}' is already registered. Overwriting.`);
    }

    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   * @param {string} name - Tool name
   * @returns {BaseTool|null} - Tool instance or null if not found
   */
  get(name) {
    return this.tools.get(name) || null;
  }

  /**
   * Get all registered tools
   * @returns {Array<BaseTool>} - Array of all tool instances
   */
  getAll() {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tools in OpenAI function calling format
   * @returns {Array<object>} - Array of OpenAI function schemas
   */
  getOpenAISchemas() {
    return this.getAll().map(tool => tool.getOpenAISchema());
  }

  /**
   * Execute a tool by name with validation
   * @param {string} name - Tool name
   * @param {object} args - Tool arguments
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Tool execution result
   */
  async execute(name, args, context = {}) {
    const tool = this.get(name);
    
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Apply default values from schema
    const argsWithDefaults = applyDefaults(tool.parameters, args);

    // Validate arguments
    const validation = validateSchema(tool.parameters, argsWithDefaults);
    if (!validation.valid) {
      throw new Error(`Invalid arguments for tool '${name}': ${validation.errors.join(", ")}`);
    }

    // Execute tool with retry logic
    let lastError = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await tool.execute(argsWithDefaults, context);
      } catch (error) {
        lastError = error;
        console.error(`[ToolRegistry] Error executing tool '${name}' (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }

    // If all retries failed, return error result
    return {
      error: lastError.message,
      tool: name,
    };
  }

  /**
   * Check if a tool is registered
   * @param {string} name - Tool name
   * @returns {boolean}
   */
  has(name) {
    return this.tools.has(name);
  }

  /**
   * Get count of registered tools
   * @returns {number}
   */
  size() {
    return this.tools.size;
  }
}

// Singleton instance
const registry = new ToolRegistry();

export default registry;
