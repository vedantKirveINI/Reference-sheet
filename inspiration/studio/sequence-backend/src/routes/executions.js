import express from "express";
import * as executionModel from "../models/executions.js";
import * as sequenceModel from "../models/sequences.js";
import { SequenceEngine } from "../services/engine.js";

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const { sequenceId, triggerData, triggeredBy, workspaceId } = req.body;
    
    if (!sequenceId) {
      return res.status(400).json({ error: "sequenceId is required" });
    }
    
    const sequence = await sequenceModel.getSequenceById(sequenceId);
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    
    if (sequence.status !== "published") {
      return res.status(400).json({ error: "Sequence must be published before execution" });
    }
    
    const execution = await executionModel.createExecution({
      sequenceId,
      sequenceVersion: sequence.version,
      triggerData,
      triggeredBy,
      workspaceId: workspaceId || sequence.workspace_id,
    });
    
    const engine = new SequenceEngine();
    engine.startExecution(execution.id).catch((err) => {
      console.error("Error in async execution:", err);
    });
    
    res.status(201).json({ 
      success: true, 
      data: execution,
      message: "Sequence execution started" 
    });
  } catch (error) {
    console.error("Error starting execution:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const execution = await executionModel.getExecutionById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: "Execution not found" });
    }
    
    res.json({ success: true, data: execution });
  } catch (error) {
    console.error("Error fetching execution:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/logs", async (req, res) => {
  try {
    const logs = await executionModel.getExecutionLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching execution logs:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/sequence/:sequenceId", async (req, res) => {
  try {
    const executions = await executionModel.getExecutionsBySequence(req.params.sequenceId);
    res.json({ success: true, data: executions });
  } catch (error) {
    console.error("Error fetching executions:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const execution = await executionModel.getExecutionById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: "Execution not found" });
    }
    
    if (execution.status === "completed" || execution.status === "failed" || execution.status === "cancelled") {
      return res.status(400).json({ error: "Execution is already finished" });
    }
    
    const updated = await executionModel.updateExecution(req.params.id, {
      status: "cancelled",
    });
    
    res.json({ success: true, data: updated, message: "Execution cancelled" });
  } catch (error) {
    console.error("Error cancelling execution:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/resume", async (req, res) => {
  try {
    const execution = await executionModel.getExecutionById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: "Execution not found" });
    }
    
    if (execution.status !== "waiting") {
      return res.status(400).json({ error: "Execution is not in waiting state" });
    }
    
    const engine = new SequenceEngine();
    engine.resumeExecution(req.params.id, req.body.resumeData).catch((err) => {
      console.error("Error resuming execution:", err);
    });
    
    res.json({ success: true, message: "Execution resume initiated" });
  } catch (error) {
    console.error("Error resuming execution:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/status/:status", async (req, res) => {
  try {
    const executions = await executionModel.getExecutionsByStatus(req.params.status);
    res.json({ success: true, data: executions });
  } catch (error) {
    console.error("Error fetching executions by status:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
