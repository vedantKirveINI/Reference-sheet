import express from "express";
import * as sequenceModel from "../models/sequences.js";
import * as executionModel from "../models/executions.js";
import * as hitlModel from "../models/hitlTasks.js";
import { SequenceEngine } from "../services/engine.js";

const router = express.Router();

router.post("/trigger/:sequenceId", async (req, res) => {
  try {
    const { sequenceId } = req.params;
    const triggerData = req.body;
    
    const sequence = await sequenceModel.getSequenceById(sequenceId);
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    
    if (sequence.status !== "published") {
      return res.status(400).json({ error: "Sequence is not published" });
    }
    
    const execution = await executionModel.createExecution({
      sequenceId,
      sequenceVersion: sequence.version,
      triggerData,
      triggeredBy: "webhook",
      workspaceId: sequence.workspace_id,
    });
    
    const engine = new SequenceEngine();
    engine.startExecution(execution.id).catch((err) => {
      console.error("Error in webhook-triggered execution:", err);
    });
    
    res.status(201).json({ 
      success: true, 
      executionId: execution.id,
      message: "Sequence triggered successfully" 
    });
  } catch (error) {
    console.error("Error in webhook trigger:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/hitl/:taskId/complete", async (req, res) => {
  try {
    const { taskId } = req.params;
    const responseData = req.body;
    
    const task = await hitlModel.getHitlTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: "HITL task not found" });
    }
    
    if (task.status !== "pending") {
      return res.status(400).json({ error: "Task is already completed or cancelled" });
    }
    
    await hitlModel.completeHitlTask(taskId, responseData);
    
    const engine = new SequenceEngine();
    engine.resumeExecution(task.execution_id, { hitlResponse: responseData }).catch((err) => {
      console.error("Error resuming after HITL:", err);
    });
    
    res.json({ 
      success: true, 
      message: "HITL task completed, execution resumed" 
    });
  } catch (error) {
    console.error("Error completing HITL task:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/hitl/pending", async (req, res) => {
  try {
    const { assignedTo } = req.query;
    const tasks = await hitlModel.getPendingHitlTasks(assignedTo);
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching pending HITL tasks:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/event/:executionId", async (req, res) => {
  try {
    const { executionId } = req.params;
    const eventData = req.body;
    
    const execution = await executionModel.getExecutionById(executionId);
    if (!execution) {
      return res.status(404).json({ error: "Execution not found" });
    }
    
    if (execution.status !== "waiting") {
      return res.status(400).json({ error: "Execution is not waiting for an event" });
    }
    
    if (execution.waiting_for_event && execution.waiting_for_event !== eventData.eventType) {
      return res.status(400).json({ 
        error: `Execution is waiting for event type: ${execution.waiting_for_event}` 
      });
    }
    
    const engine = new SequenceEngine();
    engine.resumeExecution(executionId, { eventData }).catch((err) => {
      console.error("Error resuming after event:", err);
    });
    
    res.json({ 
      success: true, 
      message: "Event received, execution resumed" 
    });
  } catch (error) {
    console.error("Error processing event webhook:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
