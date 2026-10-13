import { useTranslation } from "react-i18next";
import styles from "./NotificationsTabs.module.css";

type NotificationsTabsProps = {
  unreadCount: number;
  activeTab: "all" | "unread";
  firstAction: () => void;
  secondAction: () => void;
};

export function NotificationsTabs({ unreadCount, activeTab, firstAction, secondAction }: NotificationsTabsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist">
        <div className={`${styles.tab} ${activeTab === "all" ? styles["tab--active"] : ""}`} onClick={firstAction}>
          {t('notifications.tabs.all')}
        </div>

        <div className={`${styles.tab} ${activeTab === "unread" ? styles["tab--active"] : ""}`} onClick={secondAction}>
          {t('notifications.tabs.unread')}
          {unreadCount > 0 && (
            <span className={styles.tab__count}>{unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}