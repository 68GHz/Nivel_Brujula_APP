import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_id_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

export const TokenStorage = {
  async saveTokens(token: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

function getApiUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL || "https://nivel-burbuja-api.vercel.app";
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiUrl();
  let token = await TokenStorage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  // Si devuelve 401, reintenta UNA SOLA VEZ renovando el token
  if (response.status === 401) {
    const refreshToken = await TokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          await TokenStorage.saveTokens(data.token, data.refreshToken);
          token = data.token;
          headers["Authorization"] = `Bearer ${token}`;

          // Reintentar la llamada original
          response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          await TokenStorage.clearTokens();
        }
      } catch {
        await TokenStorage.clearTokens();
      }
    }
  }

  return response;
}
