import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/reservation.css';
import { ReservedItem } from '@/types';
import { SvgLock, SvgLink } from '@/components/common/Icons';
import { ReservedItemCard } from '@/components/common/ReservedItemCard';
import { fetchReservedByMeItems, fetchReservedForMeItems } from '@/api/items';
import { ModaL } from "@/components/common/Modal";
import { MainButton } from "@/components/common/MainButton";

type TabType = 'madeByMe' | 'madeForMe';

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

export function ReservationPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('madeByMe');
  const [items, setItems] = useState<ReservedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewingItem, setViewingItem] = useState<ReservedItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchFn = activeTab === 'madeByMe' ? fetchReservedByMeItems : fetchReservedForMeItems;

    fetchFn()
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching reservations:", error))
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const getListStatus = (giftingDate?: string | null): 'Upcoming' | 'Active' | 'Completed' => {
    if (!giftingDate) return 'Upcoming';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const giftDate = new Date(giftingDate);
    giftDate.setHours(0, 0, 0, 0);

    const timeDiff = giftDate.getTime() - today.getTime();

    if (timeDiff < 0) return 'Completed';
    if (timeDiff === 0) return 'Active';
    return 'Upcoming';
  };

  return (
    <div className="reservation-page-container">
      <div className="reservation-header-layout">
        <div className="reservation-header-text">
          <h1>{t('reservations.title')}</h1>
          <div className="reservation-tabs">
            <button
              className={`reservation-tab ${activeTab === 'madeByMe' ? 'active' : ''}`}
              onClick={() => setActiveTab('madeByMe')}
            >
              {t('reservations.tabs.madeByMe')}
            </button>
            <button
              className={`reservation-tab ${activeTab === 'madeForMe' ? 'active' : ''}`}
              onClick={() => setActiveTab('madeForMe')}
            >
              {t('reservations.tabs.madeForMe')}
            </button>
          </div>
          <p className="reservation-tab-description-text">
            {activeTab === 'madeByMe'
              ? t('reservations.desc.madeByMe')
              : t('reservations.desc.madeForMe')
            }
          </p>
        </div>

        <div className="alert-box">
          <div className="alert-icon">
            <SvgLock />
          </div>
          <div className="alert-text">
            <p className='alert-text-title'>{t('reservations.alert.title')}</p>
            <p className='alert-text-description'>
              {activeTab === 'madeByMe'
                ? t('reservations.alert.madeByMe')
                : t('reservations.alert.madeForMe')
              }
            </p>
          </div>
        </div>
      </div>

      {items.length > 0 && <div className="reservation-column-headers desktop-only">
        <p className="header-name">{t('reservations.columns.name')}</p>
        <p className="header-wishlist">{t('reservations.columns.wishlist')}</p>
        <p className="header-date">{t('reservations.columns.giftingDay')}</p>
        <p className="header-status">{t('reservations.columns.status')}</p>
      </div>}

      <div className="reservation-list">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-gray)', padding: '2em' }}>
            {t('reservations.loading')}
          </p>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-gray)', padding: '2em' }}>
            {t('reservations.empty')}
          </p>
        ) : (
          items.map(item => (
            <ReservedItemCard
              key={item.id}
              item={item}
              onItemClick={() => setViewingItem(item)}
              onWishlistClick={() => navigate(`/wishlists/${item.wishlistId}`)}
              hideAuthor={activeTab === 'madeForMe'}
              status={getListStatus(item.giftingDate)}
            />
          ))
        )}
      </div>

      {viewingItem && (
        <DetailsModal onClose={() => setViewingItem(null)} item={viewingItem} />
      )}
    </div>
  );
}

// ==============================================================
// Компонент модалки (адаптований під ReservedItem)
// ==============================================================
interface DetailsModalProps {
  onClose: () => void;
  item: ReservedItem;
}

function DetailsModal({ onClose, item }: DetailsModalProps) {
  const { t } = useTranslation();
  return (
    <ModaL
      onClose={onClose}
      title={t('reservations.modal.title')}
    >
      <div className="view-wish-layout">
        {item.imageUrl ? (
          <div className="view-wish-image-wrap">
            <img src={item.imageUrl} alt={item.title} />
          </div>
        ) : (
          <div className="view-wish-placeholder"></div>
        )}
        <div className="view-wish-info">
          <h3>{item.title}</h3>
          <p className="view-wish-price">{item.price} $</p>

          {/* @ts-ignore */}
          {item.description && <p className="view-wish-desc">{item.description}</p>}

          {/* @ts-ignore */}
          {item.externalLink && (
            // @ts-ignore
            <a href={normalizeUrl(item.externalLink)} target="_blank" rel="noopener noreferrer" className="view-wish-link">
              <MainButton icon={<SvgLink />} text={t('reservations.modal.link')} textColor="var(--color-blue-light)" backgroundColor="var(--color-blue-bg)" hoverColor="var(--color-blue-light-bg)" style={{ width: "100%" }} small={true} />
            </a>
          )}
        </div>
      </div>
    </ModaL>
  );
}