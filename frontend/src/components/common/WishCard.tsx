import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/components/WishCard.css'
import { MainButton } from './MainButton';
import { SvgEdit, SvgWarning, SvgDots } from './Icons';

interface ItemCardProps {
  id: string;
  title: string;
  price: string | number;
  description?: string;
  externalLink?: string;
  imageUrl?: string;
  isReserved?: boolean;
  isMyWishlist?: boolean; 
  reservedByMe?: boolean; 
  mockButton?: boolean;
  mockAction?: () => void;
  onCardClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onReserveClick?: () => void;
  onReservedByYouClick?: () => void;
}

export const WishCard: React.FC<ItemCardProps> = ({
  id,
  title,
  price,
  imageUrl,
  isReserved = false,
  isMyWishlist = false,
  reservedByMe = false,
  mockButton = false,
  mockAction,
  onCardClick,
  onEditClick,
  onDeleteClick,
  onReserveClick,
  onReservedByYouClick
}) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
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

  const cardClick = () => {
    if (!onCardClick) return
    if (isMyWishlist) {
      onCardClick()
    } else {
      if (isReserved) {
        if (reservedByMe) {
          if (onReservedByYouClick) onReservedByYouClick()
        } else {
          onCardClick()
        }
      } else {
        if (onReserveClick) onReserveClick()
      }
    }
  }

  // Визначаємо, яку кнопку показувати
  const renderActionBtn = () => {
    if (isMyWishlist) {
      if (isReserved) {
        return (
          <MainButton
            text={t('cards.wish.reservedBtn')}
            backgroundColor="var(--color-white)"
            hoverColor=''
            textColor="var(--color-gray-mute)"
            style={{ border: "var(--border-main)", cursor: "not-allowed" }}
            onClick={(e) => e.stopPropagation()}
            small={true}
          />
        );
      } else {
        return (
          <MainButton
            text={t('cards.wish.awaitingBtn')}
            backgroundColor="var(--color-green-bg)"
            textColor="var(--color-green)"
            style={{ border: "var(--border-main)", cursor: "not-allowed", pointerEvents: "none" }}
            onClick={(e) => e.stopPropagation()}
            small={true}
          />
        );
      }
    } else {
      // НЕ мій вішліст
      if (isReserved) {
        if (reservedByMe) {
          return (
            <MainButton
              text={t('cards.wish.reservedByYouBtn')}
              backgroundColor="var(--color-blue-dark)"
              hoverColor="var(--color-blue-dark-hover)"
              textColor="var(--color-white)"
              onClick={(e) => {
                e.stopPropagation();
                if (onReservedByYouClick) onReservedByYouClick()
              }}
              small={true}
            />
          );
        } else {
          return (
            <MainButton
              text={t('cards.wish.reservedBtn')}
              backgroundColor="var(--color-white)"
              textColor="var(--color-gray-mute)"
              hoverColor=''
              style={{ border: "var(--border-main)", cursor: "not-allowed" }}
              onClick={(e) => e.stopPropagation()}
              small={true}
            />
          );
        }
      } else {
        return (
          <MainButton
            text={t('cards.wish.reserveBtn')}
            backgroundColor="var(--color-pink-light)"
            hoverColor='var(--color-pink-light-hover)'
            textColor="var(--color-pink)"
            onClick={(e) => {
              e.stopPropagation();
              if (mockButton && mockAction) mockAction()
              else if (onReserveClick) onReserveClick();
            }}
            small={true}
          />
        );
      }
    }
  };

  return (
    <div className={`item-card ${isReserved && !reservedByMe ? 'is-reserved' : ''} ${reservedByMe ? 'is-reserved-by-me' : ''}`}>
      <div className='item-head-wrap'>
        {!mockButton && isMyWishlist && (
          <>
            <div className='item-head-controls desktop-controls'>
              <MainButton
                text={t('cards.wish.editBtn')}
                backgroundColor="var(--color-white)"
                hoverColor="var(--color-pink-bg)"
                textColor="var(--color-gray)"
                icon={<SvgEdit />}
                style={{ border: "1px solid var(--color-border)" }}
                onClick={(e) => { e.stopPropagation(); if (onEditClick) onEditClick(); }}
                small={true}
              />
              <MainButton
                text={t('cards.wish.deleteBtn')}
                backgroundColor="var(--color-red-bg)"
                hoverColor='var(--color-red-light-hover)'
                textColor="var(--color-red)"
                icon={<SvgWarning />}
                onClick={(e) => { e.stopPropagation(); if (onDeleteClick) onDeleteClick(); }}
                small={true}
              />
            </div>

            <div className="mobile-controls" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              {mobileMenuOpen && (
                <div className="wishlist-head-controls-mobile">
                  <MainButton
                    text={t('cards.wish.editBtn')}
                    backgroundColor="var(--color-white)"
                    hoverColor="var(--color-pink-bg)"
                    textColor="var(--color-gray)"
                    icon={<SvgEdit />}
                    style={{ border: "1px solid var(--color-border)" }}
                    onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); if (onEditClick) onEditClick(); }}
                    small={true}
                  />
                  <MainButton
                    text={t('cards.wish.deleteBtn')}
                    backgroundColor="var(--color-red-bg)"
                    hoverColor='var(--color-red-light-hover)'
                    textColor="var(--color-red)"
                    icon={<SvgWarning />}
                    onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); if (onDeleteClick) onDeleteClick(); }}
                    small={true}
                  />
                </div>
              )}
              <MainButton
                icon={<SvgDots />}
                onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(v => !v); }}
                backgroundColor="var(--color-white)"
                hoverColor="var(--color-pink-bg)"
                textColor="var(--color-gray)"
                style={{ border: "1px solid var(--color-border)" }}
                small={true}
              />
            </div>
          </>
        )}

        {imageUrl ? (
          <div className="item-image-wrap">
            <img src={imageUrl} alt={title} className="item-image" loading="lazy" />
          </div>
        ) : (
          <div className="item-image-placeholder"></div>
        )}
      </div>

      <div className="item-body" style={{ cursor: mockButton ? 'default' : 'pointer' }} onClick={cardClick}>
        <div>
          <h3 className="item-title">{title}</h3>
          <p className="item-price">${price}</p>
        </div>

        {renderActionBtn()}
      </div>
    </div>
  );
};