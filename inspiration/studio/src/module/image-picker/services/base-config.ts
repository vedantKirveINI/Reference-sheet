import Search from "oute-services-search-sdk";
import Prompt from "oute-services-prompt-sdk";
import { serverConfig } from '@src/module/ods';
import { toast } from "sonner";

declare global {
  interface Window {
    accessToken?: string;
  }
}

export const CONSTANT = {
  AUTHORIZATION: "Bearer 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",
  KEY: "org-c5iSxzetH9d7ksiCGdO92inp",

  UNSPLASH_SERVER_URL: process.env.REACT_APP_UNSPLASH_SERVER_URL,
  AI_SERVER_URL: "https://contentapi.gofo.app",
};

export const getAccessToken = () => {
  return (
    window.accessToken ||
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEN0t1VlR0eEQ3a2pUbEFkb3Q0WVFMTk90UUNEWWJGZnFEeU9URGJ3VWdjIn0.eyJleHAiOjE3MTU3NTAxMDksImlhdCI6MTcwNzEzMjkwOSwiYXV0aF90aW1lIjoxNzA3MTEwMTA5LCJqdGkiOiI4ZWI0N2UwOS02MjBkLTQyYzMtODhlMC01OTY0N2I3YTY0ZjEiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvZm8uYXBwL3JlYWxtcy9vdXRlIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjE3NGY1ZTc4LTU3NDUtNDliZS05MGE1LWFjNzE3MTY4ZjQ4YiIsInR5cCI6IkJlYXJlciIsImF6cCI6Im91dGUtaWMtY2FudmFzIiwibm9uY2UiOiIzOTc1ODZiZS0xNTc2LTRmMzAtYWY3YS03YzNkZjY0NGU0YTUiLCJzZXNzaW9uX3N0YXRlIjoiNzU2YWU4ZWEtY2JmMi00YjNkLWJmMTgtZDc0OTdiZTBhZmU0IiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2NvbnRlbnQuZ29mby5hcHAiLCJodHRwczovL2ZjLm91dGUuYXBwIiwiaHR0cHM6Ly9pYy5vdXRlLmFwcCIsImh0dHBzOi8vb3V0ZS5hcHAiLCJodHRwczovL2ljYy5vdXRlLmFwcCIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImh0dHBzOi8vaWNsLm91dGUuYXBwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtb3V0ZSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6Ijc1NmFlOGVhLWNiZjItNGIzZC1iZjE4LWQ3NDk3YmUwYWZlNCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkhhcnNoIEd1cHRhIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiaGFyc2giLCJnaXZlbl9uYW1lIjoiSGFyc2giLCJmYW1pbHlfbmFtZSI6Ikd1cHRhIiwiZW1haWwiOiJoYXJzaC5ndXB0YUBpbnN0aW5jdGlubm92YXRpb25zLmNvbSJ9.Oqbf6ASIGrNOCUmKr7PCOv_ABsFcCE1wkoz8gnIIhtGTpxqRSlaTHjmzSSXgZJOq6fHeEO9KxPA_kcbOOJ2B2W1b1MEggQqSBnNLZLfQolApoFB6PVgkaW7jtKiXKV9VPoGFqVxuNdhttxhpkHBmM82QnKQfO2ivHEmXS0g-NTCc-yjK4WIATGo3S9NuDB3dfR41-FLGZ9-Ah6cA6zguf_4M3DKsAweZc5N26jYngeJGcImnRItp9MGa6uhoqMq9oHoHGvm16Jz9V9Mq2qCTbLBPqhAOPiOAQFEF-TtJUoJbIc7kYNJIvGc1ZTSufoZPDvpJqvfA0GBxV0oppabfEg"
  );
};

export const searchInstance = () => {
  return new Search({
    url: CONSTANT.UNSPLASH_SERVER_URL,
    token: getAccessToken(),
  });
};

export const promptInstance = () => {
  return new Prompt({
    url: CONSTANT.AI_SERVER_URL,
    token: getAccessToken(),
  });
};

export const renderImages = {
  getImagesFromUnsplash: async ({ query, page }) => {
    try {
      const searchInstanceToSearch = searchInstance();
      const response = await searchInstanceToSearch.searchImage({
        query,
        page: page || 1,
        per_page: 20,
      });

      if (response?.status !== "success") {
        throw new Error(response);
      }

      return response?.result?.results || [];
    } catch (err) {
    }
  },
  getImagesFromAI: async ({ query, page }) => {
    try {
      const promptInstanceToExecute = promptInstance();
      const resp = await promptInstanceToExecute.execute({
        authorization: CONSTANT.AUTHORIZATION,
        key: CONSTANT.KEY,
        prompt_id: "Xlx341dLW",
        state: {
          text: query,
        },
        generate_type: "Image",
        image_size: "256x256",
        number_of_images: 2,
      });

      const { result } = resp || {};

      if (result?.status !== "success") {
        throw new Error(result);
      }
      return result?.result?.data || [];
    } catch (error) {
    }
  },
};

export const getSDKConfig = () => {
  return {
    url: serverConfig.OUTE_SERVER,
    token: getAccessToken(),
  };
};

export const handleError = (error) => {
  if (error.status !== "success") {
    toast.error("Image Picker Error", {
      description: error?.result?.message || "Something went wrong",
    });
  }
};
