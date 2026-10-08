import type { UpdateUserRequest, User } from "@/types";
import { apiDelete, apiGet, apiPatch } from "./client";

export type UserResponse = User;

export function fetchCurrentUser(): Promise<User> {
  return apiGet<User>("/api/users/me");
}

export function updateCurrentUser(body: UpdateUserRequest): Promise<User> {
  return apiPatch<User>("/api/users/me", body);
}

export function deleteCurrentUser(): Promise<void> {
  return apiDelete("/api/users/me");
}