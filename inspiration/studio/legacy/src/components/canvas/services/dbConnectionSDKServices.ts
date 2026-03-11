// import { serverConfig } from "oute-ds-utils";
import { serverConfig } from "@src/module/ods";
import Connection from "oute-services-db-connection-sdk";
import { handleError } from "./baseConfig";

const getConnectionInstance = () => {
  return new Connection({
    url: serverConfig.OUTE_SERVER,
    token:
      (window as any).accessToken ||
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEN0t1VlR0eEQ3a2pUbEFkb3Q0WVFMTk90UUNEWWJGZnFEeU9URGJ3VWdjIn0.eyJleHAiOjE3MTYzNTUzOTIsImlhdCI6MTcwNzcxNTM5MywiYXV0aF90aW1lIjoxNzA3NzE1MzkyLCJqdGkiOiI3MGQ5ODcwMy02ZDEyLTQ0MjctYTFhYy1lOWFkYTc4NTQ0ZTIiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvZm8uYXBwL3JlYWxtcy9vdXRlIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImE3NzJkOGI0LWNkYTItNDcyYS1iNDY2LTk3YWE0ZjYxNDkzMSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im91dGUtaWMtY2FudmFzIiwibm9uY2UiOiI5YzM0NzNjNC04N2RjLTRmMWQtYjA1Zi00MWIxNzNjMzQwOGEiLCJzZXNzaW9uX3N0YXRlIjoiNTZiNGY0YjAtODQ5MS00MTRhLTlhZjUtYjI0NWNmYTgxNDEzIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2NvbnRlbnQuZ29mby5hcHAiLCJodHRwczovL2ZjLm91dGUuYXBwIiwiaHR0cHM6Ly9pYy5vdXRlLmFwcCIsImh0dHBzOi8vb3V0ZS5hcHAiLCJodHRwczovL2ljYy5vdXRlLmFwcCIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImh0dHBzOi8vaWNsLm91dGUuYXBwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtb3V0ZSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjU2YjRmNGIwLTg0OTEtNDE0YS05YWY1LWIyNDVjZmE4MTQxMyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkRldiBQYXRlbCIsInByZWZlcnJlZF91c2VybmFtZSI6ImRldiIsImdpdmVuX25hbWUiOiJEZXYiLCJmYW1pbHlfbmFtZSI6IlBhdGVsIiwiZW1haWwiOiJkZXZAZ21haWwuY29tIn0.mojPKf2Yrvnj3wndUFc-6XNlYhCXGnKStAWXW9c20ZhYmzTAYmbFK2j8fpvn8LWz7y_oPhhxkXqxhde5v_nSn9RaHkMZrod6COmIt5fqykNgBXqygsgn3aO5NxP7VPQ8_UjVu-74_4s8HkanlWmIPR4HkUcfY7JO8EkfA-OWsJqdSAIQ91PqsOPjjD5wFD1eDEYZWjK2b-iT2GRs_ktmRAAbbP5Vqrp2fZf24F0zqTzoYyH2Ux4W0j1osTpvhmBm311zAJhTjBgOBXH3VlNa8-I8ajczyf6OBcQqfdvCg83SmiubJSRveAfbLLg3CUd8zRvfg1P2StgtK_wQSwPDDg",
  });
};

export const connectionSDKServices = {
  getByParent: async (payload) => {
    try {
      const response = await getConnectionInstance().getByParent(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getTables: async (payload) => {
    try {
      const response = await getConnectionInstance().getTables(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getTableFields: async (payload) => {
    try {
      const response = await getConnectionInstance().getTableFields(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
