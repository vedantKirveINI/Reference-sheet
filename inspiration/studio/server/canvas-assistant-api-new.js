/**
 * New Canvas Assistant API Server
 * 
 * This is the new modular architecture implementation.
 * To use this instead of the old canvas-assistant-api.js:
 * 1. Update package.json script to point to this file
 * 2. Or integrate the router into your main Express app
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import canvasAssistantRouter from "./canvas-assistant/index.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Mount the canvas assistant router
app.use("/api/canvas-assistant", canvasAssistantRouter);

const PORT = process.env.CANVAS_ASSISTANT_PORT || 3003;

app.listen(PORT, () => {
  console.log(`Canvas Assistant API (new architecture) running on port ${PORT}`);
});
