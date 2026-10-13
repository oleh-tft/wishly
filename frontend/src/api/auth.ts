import type { AuthResponse } from "@/types";
import { apiPost } from "./client";

const TOKEN_KEY = "token";
const REMEMBER_KEY = "rememberMe";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiPost<AuthResponse>("/api/auth/register", {
    name,
    email,
    password,
  });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false,
): Promise<AuthResponse> {
  const data = await apiPost<AuthResponse>("/api/auth/login", {
    email,
    password,
    remember_me: rememberMe,
  });

  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.removeItem(REMEMBER_KEY);
  }

  return data;
}

export async function googleCredentialLogin(credential: string): Promise<AuthResponse> {
  const data = await apiPost<AuthResponse>("/api/auth/google", { credential });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export async function oauthLogin(
  provider: "google",
  code: string,
  state?: string,
  redirectUri: string = "postmessage",
): Promise<AuthResponse> {
  const data = await apiPost<AuthResponse>(`/api/auth/${provider}`, {
    code,
    state,
    redirect_uri: redirectUri,
  });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

