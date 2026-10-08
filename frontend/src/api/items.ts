import { apiGet, apiPost, apiDelete, apiPatch } from "./client";
import type { ReservedItem, WishItem } from "@/types";

export function fetchReservedByMeItems(): Promise<ReservedItem[]> {
  return apiGet<ReservedItem[]>("/api/items/reserved-by-me");
}

export function fetchReservedForMeItems(): Promise<ReservedItem[]> {
  return apiGet<ReservedItem[]>("/api/items/reserved-for-me");
}

export function reserveItem(itemId: string, note?: string): Promise<unknown> {
  return apiPost(`/api/items/${itemId}/reserve`, { note });
}

export function unreserveItem(itemId: string): Promise<unknown> {
  return apiDelete(`/api/items/${itemId}/reserve`);
}

export function updateItem(itemId: string, data: { 
  title?: string; 
  price?: number; 
  description?: string; 
  imageUrl?: string; 
  externalLink?: string 
}): Promise<WishItem> {
  return apiPatch<WishItem>(`/api/items/${itemId}`, data);
}

export function deleteItem(itemId: string): Promise<void> {
  return apiDelete(`/api/items/${itemId}`);
}