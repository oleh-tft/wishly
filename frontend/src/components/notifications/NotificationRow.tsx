import { useTranslation } from "react-i18next";
import { Notification } from "@/types";
import styles from "./NotificationRow.module.css";
import {
  SvgNotificationReserved,
  SvgNotificationShared,
  SvgNotificationCancelled,
  SvgNotificationEvent
} from "@/components/common/Icons";


const getCategoryIcon = (category: string) => {
  switch (category) {
    case "reserved":
      return <div className={`${styles.notificationIcon} ${styles.iconReserved}`}><SvgNotificationReserved /></div>
    case "shared":
      return <div className={`${styles.notificationIcon} ${styles.iconShared}`}><SvgNotificationShared /></div>
    case "cancelled":
      return <div className={`${styles.notificationIcon} ${styles.iconCancelled}`}><SvgNotificationCancelled /></div>
    case "event":
      return <div className={`${styles.notificationIcon} ${styles.iconEvent}`}><SvgNotificationEvent /></div>
    default:
      return 
  }
};

type NotificationRowProps = {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onMobileClick: () => void
};

export function NotificationRow({
  notification,
  onMarkRead,
  onMobileClick
}: NotificationRowProps) {
  const { t } = useTranslation();
  const { id, title, message, createdAt, read, category } = notification;

  return (
    <div className={styles.row} onClick={onMobileClick}>
      
      {getCategoryIcon(category)}

      <div className={styles.row__body}>
        <div className={styles.row__titleLine}>
          <span className={styles.row__title}>{title}</span>
          {!read && (
            <span
              className={styles.row__dot}
              role="status"
            />
          )}
        </div>
        <p className={styles.row__desc}>{message}</p>
      </div>

      <div className={styles.row__meta}>
        <span className={styles.row__time}>{createdAt}</span>
        {!read && (
          <button
            type="button"
            className={styles.row__markRead}
            onClick={(e) => {e.stopPropagation(); onMarkRead(id)}}
          >
            {t('notifications.markRead')}
          </button>
        )}
      </div>
    </div>
  );
}