import * as executionModel from "../models/executions.js";
import { TriggerExecutor } from "../executors/trigger.js";
import { ExitExecutor } from "../executors/exit.js";
import { TinyModuleExecutor } from "../executors/tinyModule.js";
import { ConditionalExecutor } from "../executors/conditional.js";
import { WaitExecutor } from "../executors/wait.js";
import { HitlExecutor } from "../executors/hitl.js";
import { MergeJoinExecutor } from "../executors/mergeJoin.js";

const NODE_EXECUTORS = {
  SEQUENCE_TRIGGER: TriggerExecutor,
  TINY_MODULE: TinyModuleExecutor,
  SEQUENCE_WAIT: WaitExecutor,
  SEQUENCE_CONDITIONAL: ConditionalExecutor,
  SEQUENCE_EXIT: ExitExecutor,
  SEQUENCE_HITL: HitlExecutor,
  SEQUENCE_MERGE_JOIN: MergeJoinExecutor,
  SEQUENCE_LOOP_START: TriggerExecutor,
  SEQUENCE_LOOP_END: ExitExecutor,
};

export class SequenceEngine {
  async startExecution(executionId) {
    const execution = await executionModel.getExecutionById(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const nodes = typeof execution.nodes === 'string' ? JSON.parse(execution.nodes) : execution.nodes;
    const links = typeof execution.links === 'string' ? JSON.parse(execution.links) : execution.links;

    const triggerNode = nodes.find(n => n.type === "SEQUENCE_TRIGGER");
    if (!triggerNode) {
      await executionModel.updateExecution(executionId, {
        status: "failed",
        errorMessage: "No trigger node found in sequence",
      });
      return;
    }

    const context = {
      ...(execution.trigger_data || {}),
      executionId,
      sequenceId: execution.sequence_id,
      startedAt: new Date().toISOString(),
    };

    await executionModel.updateExecution(executionId, {
      currentNodeId: triggerNode.key,
      context,
    });

    await this.executeNode(executionId, triggerNode, nodes, links, context);
  }

  async resumeExecution(executionId, resumeData = {}) {
    const execution = await executionModel.getExecutionById(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== "waiting") {
      throw new Error(`Execution ${executionId} is not in waiting state`);
    }

    const nodes = typeof execution.nodes === 'string' ? JSON.parse(execution.nodes) : execution.nodes;
    const links = typeof execution.links === 'string' ? JSON.parse(execution.links) : execution.links;
    const context = typeof execution.context === 'string' ? JSON.parse(execution.context) : execution.context;

    const currentNode = nodes.find(n => n.key === execution.current_node_id);
    if (!currentNode) {
      await executionModel.updateExecution(executionId, {
        status: "failed",
        errorMessage: `Current node ${execution.current_node_id} not found`,
      });
      return;
    }

    const updatedContext = { ...context, ...resumeData };

    await executionModel.updateExecution(executionId, {
      status: "running",
      scheduledResumeAt: null,
      waitingForEvent: null,
      context: updatedContext,
    });

    const nextNodeId = this.getNextNode(currentNode.key, links);
    if (!nextNodeId) {
      await this.completeExecution(executionId, updatedContext);
      return;
    }

    const nextNode = nodes.find(n => n.key === nextNodeId);
    if (!nextNode) {
      await executionModel.updateExecution(executionId, {
        status: "failed",
        errorMessage: `Next node ${nextNodeId} not found`,
      });
      return;
    }

    await this.executeNode(executionId, nextNode, nodes, links, updatedContext);
  }

  async executeNode(executionId, node, nodes, links, context) {
    const startTime = Date.now();
    
    try {
      const execution = await executionModel.getExecutionById(executionId);
      if (execution.status === "cancelled") {
        return;
      }

      await executionModel.updateExecution(executionId, {
        currentNodeId: node.key,
      });

      const ExecutorClass = NODE_EXECUTORS[node.type];
      if (!ExecutorClass) {
        throw new Error(`Unknown node type: ${node.type}`);
      }

      const executor = new ExecutorClass();
      const result = await executor.execute(node, context, { executionId, nodes, links });

      const durationMs = Date.now() - startTime;
      await executionModel.addExecutionLog({
        executionId,
        nodeId: node.key,
        nodeType: node.type,
        status: result.status,
        inputContext: context,
        outputContext: result.context,
        durationMs,
      });

      if (result.status === "exit" || result.status === "completed") {
        await this.completeExecution(executionId, result.context);
        return;
      }

      if (result.status === "waiting") {
        await executionModel.updateExecution(executionId, {
          status: "waiting",
          context: result.context,
          scheduledResumeAt: result.scheduledResumeAt,
          waitingForEvent: result.waitingForEvent,
        });
        return;
      }

      if (result.status === "error") {
        await executionModel.updateExecution(executionId, {
          status: "failed",
          errorMessage: result.error,
          context: result.context,
        });
        return;
      }

      let nextNodeId = result.nextNodeId;
      if (!nextNodeId) {
        nextNodeId = this.getNextNode(node.key, links);
      }

      if (!nextNodeId) {
        await this.completeExecution(executionId, result.context);
        return;
      }

      const nextNode = nodes.find(n => n.key === nextNodeId);
      if (!nextNode) {
        await executionModel.updateExecution(executionId, {
          status: "failed",
          errorMessage: `Next node ${nextNodeId} not found`,
        });
        return;
      }

      await this.executeNode(executionId, nextNode, nodes, links, result.context);

    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      await executionModel.addExecutionLog({
        executionId,
        nodeId: node.key,
        nodeType: node.type,
        status: "error",
        inputContext: context,
        errorMessage: error.message,
        durationMs,
      });

      await executionModel.updateExecution(executionId, {
        status: "failed",
        errorMessage: error.message,
      });
    }
  }

  getNextNode(currentNodeId, links) {
    const outgoingLink = links.find(l => l.from === currentNodeId);
    return outgoingLink ? outgoingLink.to : null;
  }

  async completeExecution(executionId, context) {
    await executionModel.updateExecution(executionId, {
      status: "completed",
      context,
    });
  }
}
