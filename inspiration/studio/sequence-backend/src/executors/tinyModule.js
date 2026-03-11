export class TinyModuleExecutor {
  async execute(node, context, options) {
    const moduleConfig = node.moduleConfig || {};
    
    try {
      const inputData = this.prepareInputData(moduleConfig.inputMapping, context);
      
      const result = await this.executeModule(moduleConfig, inputData, context);
      
      const outputContext = { ...context };
      
      if (moduleConfig.outputMapping) {
        for (const [contextKey, resultPath] of Object.entries(moduleConfig.outputMapping)) {
          outputContext[contextKey] = this.getValueByPath(result, resultPath);
        }
      } else if (result) {
        outputContext.moduleResult = result;
      }

      outputContext[`${node.key}_completed`] = true;
      outputContext[`${node.key}_completedAt`] = new Date().toISOString();

      return {
        status: "continue",
        context: outputContext,
      };
    } catch (error) {
      return {
        status: "error",
        error: `Module execution failed: ${error.message}`,
        context: {
          ...context,
          [`${node.key}_error`]: error.message,
        },
      };
    }
  }

  prepareInputData(inputMapping, context) {
    if (!inputMapping) return context;

    const inputData = {};
    for (const [key, path] of Object.entries(inputMapping)) {
      inputData[key] = this.getValueByPath(context, path);
    }
    return inputData;
  }

  async executeModule(moduleConfig, inputData, context) {
    const moduleType = moduleConfig.type || "inline";

    switch (moduleType) {
      case "inline":
        return this.executeInlineModule(moduleConfig, inputData);
      
      case "http":
        return this.executeHttpModule(moduleConfig, inputData);
      
      case "workflow":
        return this.executeWorkflowModule(moduleConfig, inputData, context);
      
      default:
        return { executed: true, input: inputData };
    }
  }

  async executeInlineModule(moduleConfig, inputData) {
    const actions = moduleConfig.actions || [];
    let result = { ...inputData };

    for (const action of actions) {
      result = await this.executeAction(action, result);
    }

    return result;
  }

  async executeHttpModule(moduleConfig, inputData) {
    const { url, method = "POST", headers = {} } = moduleConfig;
    
    if (!url) {
      throw new Error("HTTP module requires a URL");
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: method !== "GET" ? JSON.stringify(inputData) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status}`);
    }

    return response.json();
  }

  async executeWorkflowModule(moduleConfig, inputData, context) {
    return {
      executed: true,
      workflowId: moduleConfig.workflowId,
      input: inputData,
      message: "Workflow execution placeholder",
    };
  }

  async executeAction(action, data) {
    switch (action.type) {
      case "transform":
        return this.transformData(action.config, data);
      case "validate":
        return this.validateData(action.config, data);
      default:
        return data;
    }
  }

  transformData(config, data) {
    if (config.set) {
      for (const [key, value] of Object.entries(config.set)) {
        data[key] = typeof value === "string" && value.startsWith("{{") 
          ? this.getValueByPath(data, value.replace(/[{}]/g, ""))
          : value;
      }
    }
    return data;
  }

  validateData(config, data) {
    if (config.required) {
      for (const field of config.required) {
        if (data[field] === undefined || data[field] === null) {
          throw new Error(`Required field missing: ${field}`);
        }
      }
    }
    return data;
  }

  getValueByPath(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
