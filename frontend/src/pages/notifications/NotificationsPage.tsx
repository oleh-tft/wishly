import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Notification } from "@/types";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";
import { NotificationsTabs } from "@/components/notifications/NotificationsTabs";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { NotificationsEmptyState } from "@/components/notifications/NotificationsEmptyState";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/api/notifications";
import styles from "./NotificationsPage.module.css";
import { Header } from "@/components/layout/Header";
import { ModaL } from "@/components/common/Modal";

export function NotificationsPage() {
  const { t } = useTranslation();
  const [pageType, setPageType] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications()
      .then(setNotifications)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter((n) => !n.read);
  const unreadCount = unread.length;

  async function handleMarkRead(id: string) {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n)),
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  function handleFirstAction() {
    if (pageType === 'all') return;
    setPageType('all');
  }

  function handleSecondAction() {
    if (pageType === 'unread') return;
    setPageType('unread');
  }

  return (
    <>
      <Header variant="back" />
      <div className={styles.notificationWrapper}>
        <div className={styles.wrapper}>
          <NotificationsHeader
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
          />

          <NotificationsTabs unreadCount={unreadCount} activeTab={pageType} firstAction={handleFirstAction} secondAction={handleSecondAction} />

          {loading && <p>{t('notifications.loading')}</p>}
          {error && <p>{t('notifications.error')} {error}</p>}

          {pageType === 'all' ?
            (!loading && !error && notifications.length === 0 ? (
              <NotificationsEmptyState
                heading={t('notifications.emptyAllHeading')}
                subtext={t('notifications.emptyAllSubtext')}
              />
            ) : (
              <div className={styles.card}>
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onMobileClick={() => {
                      if (window.innerWidth <= 1150) {
                        setViewingNotification(notification);
                        handleMarkRead(notification.id);
                      }
                    }}
                  />
                ))}
              </div>
            )) : !loading && !error && unread.length === 0 ? (
              <NotificationsEmptyState
                heading={t('notifications.emptyUnreadHeading')}
                subtext={t('notifications.emptyUnreadSubtext')}
              />
            ) : (
              <div className={styles.card}>
                {unread.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onMobileClick={() => {
                      if (window.innerWidth <= 1150) {
                        setViewingNotification(notification);
                      }
                    }}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
      {viewingNotification && (
        <NotificationDetailsModal
          notification={viewingNotification}
          onClose={() => setViewingNotification(null)}
        />
      )}
    </>
  );
}

interface NotificationDetailsModalProps {
  notification: Notification;
  onClose: () => void;
}

function NotificationDetailsModal({
  notification,
  onClose,
}: NotificationDetailsModalProps) {
  const { t } = useTranslation();
  return (
    <ModaL
      title={t('notifications.detailsTitle')}
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px"}}>
        <p style={{fontWeight: "bold"}}>{notification.title}</p>
        <p style={{color: "var(--color-gray)", marginBottom: "1em"}}>{notification.message}</p>

        <span
          style={{
            color: "var(--color-gray)",
            fontSize: "12px",
          }}
        >
          {notification.createdAt}
        </span>
      </div>
    </ModaL>
  );
}