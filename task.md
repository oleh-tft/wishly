# Завдання по ендпоінтах для студентів

Кожен студент відповідає за **реалізацію backend-ендпоінта** і **підключення свого React UI до API**.  
Зразок реалізації: `GET /api/wishlists` у `backend/app/routers/wishlists.py`.  
Специфікація схем: `backend/app/schemas.py`, заглушки: `backend/app/routers/stubs.py`.

---

## krapXXX

**PR:** #10, #11 (revert), #12, #15, #16, #17  
**Гілки:** `feature/profileANDsettings`, `SCRUM-28-fresh`, `SCRUM-47`, `SCRUM-49`, `SCRUM-48`  
**Зроблено в UI:** ProfilePage, SettingsPage, SharedWishesPage, компоненти `StatCard`, `ToggleSwitch`, `InputField`, `SharedWishlistCard`.

### `GET /api/users/me` — профіль поточного користувача

- **React:** `ProfilePage` (`/profile`), `Header` (ім'я та аватар)
- **Backend:** реалізувати handler замість заглушки в `stubs.py`; повертати `UserResponse` (`id`, `name`, `email`, `avatarUrl`)
- **Frontend:**
  - створити `frontend/src/api/users.ts` з `fetchCurrentUser()`
  - у `ProfilePage` завантажувати дані через `useEffect`, прибрати хардкод «Sara Mitchell»
  - у `Header` показувати ім'я та ініціал з API замість статичних значень
- **PR:** #10, #12, #15, #17

### `PATCH /api/users/me` — оновлення профілю / налаштувань

- **React:** `SettingsPage` (`/settings`)
- **Backend:** приймати `UpdateUserRequest` (name, avatarUrl тощо), оновлювати користувача, повертати `UserResponse`
- **Frontend:**
  - додати `updateCurrentUser()` у `frontend/src/api/users.ts`
  - у `handleSave` на `SettingsPage` викликати `apiPatch` замість `console.log`
  - обробити стани loading / error / success після збереження
- **PR:** #10, #12, #15 (#17 — повна версія форми)

### `GET /api/wishlists/shared` — спільні вішлісти

- **React:** `SharedWishesPage` (`/shared-wishes`)
- **Backend:** повертати `list[WishlistResponse]` для вішлістів, якими поділилися з поточним користувачем
- **Frontend:**
  - створити функцію `fetchSharedWishlists()` (наприклад, у `frontend/src/api/wishlists.ts`)
  - замінити mock-масив `sharedLists` у `SharedWishesPage` на дані з API
  - зберегти пошук і фільтрацію по табах на клієнті
- **PR:** #16, #17

---

## ShVira

**PR:** #8, #9, #18, #19, #20  
**Гілки:** `SCRUM-23`, `SCRUM-29`, `TestSCRUM-41`, `SCRUM-42`, `fix/header-navigation`  
**Зроблено в UI:** LoginPage, SignInPage, NotificationsPage, NotificationsUnreadPage, `SignInForm`, `NotificationRow`, фікс навігації в `Header`.

### `POST /api/auth/login` — вхід

- **React:** `LoginPage` (`/login`), компонент `SignInForm`
- **Backend:** перевіряти email/password з `LoginRequest`, повертати `AuthResponse` з JWT-токеном
- **Frontend:**
  - створити `frontend/src/api/auth.ts` з `login(email, password)`
  - у `SignInForm` / `LoginPage` викликати API при submit, зберігати токен (localStorage або context)
  - після успішного входу редірект на `/wishlists`
- **PR:** #8 (HTML), #18 (React)

### `POST /api/auth/register` — реєстрація

- **React:** `SignInPage` (`/sign-in`), компонент `SignInForm`
- **Backend:** створювати користувача з `RegisterRequest` (name, email, password), повертати `AuthResponse`
- **Frontend:**
  - додати `register()` у `frontend/src/api/auth.ts`
  - підключити форму на `SignInPage` до `POST /api/auth/register`
  - обробити помилки (email вже існує, валідація полів)
- **PR:** #18

### `GET /api/notifications` — сповіщення

- **React:** `NotificationsPage` (`/notifications`), `NotificationsUnreadPage` (`/notifications/unread`)
- **Backend:** повертати `list[NotificationResponse]`; підтримати query `?read=false` для непрочитаних
- **Frontend:**
  - створити `frontend/src/api/notifications.ts`
  - замінити mock-дані з `notifications.data.ts` на виклик API
  - на сторінці unread передавати `read=false`
  - (опційно) додати PATCH для позначення прочитаним, якщо з'явиться в API
- **PR:** #9 (HTML), #19 (React)

### `GET /api/users/me` — дані в Header після логіну

- **React:** `Header` (блок користувача після авторизації)
- **Frontend:**
  - після логіну підвантажувати профіль і показувати реальне ім'я/аватар
  - передавати JWT у заголовку `Authorization` (оновити `frontend/src/api/client.ts`)
- **PR:** #20 (навігація «Назад»), інтеграція з auth-завданнями вище

---

## Andrufr04

**PR:** #4, #5, #13  
**Гілки:** `SCRUM-24`, `SCRUM-25`, `SCRUM-45-46`  
**Зроблено в UI:** WishlistsPage, WishlistDescriptionPage, `WishlistCard`, HTML-версії wishlist / wishlist-description.

### `GET /api/wishlists` — список вішлістів *(ендпоінт уже реалізований як зразок)*

- **React:** `WishlistsPage` (`/wishlists`)
- **Backend:** зразок готовий у `backend/app/routers/wishlists.py` — переконатися, що mock-дані відповідають UI
- **Frontend:**
  - підключити `fetchWishlists()` з `frontend/src/api/wishlists.ts` (файл уже є)
  - замінити хардкод карток у `WishlistsPage` на `.map()` по даних з API
  - оновити підзаголовок «4 lists · 49 items» динамічно з відповіді
- **PR:** #4, #13

### `POST /api/wishlists` — створення вішліста

- **React:** `WishlistsPage` — кнопка **New wishlist**
- **Backend:** приймати `CreateWishlistRequest` (title, description), повертати `WishlistResponse` зі статусом `201`
- **Frontend:**
  - додати `createWishlist()` у `frontend/src/api/wishlists.ts`
  - замінити `onClick={() => navigate(-1)}` на відкриття форми / modal і виклик API
  - після створення оновити список або перейти на новий вішліст
- **PR:** #4, #13

### `GET /api/wishlists/{wishlist_id}` — деталі одного вішліста

- **React:** `WishlistPage` (`/wishlists/:id`) — зараз заглушка
- **Backend:** повертати `WishlistDetailResponse` (title, description, itemCount, reservedCount)
- **Frontend:**
  - реалізувати UI сторінки на основі `wishlist.html` з PR #5
  - завантажувати дані за `wishlistId` з `useParams`
  - додати `fetchWishlist(id)` у API-шар
- **PR:** #5

### `GET /api/wishlists/{wishlist_id}/items` — подарунки у вішлісті

- **React:** `WishlistDescriptionPage` (`/wishlists/:id/description`), компонент `ItemCard`
- **Backend:** повертати `list[WishItemResponse]` для вказаного вішліста
- **Frontend:**
  - додати `fetchWishlistItems(wishlistId)`
  - замінити хардкод «Birthday 2025» та статичні `ItemCard` на дані з API
  - мапити поля `title`, `price`, `isReserved` на `ItemCard`
- **PR:** #5, #13

---

## oleh-tft

**PR:** #6 (closed), #7, #14  
**Гілки:** `SCRUM-22`, `SCRUM-36`  
**Зроблено в UI:** LandingPage (статична), React-скелет проєкту, заглушки ReservationPage та WishlistPage.

### `POST /api/items/{item_id}/reserve` — резервування подарунка

- **React:** `ReservationPage` (`/reservation`), кнопка **Reserve** у `ItemCard` (`WishCard.tsx`)
- **Backend:** приймати `ReserveItemRequest` (опційно), позначати item як reserved, повертати `201`
- **Frontend:**
  - створити `frontend/src/api/items.ts` з `reserveItem(itemId)`
  - реалізувати UI `ReservationPage` (список зарезервованих / форма резервування)
  - у `ItemCard` підключити кнопку Reserve до API та оновлювати стан `isReserved`
- **PR:** #14 (заглушка ReservationPage)

### `GET /api/wishlists/{wishlist_id}` — допоміжне завдання (якщо Andrufr04 не встигне)

- **React:** `WishlistPage` (`/wishlists/:id`)
- **Примітка:** основне завдання на Andrufr04 (PR #5). Якщо сторінка лишається порожньою —oleh-tft може допомогти з UI та підключенням API за тим самим ендпоінтом.
- **PR:** #14

### Landing (`/`) — без API

- **React:** `LandingPage` — статична сторінка, ендпоінт не потрібен
- **Завдання:** переконатися, що лінки на `/login` та `/sign-in` працюють після міграції на React
- **PR:** #7 (HTML), #14 (React)

---

## Зведена таблиця відповідальності

| # | Метод | Шлях | Відповідальний | React-сторінка |
|---|-------|------|----------------|----------------|
| 1 | `POST` | `/api/auth/register` | ShVira | `SignInPage` |
| 2 | `POST` | `/api/auth/login` | ShVira | `LoginPage` |
| 3 | `GET` | `/api/wishlists/{id}` | Andrufr04 | `WishlistPage` |
| 4 | `POST` | `/api/wishlists` | Andrufr04 | `WishlistsPage` |
| 5 | `GET` | `/api/wishlists/{id}/items` | Andrufr04 | `WishlistDescriptionPage` |
| 6 | `GET` | `/api/wishlists/shared` | krapXXX | `SharedWishesPage` |
| 7 | `POST` | `/api/items/{id}/reserve` | oleh-tft | `ReservationPage`, `ItemCard` |
| 8 | `GET` | `/api/users/me` | krapXXX (+ ShVira: Header) | `ProfilePage`, `Header` |
| 9 | `PATCH` | `/api/users/me` | krapXXX | `SettingsPage` |
| 10 | `GET` | `/api/notifications` | ShVira | `NotificationsPage`, `NotificationsUnreadPage` |
| — | `GET` | `/api/wishlists` | Andrufr04 (підключення) | `WishlistsPage` |

---

## Загальні вимоги для всіх

1. Backend: слідувати структурі `router → schema → handler`, як у `wishlists.py`
2. Frontend: API-функції в окремих файлах (`api/*.ts`), типи з `frontend/src/types/index.ts`
3. Після логіну — передавати JWT у `Authorization: Bearer <token>` (оновити `client.ts`)
4. Обробляти помилки API (4xx/5xx) і показувати користувачу зрозуміле повідомлення
5. Перевіряти роботу через Swagger (`http://localhost:8000/docs`) і відповідну React-сторінку
