import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatCard } from '../../components/common/StatCard';
import { SvgSearch } from '../../components/common/Icons';
import { SharedWishlistCard } from '../../components/common/SharedWishlistCard';
import { fetchSharedWishlists } from '../../api/wishlists';
import type { Wishlist } from '@/types';
import '../../styles/sharedwishes.css';

export function SharedWishesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Active'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sharedLists, setSharedLists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedWishlists()
      .then((data) => {
        setSharedLists(data);
      })
      .catch((err) => {
        console.error("Error fetching shared wishlists:", err);
        setError(err instanceof Error ? err.message : "Failed to load shared wishlists.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalLists = sharedLists.length;
  
  // Логіка визначення статусу за датою
  const getListStatus = (giftingDate?: string | null): 'Upcoming' | 'Active' | 'Completed' => {
    if (!giftingDate) return 'Upcoming'; // Якщо дати немає, за замовчуванням Upcoming
    
    // Скидаємо години/хвилини, щоб порівнювати лише дати
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const giftDate = new Date(giftingDate);
    giftDate.setHours(0, 0, 0, 0);

    const timeDiff = giftDate.getTime() - today.getTime();

    if (timeDiff < 0) return 'Completed'; // Дата минула
    if (timeDiff === 0) return 'Active';  // Дата сьогодні
    return 'Upcoming';                    // Дата в майбутньому
  };

  // Актуальні дані для StatCard
  const upcomingEventsCount = sharedLists.filter(list => getListStatus(list.giftingDate) === 'Upcoming').length;
  const totalReservedGifts = sharedLists.reduce((sum, list) => sum + (list.reservedCount || 0), 0);

  const filteredLists = sharedLists.filter((list) => {
    if (list.visibility === 'Only me') return false;

    const title = list.title || '';
    const ownerName = list.authorName || t('sharedWishes.defaultUser');
    const status = getListStatus(list.giftingDate);

    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'All') return true; 
    return status === activeTab;
  });

  if (loading) {
    return (
      <div className="shared-wishes-page-view">
        <p style={{ textAlign: 'center', marginTop: '40px', fontFamily: 'var(--font-lato)', color: 'var(--color-gray)' }}>
          {t('sharedWishes.loading')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-wishes-page-view">
        <div style={{ color: 'var(--color-red)', backgroundColor: 'var(--color-red-bg)', padding: '16px', borderRadius: '12px', textAlign: 'center', marginTop: '20px' }}>
          {t('sharedWishes.error')} {error}
        </div>
      </div>
    );
  }

  return (
    <div className="shared-wishes-page-view">
      
      <div className="shared-header-row">
        <div className="header-titles-block">
          <h1 className="page-title">{t('sharedWishes.title')}</h1>
          <p className="page-subtitle">{t('sharedWishes.subtitle')}</p>
        </div>
        
        <div className="search-input-wrapper">
          <span className="search-icon-glass">
            <SvgSearch/>
          </span>
          <input 
            type="text" 
            placeholder={t('sharedWishes.searchPlaceholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="shared-analytics-grid">
        <StatCard count={totalLists} label={t('sharedWishes.stats.sharedLists')} countColor="var(--color-indigo)" />
        <StatCard count={upcomingEventsCount} label={t('sharedWishes.stats.upcomingEvents')} countColor="var(--color-green)" />
        <StatCard count={totalReservedGifts} label={t('sharedWishes.stats.reservedGifts')} countColor="var(--color-brown)" />
      </section>

      <div className="filter-toolbar-row">
        <div className="tabs-pill-container">
          {(['All', 'Upcoming', 'Active', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              className={`tab-pill-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {t(`sharedWishes.tabs.${tab}`)}
            </button>
          ))}
        </div>
        <span className="results-counter-label">{t('sharedWishes.listsCount', { count: filteredLists.length })}</span>
      </div>

      <div className="wishlists-cards-grid">
        {filteredLists.length === 0 ? (
          <p className="no-results-message" style={{ color: 'var(--color-gray)', gridColumn: '1 / -1', textAlign: 'center', marginTop: '32px', fontFamily: 'var(--font-lato)' }}>
            {t('sharedWishes.noResults')}
          </p>
        ) : (
          filteredLists.map((list) => {
            const displayOwnerName = list.authorName || t('sharedWishes.defaultUser');
            const displayInitial = displayOwnerName.charAt(0).toUpperCase();
            
            let displayDate = t('sharedWishes.ongoing');
            if (list.giftingDate) {
              displayDate = new Date(list.giftingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }

            return (
              <SharedWishlistCard 
                key={list.id}
                title={list.title}
                ownerName={displayOwnerName}
                ownerInitial={displayInitial}
                ownerAvatarUrl={list.authorAvatarUrl}
                imageUrl={list.imageUrl}
                itemCount={list.itemCount}
                dateString={displayDate}
                reservedCount={list.reservedCount || 0}
                status={getListStatus(list.giftingDate)}
                onOpen={() => navigate(`/wishlists/${list.id}`)} 
              />
            );
          })
        )}
      </div>

    </div>
  );
}