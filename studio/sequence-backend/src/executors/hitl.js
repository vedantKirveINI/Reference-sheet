import * as hitlModel from "../models/hitlTasks.js";

export class HitlExecutor {
  async execute(node, context, options) {
    const hitlConfig = node.hitlConfig || {};
    const executionId = options.executionId;
    
    const taskData = {
      executionId,
      nodeId: node.key,
      taskType: hitlConfig.taskType || "approval",
      title: this.resolveTemplate(hitlConfig.title, context) || "Action Required",
      description: this.resolveTemplate(hitlConfig.description, context),
      assignedTo: this.resolveTemplate(hitlConfig.assignedTo, context),
      dueAt: hitlConfig.dueInHours 
        ? new Date(Date.now() + hitlConfig.dueInHours * 60 * 60 * 1000)
        : null,
    };

    const task = await hitlModel.createHitlTask(taskData);

    let scheduledResumeAt = null;
    if (hitlConfig.timeout) {
      const timeoutMs = this.parseTimeout(hitlConfig.timeout, hitlConfig.timeoutUnit);
      scheduledResumeAt = new Date(Date.now() + timeoutMs);
    }

    return {
      status: "waiting",
      context: {
        ...context,
        [`${node.key}_hitlTaskId`]: task.id,
        [`${node.key}_hitlTaskCreatedAt`]: new Date().toISOString(),
        [`${node.key}_waitingForHuman`]: true,
      },
      waitingForEvent: `hitl_complete_${task.id}`,
      scheduledResumeAt,
    };
  }

  resolveTemplate(template, context) {
    if (!template) return template;
    if (typeof template !== "string") return template;

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getValueByPath(context, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  parseTimeout(timeout, unit = "hours") {
    const value = Number(timeout);
    switch (unit) {
      case "minutes":
        return value * 60 * 1000;
      case "hours":
        return value * 60 * 60 * 1000;
      case "days":
        return value * 24 * 60 * 60 * 1000;
      default:
        return value * 60 * 60 * 1000;
    }
  }

  getValueByPath(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
