export class ExitExecutor {
  async execute(node, context, options) {
    const exitConfig = node.exitConfig || {};
    
    const outputContext = {
      ...context,
      exitedAt: new Date().toISOString(),
      exitReason: exitConfig.reason || "sequence_complete",
      exitNodeId: node.key,
    };

    if (exitConfig.outputData) {
      outputContext.exitData = exitConfig.outputData;
    }

    return {
      status: "exit",
      context: outputContext,
    };
  }
}
