import { ReservedItem } from '@/types';
import '../../styles/components/ReservedItemCard.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgArrowFullRight } from './Icons';

interface ReservedItemCardProps {
  item: ReservedItem;
  onItemClick: () => void;
  onWishlistClick: () => void;
  hideAuthor?: boolean;
  status: 'Upcoming' | 'Active' | 'Completed';
}

export function ReservedItemCard({ item, onItemClick, onWishlistClick, hideAuthor, status }: ReservedItemCardProps) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="reserved-item-card">
      <div className="card-main-content">
        {/* Клік по предмету (Десктоп) */}
        <div className="item-info no-mobile-click" onClick={onItemClick} style={{ cursor: 'pointer' }}>
          <div
            className="img-placeholder desktop-only"
            style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          ></div>
          <div className="item-details">
            <p className='reserved-item-name'>{item.title}</p>
            <p className='reserved-item-price'>${item.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Клік по вішлісту (Десктоп) */}
        <div className="wishlist-info desktop-only no-mobile-click" onClick={onWishlistClick} style={{ cursor: 'pointer' }}>
          <div
            className="img-placeholder"
            style={item.wishlistImageUrl ? { backgroundImage: `url(${item.wishlistImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          ></div>
          <div className="wishlist-details">
            <p className='reserved-wishlish-name'>{item.wishlistTitle}</p>
            {!hideAuthor && <p className='reserved-wishlish-owner'>{item.authorName}</p>}
          </div>
        </div>

        <div className="date-info desktop-only">
          <p>
            {item.giftingDate
              ? new Date(item.giftingDate).toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : t('cards.reserved.ongoing')}
          </p>
        </div>

        <div className={`status-reserved-badge status-${status.toLowerCase()}`}>
          {t(`sharedWishes.tabs.${status}`)}
        </div>
      </div>

      <button
        className={`mobile-more-info mobile-only ${isExpanded ? "mobile-exp" : ""}`}
        onClick={(e) => {
          e.stopPropagation(); // Щоб клік не відкривав модалку на мобілці тут
          setIsExpanded(!isExpanded);
        }}
      >
        {t('cards.reserved.moreInfo')} <SvgArrowFullRight />
      </button>

      {isExpanded && (
        <div className="mobile-expanded-content mobile-only">
          <p className="expanded-label">{t('cards.reserved.wishlistLabel')}</p>

          {/* Клік по вішлісту (Мобілка) */}
          <div className="expanded-wishlist-box" onClick={onWishlistClick} style={{ cursor: 'pointer' }}>
            <div
              className="img-placeholder"
              style={item.wishlistImageUrl ? { backgroundImage: `url(${item.wishlistImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            ></div>
            <div className="wishlist-details">
              <h4>{item.wishlistTitle}</h4>
              {!hideAuthor && <p>{item.authorName}</p>}
              <span className="open-link">{t('cards.reserved.openBtn')}<SvgArrowFullRight /> </span>
            </div>
          </div>

          <p className="expanded-label">{t('cards.reserved.celebrationLabel')}</p>
          <p className="expanded-date">
            {item.giftingDate
              ? new Date(item.giftingDate).toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : t('cards.reserved.ongoing')}
          </p>

          {/* Клік по кнопці Details (Мобілка) */}
          <button
            className={`mobile-details`}
            onClick={onItemClick}
          >
            <span>{t('cards.reserved.detailsBtn')}</span> <SvgArrowFullRight />
          </button>
        </div>
      )}
    </div>
  );
}