async function refreshToken({ refreshToken, clientId, realm, serverUrl }) {
  const url = `${serverUrl}/realms/${realm}/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", clientId);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error("Refresh failed");
  return res.json();
}

async function getAssetAccessInfo({ assetServerUrl, assetId, token }) {
  const url = `${assetServerUrl}/service/v0/asset/get/access/info?asset_id=${assetId}`;

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["token"] = token;
  }

  const res = await fetch(url, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("failed");
  return res.json();
}

const keycloakLogout = async ({
  serverUrl,
  realm,
  clientId,
  idTokenHint,
  refreshToken,
}) => {
  const data = new URLSearchParams();
  data.append("client_id", clientId);
  data.append("id_token_hint", idTokenHint);
  data.append("refresh_token", refreshToken);
  const res = await fetch(
    `${serverUrl}/realms/${realm}/protocol/openid-connect/logout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    }
  );
  if (!res.ok) throw new Error("failed");
  let result = await res.text();
  try {
    result = JSON.parse(result);
  } catch (_) { }
  return result;
};

export { refreshToken, getAssetAccessInfo, keycloakLogout };
