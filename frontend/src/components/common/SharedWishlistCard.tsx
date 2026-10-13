import { useTranslation } from "react-i18next";
import { SvgArrowFullRight } from "./Icons";

interface SharedWishlistCardProps {
  title: string;
  ownerName: string;
  ownerInitial: string;
  ownerAvatarUrl?: string | null;
  imageUrl?: string | null;
  itemCount: number;
  dateString: string;
  reservedCount: number;
  status: 'Upcoming' | 'Active' | 'Completed';
  onOpen?: () => void;
}

export function SharedWishlistCard({
  title,
  ownerName,
  ownerInitial,
  ownerAvatarUrl,
  imageUrl,
  itemCount,
  dateString,
  reservedCount,
  status,
  onOpen
}: SharedWishlistCardProps) {
  const { t } = useTranslation();
  const progressPercent = itemCount > 0 ? (reservedCount / itemCount) * 100 : 0;
  const badgeClass = `status-badge badge-${status.toLowerCase()}`;

  const bannerStyle = imageUrl 
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  return (
    <div className="shared-wishlist-card" onClick={onOpen}>
      <div className="card-banner-placeholder" style={bannerStyle}>
        <span className={badgeClass}>{t(`sharedWishes.tabs.${status}`)}</span>
      </div>

      <div className="card-details-box">
        <div className="card-owner-row">
          <div className="owner-avatar-circle">
            {ownerAvatarUrl ? (
              <img
                src={ownerAvatarUrl}
                alt={ownerName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              ownerInitial
            )}
          </div>
          <span className="owner-name-label">{ownerName}</span>
        </div>

        <h3 className="wishlist-card-title">{title}</h3>
        <p className="wishlist-card-meta">
          {itemCount} {t('cards.shared.items')} · {dateString}
        </p>

        <div className="progress-tracker-container">
          <div className="progress-text-row">
            <span className="progress-label">{t('cards.shared.reservedLabel')}</span>
            <span className="progress-ratio">{reservedCount}/{itemCount}</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        <button className="card-open-link-btn">
          <span>{t('cards.shared.openBtn')}</span><SvgArrowFullRight />
        </button>
      </div>
    </div>
  );
}