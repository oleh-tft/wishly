import { apiGet, apiPost, apiDelete, apiPatch } from "./client";
import type { Wishlist, WishlistDetail, WishItem, ReservedItem } from "@/types"; 

export function fetchWishlists(): Promise<Wishlist[]> {
  return apiGet<Wishlist[]>("/api/wishlists");
}

export function fetchSharedWishlists(): Promise<Wishlist[]> {
  return apiGet<Wishlist[]>("/api/wishlists/shared");
}

export function fetchWishlist(id: string): Promise<WishlistDetail> {
  return apiGet<WishlistDetail>(`/api/wishlists/${id}`);
}

export function fetchWishlistItems(id: string): Promise<WishItem[]> {
  return apiGet<WishItem[]>(`/api/wishlists/${id}/items`);
}

export function createWishlist(data: { 
  title: string; 
  description?: string;
  imageUrl?: string;
  giftingDate?: string;
  visibility?: string;
}): Promise<Wishlist> {
  return apiPost<Wishlist>("/api/wishlists", data);
}

export function updateWishlist(id: string, data: { 
  title?: string; 
  description?: string;
  imageUrl?: string;
  giftingDate?: string;
  visibility?: string;
}): Promise<Wishlist> {
  return apiPatch<Wishlist>(`/api/wishlists/${id}`, data);
}

export function deleteWishlist(id: string): Promise<void> {
  return apiDelete(`/api/wishlists/${id}`);
}

export function addWishlistItem(
  wishlistId: string, 
  data: { title: string; price: number; description?: string; imageUrl?: string; externalLink?: string }
): Promise<{ status: string; id: string }> {
  return apiPost<{ status: string; id: string }>(`/api/wishlists/${wishlistId}/items`, data);
}

export function joinWishlist(id: string): Promise<{ status: string }> {
  return apiPost<{ status: string }>(`/api/wishlists/${id}/share`, {});
}