export class TriggerExecutor {
  async execute(node, context, options) {
    const triggerConfig = node.triggerConfig || {};
    
    const outputContext = {
      ...context,
      triggeredAt: new Date().toISOString(),
      triggerType: triggerConfig.type || "manual",
      triggerNodeId: node.key,
    };

    if (triggerConfig.outputMapping) {
      for (const [key, path] of Object.entries(triggerConfig.outputMapping)) {
        outputContext[key] = this.getValueByPath(context, path);
      }
    }

    return {
      status: "continue",
      context: outputContext,
    };
  }

  getValueByPath(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
