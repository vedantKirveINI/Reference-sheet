import express from "express";
import * as sequenceModel from "../models/sequences.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, description, nodes, links, settings, workspaceId, createdBy } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    
    const sequence = await sequenceModel.createSequence({
      name,
      description,
      nodes,
      links,
      settings,
      workspaceId,
      createdBy,
    });
    
    res.status(201).json({ success: true, data: sequence });
  } catch (error) {
    console.error("Error creating sequence:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/workspace/:workspaceId", async (req, res) => {
  try {
    const sequences = await sequenceModel.getSequencesByWorkspace(req.params.workspaceId);
    res.json({ success: true, data: sequences });
  } catch (error) {
    console.error("Error fetching sequences:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const sequence = await sequenceModel.getSequenceById(req.params.id);
    
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    
    res.json({ success: true, data: sequence });
  } catch (error) {
    console.error("Error fetching sequence:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, description, nodes, links, settings, status } = req.body;
    
    const sequence = await sequenceModel.updateSequence(req.params.id, {
      name,
      description,
      nodes,
      links,
      settings,
      status,
    });
    
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    
    res.json({ success: true, data: sequence });
  } catch (error) {
    console.error("Error updating sequence:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await sequenceModel.deleteSequence(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    
    res.json({ success: true, message: "Sequence deleted" });
  } catch (error) {
    console.error("Error deleting sequence:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/publish", async (req, res) => {
  try {
    const sequence = await sequenceModel.publishSequence(req.params.id);
    
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    
    res.json({ success: true, data: sequence });
  } catch (error) {
    console.error("Error publishing sequence:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
