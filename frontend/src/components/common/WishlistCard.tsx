import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/components/WishlistCard.css';
import { SvgArrowFullRight, SvgCheckmark, SvgDots, SvgEdit, SvgSettings, SvgShare, SvgWarning } from './Icons';
import { MainButton } from './MainButton';

interface WishlistCardProps {
  title: string;
  count: number;
  link: string;
  imageUrl?: string;
  giftingDate?: string;
  onSettingsClick?: () => void;
  onDeleteClick?: () => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ title, count, link, imageUrl, giftingDate, onSettingsClick, onDeleteClick }) => {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const formattedDate = giftingDate
    ? new Intl.DateTimeFormat(i18n.language === 'uk' ? 'uk-UA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(giftingDate))
    : null;

  const handleShare = async () => {
    try {
      const fullShareLink = `${window.location.origin}${link}`;
      await navigator.clipboard.writeText(fullShareLink);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div className="wishlist-card">
      <div className='wishlist-head-wrap'>
        <div className="wishlist-head-controls desktop-controls">
          <MainButton text={t('cards.wishlist.settingsBtn')} backgroundColor="var(--color-white)" hoverColor="var(--color-pink-bg)" textColor="var(--color-gray)" icon={<SvgSettings />} style={{ border: "1px solid var(--color-border)" }} onClick={onSettingsClick} small={true} />
          <MainButton text={t('cards.wishlist.deleteBtn')} backgroundColor="var(--color-red-bg)" hoverColor='var(--color-red-light-hover)' textColor="var(--color-red)" icon={<SvgWarning />} onClick={onDeleteClick} small={true} />
          <MainButton text={copied ? t('cards.wishlist.copiedBtn') : t('cards.wishlist.shareBtn')} backgroundColor="var(--color-pink)" textColor="var(--color-white)" icon={copied ? <SvgCheckmark /> : <SvgShare />} onClick={handleShare} style={{ width: "100%" }} small={true} />
        </div>
        <div className="mobile-controls" ref={menuRef}>
          {mobileMenuOpen && (
            <div className="wishlist-head-controls-mobile">
              <MainButton text={t('cards.wishlist.settingsBtn')} backgroundColor="var(--color-white)" hoverColor="var(--color-pink-bg)" textColor="var(--color-gray)" icon={<SvgSettings />} style={{ border: "1px solid var(--color-border)" }} onClick={onSettingsClick} small={true} />
              <MainButton text={t('cards.wishlist.deleteBtn')} backgroundColor="var(--color-red-bg)" hoverColor='var(--color-red-light-hover)' textColor="var(--color-red)" icon={<SvgWarning />} onClick={onDeleteClick} small={true} />
              <MainButton text={copied ? t('cards.wishlist.copiedBtn') : t('cards.wishlist.shareBtn')} backgroundColor="var(--color-pink)" textColor="var(--color-white)" icon={copied ? <SvgCheckmark /> : <SvgShare />} onClick={handleShare} style={{ width: "100%" }} small={true} />
            </div>
          )}
          <MainButton icon={<SvgDots />} onClick={() => setMobileMenuOpen(v => !v)} backgroundColor="var(--color-white)" hoverColor="var(--color-pink-bg)" textColor="var(--color-gray)" style={{ border: "1px solid var(--color-border)" }} small={true}
          />
        </div>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="wishlist-card-image" />
        ) : (
          <div className="card-image-placeholder"></div>
        )}
      </div>

      <div className="card-body">
        <div>
          <h3>{title}</h3>
          <p className="card-count">{count} {t('cards.wishlist.items')}{formattedDate ? ` · ${formattedDate}` : ''}</p>
        </div>
        <Link to={link} className="card-link">
          {t('cards.wishlist.openBtn')} <SvgArrowFullRight />
        </Link>
      </div>
    </div>
  );
};