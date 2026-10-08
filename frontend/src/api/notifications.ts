import { Notification } from "@/types";
import { apiGet, apiPatch } from "./client";
import i18n from "@/locales/i18n";

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return i18n.t("time.justNow");
  if (diffMinutes < 60) return i18n.t("time.minutesAgo", { count: diffMinutes });

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return i18n.t("time.hoursAgo", { count: diffHours });

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return i18n.t("time.yesterday");
  
  return i18n.t("time.daysAgo", { count: diffDays });
}

function toUiNotification(notification: Notification): Notification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    createdAt: formatRelativeTime(notification.createdAt),
    read: notification.read,
    category: notification.category,
  };
}

export function fetchNotifications(read?: boolean): Promise<Notification[]> {
  const query = read === false ? "?read=false" : read === true ? "?read=true" : "";
  return apiGet<Notification[]>(`/api/notifications${query}`).then((items) =>
    items.map(toUiNotification),
  );
}

export function markNotificationRead(id: string): Promise<Notification> {
  return apiPatch<Notification>(`/api/notifications/${id}/read`, {}).then((item) =>
    toUiNotification(item),
  );
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPatch(`/api/notifications/read-all`, {});
}