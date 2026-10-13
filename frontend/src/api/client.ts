import { clearToken, getToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function authHeaders(): { headers: HeadersInit; hadAuth: boolean } {
  const token = getToken();
  return {
    hadAuth: !!token,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

async function handleError(response: Response, hadAuth: boolean): Promise<never> {
  if (response.status === 401 && hadAuth) {
    clearToken();
    window.location.href = "/";
    await new Promise(() => {});
  }
  const body = await response.json().catch(() => null);
  const message = body?.detail ?? `API error ${response.status}: ${response.statusText}`;
  throw new Error(message);
}

export async function apiGet<T>(path: string): Promise<T> {
  const { headers, hadAuth } = authHeaders();
  const response = await fetch(`${API_URL}${path}`, { headers });
  if (!response.ok) {
    await handleError(response, hadAuth);
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const { headers, hadAuth } = authHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await handleError(response, hadAuth);
  }
  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const { headers, hadAuth } = authHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await handleError(response, hadAuth);
  }
  return response.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const { headers, hadAuth } = authHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    await handleError(response, hadAuth);
  }
}
