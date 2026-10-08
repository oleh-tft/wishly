/**
 * Central route path constants.
 * Use these instead of hard-coded strings across the app.
 */
export const ROUTES = {
  home: "/",
  signUp: "/sign-up",
  signIn: "/sign-in",
  wishlists: "/wishlists",
  wishlistDescription: "/wishlists/:wishlistId",
  sharedWishes: "/shared-wishes",
  reservation: "/reservation",
  profile: "/profile",
  settings: "/settings",
  notifications: "/notifications",
  googleCallback: "/auth/google/callback",
} as const;

export type RouteKey = keyof typeof ROUTES;
