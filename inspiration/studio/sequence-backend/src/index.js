import "dotenv/config";
import express from "express";
import cors from "cors";
import env, { validateEnv } from "./config/env.js";
import { initializeDatabase } from "./models/database.js";
import sequenceRoutes from "./routes/sequences.js";
import executionRoutes from "./routes/executions.js";
import webhookRoutes from "./routes/webhooks.js";
import aiFormulaRoutes from "./routes/aiFormula.js";
import { SchedulerService } from "./services/scheduler.js";

validateEnv();

const app = express();
const PORT = env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/sequences", sequenceRoutes);
app.use("/api/executions", executionRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/ai-formula", aiFormulaRoutes);

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "sequence-backend",
    timestamp: new Date().toISOString() 
  });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");

    const scheduler = new SchedulerService();
    scheduler.start();
    console.log("Scheduler service started");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Sequence Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
