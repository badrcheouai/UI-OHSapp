import axios from 'axios';
import  keycloak  from './keycloak';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

api.interceptors.request.use(cfg => {
    if (keycloak.token) {
        cfg.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return cfg;
});

export async function apiFetch(url: string, { method = "GET", body, token }: { method?: string; body?: any; token?: string }) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 401) {
    // Handle token expiration (e.g., redirect to login)
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
