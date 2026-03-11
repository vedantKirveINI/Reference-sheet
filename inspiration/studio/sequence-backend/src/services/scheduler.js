import * as executionModel from "../models/executions.js";
import { SequenceEngine } from "./engine.js";
import env from "../config/env.js";

export class SchedulerService {
  constructor(options = {}) {
    this.pollIntervalMs = options.pollIntervalMs || env.SCHEDULER_POLL_INTERVAL_MS;
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    this.isRunning = true;
    console.log(`Scheduler started with ${this.pollIntervalMs}ms interval`);

    this.poll();

    this.intervalId = setInterval(() => {
      this.poll();
    }, this.pollIntervalMs);
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("Scheduler stopped");
  }

  async poll() {
    if (!this.isRunning) return;

    try {
      const waitingExecutions = await executionModel.getWaitingExecutions();

      if (waitingExecutions.length > 0) {
        console.log(`Found ${waitingExecutions.length} waiting executions ready to resume`);
      }

      const engine = new SequenceEngine();

      for (const execution of waitingExecutions) {
        try {
          console.log(`Resuming execution ${execution.id}`);
          await engine.resumeExecution(execution.id, { resumedByScheduler: true });
        } catch (error) {
          console.error(`Error resuming execution ${execution.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Scheduler poll error:", error);
    }
  }
}
