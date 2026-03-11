export class MergeJoinExecutor {
  async execute(node, context, options) {
    const mergeConfig = node.mergeConfig || {};
    const mergeType = mergeConfig.type || "first_wins";

    const outputContext = {
      ...context,
      [`${node.key}_mergedAt`]: new Date().toISOString(),
      [`${node.key}_mergeType`]: mergeType,
    };

    switch (mergeType) {
      case "first_wins":
        return {
          status: "continue",
          context: outputContext,
        };

      case "wait_all":
        const requiredBranches = mergeConfig.requiredBranches || [];
        const completedBranches = context._completedBranches || [];
        
        const allComplete = requiredBranches.every(branch => 
          completedBranches.includes(branch)
        );

        if (allComplete || requiredBranches.length === 0) {
          return {
            status: "continue",
            context: {
              ...outputContext,
              _allBranchesComplete: true,
            },
          };
        } else {
          return {
            status: "waiting",
            context: outputContext,
            waitingForEvent: `branch_complete_${node.key}`,
          };
        }

      case "aggregate":
        const aggregatedData = {};
        const branchResults = context._branchResults || {};
        
        for (const [branchId, result] of Object.entries(branchResults)) {
          aggregatedData[branchId] = result;
        }

        return {
          status: "continue",
          context: {
            ...outputContext,
            [`${node.key}_aggregatedData`]: aggregatedData,
          },
        };

      default:
        return {
          status: "continue",
          context: outputContext,
        };
    }
  }
}
