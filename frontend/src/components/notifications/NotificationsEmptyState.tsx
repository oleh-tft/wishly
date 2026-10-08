import styles from "./NotificationsEmptyState.module.css";

interface NotificationsEmptyStateProps {
  heading: string;
  subtext: string;
}

export function NotificationsEmptyState({
  heading,
  subtext,
}: NotificationsEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyStateText}>{heading}</p>
      <p className={styles.emptyStateSubtext}>{subtext}</p>
    </div>
  );
}
