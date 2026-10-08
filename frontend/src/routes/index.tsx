import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { LandingPage } from "@/pages/landing";
import { LoginPage, SignInPage, OAuthCallbackPage } from "@/pages/auth";
import {
  WishlistsPage,
  WishlistDescriptionPage,
  SharedWishesPage,
  ReservationPage,
} from "@/pages/wishlists";
import { ProfilePage, SettingsPage } from "@/pages/profile";
import {
  NotificationsPage,
} from "@/pages/notifications";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "@/routes/paths";
import { getToken } from "@/api/auth";

function ProtectedRoute() {
  const token = getToken();
  if (!token) {
    return <Navigate to={ROUTES.signIn} replace />;
  }
  return <Outlet />;
}

function GuestRoute() {
  const token = getToken();
  if (token) {
    return <Navigate to={ROUTES.profile} replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ path: ROUTES.home, element: <LandingPage /> }],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.signUp, element: <LoginPage /> },
          { path: ROUTES.signIn, element: <SignInPage /> },
        ],
      },
    ],
  },
  {
    path: ROUTES.googleCallback,
    element: <OAuthCallbackPage provider="google" />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.wishlists, element: <WishlistsPage /> },
          { path: ROUTES.sharedWishes, element: <SharedWishesPage /> },
          { path: ROUTES.reservation, element: <ReservationPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
        ],
      },
      { 
        path: ROUTES.wishlistDescription, 
        element: <WishlistDescriptionPage /> 
      },
      {
        path: ROUTES.notifications,
        element: <NotificationsPage />
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);