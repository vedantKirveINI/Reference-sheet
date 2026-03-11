import express from "express";
import { generateFormula } from "../services/aiFormula.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    const result = await generateFormula(prompt.trim(), context || {});

    if (result.success) {
      res.json({
        success: true,
        formula: result.formula,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("AI Formula route error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
