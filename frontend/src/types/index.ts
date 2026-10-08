export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio?: string | null;
  createdAt: string;

  emailNotifications: boolean;
  reservationNotifications: boolean;
  wishlistActivity: boolean;
  language: string;
  defaultVisibility: string;
};

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;

  emailNotifications?: boolean;
  reservationNotifications?: boolean;
  wishlistActivity?: boolean;
  language?: string;
  defaultVisibility?: string;
}

export type Wishlist = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  giftingDate?: string | null;
  visibility: string;
  itemCount: number;
  authorName?: string;
  authorAvatarUrl?: string | null;
  reservedCount?: number;
};

export type WishlistDetail = Wishlist & {
  reservedCount: number;
  userId: string;
};

export type WishItem = {
  id: string;
  wishlistId: string;
  title: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  externalLink?: string | null;
  isReserved: boolean;
  reservedNote?: string | null;
  reservedByMe?: boolean;
  reservedByName?: string | null;
};

export type ReservedItem = {
  id: string;
  wishlistId: string;
  title: string;
  price: number;
  wishlistTitle: string;
  note?: string | null;
  imageUrl?: string | null;
  giftingDate?: string | null;
  wishlistImageUrl?: string | null;
  authorName: string;
  reservedByName?: string | null;
  description?: string | null;
  externalLink?: string | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  category: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};