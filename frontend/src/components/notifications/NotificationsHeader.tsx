import { useTranslation } from "react-i18next";
import { SvgCheckmark } from "../common/Icons";
import styles from "./NotificationsHeader.module.css";

type NotificationsHeaderProps = {
  unreadCount: number;
  onMarkAllRead: () => void;
};

export function NotificationsHeader({
  unreadCount,
  onMarkAllRead,
}: NotificationsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div className={styles.header__titleBlock}>
        <h1 className={styles.header__title}>{t('notifications.title')}</h1>
        {unreadCount > 0 && (
          <span className={styles.header__badge}>
            {t('notifications.unreadCount', { count: unreadCount })}
          </span>
        )}
      </div>

      <button
        type="button"
        className={styles.header__markAll}
        onClick={onMarkAllRead}
        aria-label={t('notifications.markAllRead')}
      >
        <SvgCheckmark />
        {t('notifications.markAllRead')}
      </button>
    </div>
  );
}