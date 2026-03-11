export class ConditionalExecutor {
  async execute(node, context, options) {
    const conditionConfig = node.conditionConfig || {};
    const conditions = conditionConfig.conditions || [];
    
    let matchedBranch = null;
    
    for (const condition of conditions) {
      if (this.evaluateCondition(condition, context)) {
        matchedBranch = condition.targetNodeId || condition.branch;
        break;
      }
    }

    if (!matchedBranch && conditionConfig.defaultBranch) {
      matchedBranch = conditionConfig.defaultBranch;
    }

    const links = options.links || [];
    let nextNodeId = null;

    if (matchedBranch) {
      const matchedLink = links.find(l => 
        l.from === node.key && (l.to === matchedBranch || l.label === matchedBranch || l.branch === matchedBranch)
      );
      if (matchedLink) {
        nextNodeId = matchedLink.to;
      } else {
        nextNodeId = matchedBranch;
      }
    } else {
      const defaultLink = links.find(l => l.from === node.key);
      nextNodeId = defaultLink?.to;
    }

    return {
      status: "continue",
      context: {
        ...context,
        [`${node.key}_evaluatedBranch`]: matchedBranch,
        [`${node.key}_evaluatedAt`]: new Date().toISOString(),
      },
      nextNodeId,
    };
  }

  evaluateCondition(condition, context) {
    const { field, operator, value } = condition;
    
    const fieldValue = this.getValueByPath(context, field);
    const compareValue = this.resolveValue(value, context);

    switch (operator) {
      case "equals":
      case "==":
      case "===":
        return fieldValue === compareValue;
      
      case "not_equals":
      case "!=":
      case "!==":
        return fieldValue !== compareValue;
      
      case "greater_than":
      case ">":
        return Number(fieldValue) > Number(compareValue);
      
      case "less_than":
      case "<":
        return Number(fieldValue) < Number(compareValue);
      
      case "greater_than_or_equal":
      case ">=":
        return Number(fieldValue) >= Number(compareValue);
      
      case "less_than_or_equal":
      case "<=":
        return Number(fieldValue) <= Number(compareValue);
      
      case "contains":
        return String(fieldValue).includes(String(compareValue));
      
      case "not_contains":
        return !String(fieldValue).includes(String(compareValue));
      
      case "starts_with":
        return String(fieldValue).startsWith(String(compareValue));
      
      case "ends_with":
        return String(fieldValue).endsWith(String(compareValue));
      
      case "is_empty":
        return fieldValue === null || fieldValue === undefined || fieldValue === "";
      
      case "is_not_empty":
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
      
      case "in":
        return Array.isArray(compareValue) && compareValue.includes(fieldValue);
      
      case "not_in":
        return !Array.isArray(compareValue) || !compareValue.includes(fieldValue);
      
      case "matches_regex":
        try {
          return new RegExp(compareValue).test(String(fieldValue));
        } catch {
          return false;
        }
      
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  resolveValue(value, context) {
    if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) {
      const path = value.slice(2, -2).trim();
      return this.getValueByPath(context, path);
    }
    return value;
  }

  getValueByPath(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
