import { serverConfig } from "@src/module/ods";

export const getStateId = async (authorizationState): Promise<string> => {
  const response = await fetch(
    `${serverConfig.OUTE_SERVER}/service/v0/temp/storage/save`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: window.accessToken,
      },
      body: JSON.stringify({
        meta: authorizationState,
      }),
    }
  );

  const responseData = await response.json();

  if (responseData.status !== "success") {
    throw new Error(
      responseData?.result?.message || "Failed to save authorization state"
    );
  }

  return responseData?.result?._id;
};
