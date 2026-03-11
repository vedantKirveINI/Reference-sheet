import { serverConfig } from "@src/module/ods";
import { handleError } from "./baseConfig";

const getBaseUrl = () => serverConfig.STUDIO_SERVER;
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${window.accessToken}`,
});

const sequenceSDKServices = {
  async createSequence(data) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/sequences`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const result = await response.json();
      handleError(result, "Create sequence");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Create sequence");
    }
  },

  async getSequence(id) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/sequences/${id}`, {
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Get sequence");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Get sequence");
    }
  },

  async getSequencesByWorkspace(workspaceId) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/sequences/workspace/${workspaceId}`, {
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Get sequences by workspace");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Get sequences by workspace");
    }
  },

  async updateSequence(id, data) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/sequences/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const result = await response.json();
      handleError(result, "Update sequence");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Update sequence");
    }
  },

  async deleteSequence(id) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/sequences/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Delete sequence");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Delete sequence");
    }
  },

  async publishSequence(id) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/sequences/${id}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Publish sequence");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Publish sequence");
    }
  },

  async startExecution(sequenceId, triggerData = {}, triggeredBy = 'manual') {
    try {
      const response = await fetch(`${getBaseUrl()}/api/executions/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sequenceId, triggerData, triggeredBy }),
      });
      const result = await response.json();
      handleError(result, "Start execution");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Start execution");
    }
  },

  async getExecution(id) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/executions/${id}`, {
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Get execution");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Get execution");
    }
  },

  async getExecutionLogs(id) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/executions/${id}/logs`, {
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Get execution logs");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Get execution logs");
    }
  },

  async getExecutionsBySequence(sequenceId) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/executions/sequence/${sequenceId}`, {
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Get executions by sequence");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Get executions by sequence");
    }
  },

  async cancelExecution(id) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/executions/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Cancel execution");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Cancel execution");
    }
  },

  async resumeExecution(id, resumeData = {}) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/executions/${id}/resume`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(resumeData),
      });
      const result = await response.json();
      handleError(result, "Resume execution");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Resume execution");
    }
  },

  async triggerWebhook(sequenceId, payload = {}) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/webhooks/trigger/${sequenceId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      handleError(result, "Trigger webhook");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Trigger webhook");
    }
  },

  async completeHitlTask(taskId, outcome, data = {}) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/webhooks/hitl/${taskId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ outcome, data }),
      });
      const result = await response.json();
      handleError(result, "Complete HITL task");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Complete HITL task");
    }
  },

  async getPendingHitlTasks(workspaceId) {
    try {
      let url = `${getBaseUrl()}/api/webhooks/hitl/pending`;
      if (workspaceId) {
        url += `?workspaceId=${workspaceId}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      const result = await response.json();
      handleError(result, "Get pending HITL tasks");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Get pending HITL tasks");
    }
  },

  async sendEvent(executionId, eventType, eventData = {}) {
    try {
      const response = await fetch(`${getBaseUrl()}/api/webhooks/event/${executionId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ eventType, eventData }),
      });
      const result = await response.json();
      handleError(result, "Send event");
      return result;
    } catch (error) {
      handleError({ status: 'error', result: { message: error.message } }, "Send event");
    }
  },

  async checkHealth() {
    try {
      const response = await fetch(`${getBaseUrl()}/api/health`, {
        headers: { 'Authorization': `Bearer ${window.accessToken}` },
      });
      return response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },
};

export default sequenceSDKServices;
