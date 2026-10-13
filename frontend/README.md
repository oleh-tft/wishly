# Wishly Frontend

React application scaffold for the Wishly student project. This folder provides **architecture only** — page implementations are added by students from their feature branches.

## Stack

- React 19 + TypeScript
- Vite
- React Router

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
src/
├── components/       # Shared UI (layout shells, reusable widgets)
│   ├── common/       # Generic components (PagePlaceholder, ExampleButton)
│   └── layout/       # Header, Sidebar, Footer stubs
├── hooks/            # Custom React hooks
├── layouts/          # Route-level layout wrappers
├── pages/            # One folder per page area — replace placeholders here
│   ├── auth/
│   ├── landing/
│   ├── notifications/
│   ├── profile/
│   └── wishlists/
├── routes/           # Router config and path constants
├── styles/           # Global CSS and design tokens
└── types/            # Shared TypeScript types
```

## How to integrate your page

1. Find the matching page file under `src/pages/`.
2. Replace the `PagePlaceholder` content with your React component (ported from your branch).
3. Move shared pieces (header, sidebar, cards) into `src/components/`.
4. Add page-specific styles next to the component or under `src/styles/`.
5. Use `ROUTES` from `src/routes/paths.ts` for links — do not hard-code paths.

## Route map

| Path | Page file | Layout |
|------|-----------|--------|
| `/` | `pages/landing/LandingPage.tsx` | Public |
| `/login` | `pages/auth/LoginPage.tsx` | Auth |
| `/sign-in` | `pages/auth/SignInPage.tsx` | Auth |
| `/wishlists` | `pages/wishlists/WishlistsPage.tsx` | App |
| `/wishlists/:wishlistId` | `pages/wishlists/WishlistPage.tsx` | App |
| `/wishlists/:wishlistId/description` | `pages/wishlists/WishlistDescriptionPage.tsx` | App |
| `/shared-wishes` | `pages/wishlists/SharedWishesPage.tsx` | App |
| `/profile` | `pages/profile/ProfilePage.tsx` | App |
| `/settings` | `pages/profile/SettingsPage.tsx` | App |
| `/notifications` | `pages/notifications/NotificationsPage.tsx` | App |
| `/notifications/unread` | `pages/notifications/NotificationsUnreadPage.tsx` | App |

## Layouts

- **PublicLayout** — landing and marketing pages (header + footer).
- **AuthLayout** — centered shell for login/sign-in.
- **AppLayout** — authenticated app shell with sidebar.

Replace `Header`, `Sidebar`, and `Footer` in `src/components/layout/` with your designs.

## Conventions

- All code, comments, and UI copy must be in **English**.
- Page components are named `*Page` and live in `src/pages/<area>/`.
- Export pages through an `index.ts` barrel file in each folder.
- Use the `@/` import alias for `src/` paths.

## Assets

Place static images and fonts in `public/` (served as-is) or import them from `src/assets/` (processed by Vite).
